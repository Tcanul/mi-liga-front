<template>
  <div class="home-container">
    <!-- Banner Hero -->
    <header class="hero-banner">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <span class="hero-badge">⚽ Panel de Gestión</span>
        <h1>Administración de Ligas</h1>
        <p>Controla torneos, inscripciones y calendarios de forma centralizada.</p>
        
        <div class="hero-buttons">
          <button 
            v-if="authStore.user?.rol === 'admin' || authStore.user?.rol === 'liga_owner'" 
            class="btn-back"
            @click="router.push('/usuarios')"
          > Gestionar Usuarios
          </button>

          <!-- Botón para Crear Liga (Solo Admin y Dueño de Liga) -->
          <button 
            v-if="authStore.user?.rol === 'admin' || authStore.user?.rol === 'liga_owner'"
            class="btn-hero" 
            @click="abrirModalCrear"
          >
            <span>+</span> Crear Nueva Liga
          </button>
        </div>
      </div>
    </header>

    <!-- Barra de Búsqueda y Filtros -->
    <div class="controls-section">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input 
          v-model="filtro" 
          type="text" 
          placeholder="Buscar liga por nombre o categoría..." 
        />
      </div>
      <div class="stats-counter">
        <span>🏆 Total Ligas: <strong>{{ ligasVisibles.length }}</strong></span>
      </div>
    </div>

    <!-- Grilla de Ligas -->
    <div class="ligas-grid">
      <div 
        v-for="liga in ligasVisibles" 
        :key="liga.id" 
        :class="['liga-card', (authStore.user?.rol === 'capitan' && !capitanTieneAccesoA(liga.id)) ? 'disabled-card' : '']"
      >
        <div class="liga-info" @click="ingresarALiga(liga)" style="cursor: pointer;">
          <!-- ⚽ Cabecera de la tarjeta con Logo y Título -->
          <div class="liga-card-header-info">
            <div class="liga-logo-container">
              <img v-if="liga.logo" :src="liga.logo" alt="Logo Liga" class="liga-logo-img" />
              <div v-else class="liga-logo-placeholder">⚽</div>
            </div>
            <div class="liga-titles">
              <h3>{{ liga.nombre }}</h3>
              <p class="categoria">Categoría: <strong>{{ liga.categoria }}</strong></p>
            </div>
          </div>
          <p class="equipos-count">⚽ Equipos inscritos: {{ liga.totalEquipos || 0 }}</p>
        </div>

        <!-- Footer de la tarjeta con acciones de administración y acceso -->
        <div class="liga-card-footer">
          <!-- Acciones de Edición/Eliminación visibles solo para Admin y Dueño de la Liga -->
          <div class="admin-actions" v-if="authStore.user?.rol === 'admin' || authStore.user?.rol === 'liga_owner'">
            <button class="btn-icon" title="Editar Liga" @click.stop="abrirModalEditar(liga)">✏️</button>
            <button class="btn-icon delete" title="Eliminar Liga" @click.stop="eliminar(liga.id)">🗑️</button>
          </div>

          <!-- Botón de Acceso -->
          <button 
            class="btn-primary" 
            :disabled="authStore.user?.rol === 'capitan' && !capitanTieneAccesoA(liga.id)"
            @click="ingresarALiga(liga)"
          >
            {{ (authStore.user?.rol === 'capitan' && !capitanTieneAccesoA(liga.id)) ? '🔒 Sin acceso' : 'Entrar' }}
          </button>
        </div>
      </div>

      <div v-if="ligasVisibles.length === 0" class="empty-state">
        <p>No hay ligas disponibles para mostrar.</p>
      </div>
    </div>

    <!-- Modal Dinámico para Crear / Editar Liga -->
    <div v-if="mostrarModal" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ modoEdicion ? '✏️ Editar Liga' : '✨ Registrar Nueva Liga' }}</h2>
          <button class="close-btn" @click="cerrarModal">&times;</button>
        </div>
        <form @submit.prevent="guardarLiga">
          <div class="form-group">
            <label>Nombre de la Liga</label>
            <input 
              v-model="formulario.nombre" 
              type="text" 
              placeholder="Ej. Liga Municipal Dominical" 
              required 
            />
          </div>

          <div class="form-group">
            <label>Categoría</label>
            <select v-model="formulario.categoria" required>
              <option value="" disabled>Selecciona una categoría</option>
              <option value="Libre">Libre</option>
              <option value="Veteranos">Veteranos</option>
              <option value="Femenil">Femenil</option>
              <option value="Juvenil">Juvenil</option>
              <option value="Infantil">Infantil</option>
            </select>
          </div>

          <!-- Dentro del formulario de Crear/Editar Liga -->
          <div class="form-group full-width">
            <label>Logo de la Liga (Subir desde tu dispositivo)</label>
            <input type="file" accept="image/*" @change="onFileSelected" class="file-input" />
            
            <!-- Vista previa de la imagen seleccionada -->
            <div v-if="formulario.logo" class="logo-preview-container">
              <img :src="formulario.logo" alt="Vista previa del logo" class="preview-img" />
              <span class="preview-text">Logo seleccionado</span>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="cerrarModal">
              Cancelar
            </button>
            <button type="submit" class="btn-primary">
              {{ modoEdicion ? 'Guardar Cambios' : 'Crear Liga' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLigaStore } from '@/stores/ligaStore'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const ligaStore = useLigaStore()
const authStore = useAuthStore()

const filtro = ref('')
const mostrarModal = ref(false)
const modoEdicion = ref(false)
const ligaIdEditando = ref(null)

const equiposGlobales = ref([])

const formulario = ref({
  nombre: '',
  categoria: '',
  logo: ''
})

onMounted(async () => {
  await ligaStore.obtenerLigas()
  await obtenerTodosLosEquiposGlobales()
})

function abrirModalCrear() {
  modoEdicion.value = false
  formulario.value = { nombre: '', categoria: '', logo: '' }
  ligaIdEditando.value = null
  mostrarModal.value = true
}

function abrirModalEditar(liga) {
  modoEdicion.value = true
  ligaIdEditando.value = liga.id || liga._id
  // 👇 Añadimos el logo para que se cargue al editar
  formulario.value = { 
    nombre: liga.nombre, 
    categoria: liga.categoria, 
    logo: liga.logo || '' 
  }
  mostrarModal.value = true
}

function cerrarModal() {
  mostrarModal.value = false
}

const ligasVisibles = computed(() => {
  const user = authStore.user
  if (!user) return []

  let resultado = []

  if (user.rol === 'admin') {
    resultado = ligaStore.ligas
  } else if (user.rol === 'liga_owner') {
    resultado = ligaStore.ligas.filter(l => l.ownerEmail?.toLowerCase() === user.email?.toLowerCase())
  } else if (user.rol === 'capitan') {
    resultado = ligaStore.ligas
  }

  if (filtro.value.trim() !== '') {
    const texto = filtro.value.toLowerCase()
    resultado = resultado.filter(liga => 
      liga.nombre.toLowerCase().includes(texto) ||
      liga.categoria.toLowerCase().includes(texto)
    )
  }

  return resultado
})

async function guardarLiga() {
  if (!formulario.value.nombre || !formulario.value.categoria) return

  // Imprimimos en consola qué es lo que se va a enviar exactamente
  console.log("3. Datos a enviar en guardarLiga:", {
    nombre: formulario.value.nombre,
    categoria: formulario.value.categoria,
    logoLength: formulario.value.logo ? formulario.value.logo.length : 0
  })
   try {

  const datosPayload = {
    nombre: formulario.value.nombre,
    categoria: formulario.value.categoria,
    ownerEmail: authStore.user?.email || '',
    logo: formulario.value.logo || ''
  }

  if (modoEdicion.value) {
    await ligaStore.actualizarLiga(ligaIdEditando.value, datosPayload)
  } else {
    await ligaStore.crearLiga(datosPayload)
  }
  
  cerrarModal()
  await ligaStore.obtenerLigas()
  } catch (error) {
    // 💡 Capturamos el mensaje de tope máximo enviado por el backend y lo mostramos al usuario
    alert(error.message || 'Ocurrió un error al guardar la liga.')
  }
}

async function eliminar(id) {
  if (confirm('¿Estás seguro de que deseas eliminar esta liga? Se borrarán sus datos asociados.')) {
    await ligaStore.eliminarLiga(id)
  }
}

function capitanTieneAccesoA(ligaId) {
  if (authStore.user?.rol !== 'capitan') return true
  return equiposGlobales.value.some(eq => 
    (eq.ligaId === ligaId || eq.ligaId?._id === ligaId) && 
    eq.capitanEmail?.toLowerCase() === authStore.user.email?.toLowerCase()
  )
}

function ingresarALiga(liga) {
  if (authStore.user?.rol === 'capitan' && !capitanTieneAccesoA(liga.id)) {
    alert('No tienes ningún equipo asignado en esta liga.')
    return
  }
  router.push(`/liga/${liga.id}`)
}

async function obtenerTodosLosEquiposGlobales() {
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    const res = await fetch(`${API_URL}/api/equipos-globales`)
    if (res.ok) {
      equiposGlobales.value = await res.json()
    }
  } catch (error) {
    console.error('Error al obtener equipos globales para validación:', error)
  }
}

// Función para convertir la imagen del dispositivo a Base64
function onFileSelected(event) {
  const file = event.target.files[0]
  if (file) {
    console.log("1. Archivo seleccionado:", file.name, file.type, file.size)

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen es demasiado pesada. Elige una menor a 2 MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      formulario.value.logo = e.target.result // Asigna el Base64
      console.log("2. Logo convertido a Base64 con éxito. Primeros caracteres:", formulario.value.logo.substring(0, 30))
    }
    reader.readAsDataURL(file)
  }
}
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  font-family: 'Inter', system-ui, sans-serif;
  color: #1e293b;
  box-sizing: border-box;
}

.hero-banner {
  position: relative;
  background-image: url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop');
  background-size: cover;
  background-position: center;
  border-radius: 16px;
  padding: 2.5rem 1.5rem;
  color: white;
  margin-bottom: 2rem;
  overflow: hidden;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.75));
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 650px;
}

.hero-badge {
  background: #10b981;
  color: #fff;
  padding: 0.35rem 0.8rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
}

.hero-banner h1 {
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  margin: 0.75rem 0 0.5rem 0;
  font-weight: 800;
  line-height: 1.2;
}

.hero-banner p {
  color: #cbd5e1;
  margin-bottom: 1.5rem;
  font-size: clamp(0.9rem, 2vw, 1rem);
}

.hero-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.btn-hero, .btn-back {
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.btn-hero {
  background: #10b981;
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.btn-back {
  background: #e2e8f0;
  color: #334155;
  border: none;
}

.controls-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 100%;
}

@media(min-width: 640px) {
  .search-box {
    min-width: 280px;
  }
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
}

.search-box input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.8rem;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.95rem;
  background: white;
  box-sizing: border-box;
}

.stats-counter {
  background: white;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  color: #475569;
  width: 100%;
  text-align: center;
}

@media(min-width: 640px) {
  .stats-counter {
    width: auto;
  }
}

.ligas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.liga-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
  transition: all 0.25s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.liga-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.1);
}

.liga-info {
  padding: 1.25rem;
  flex-grow: 1;
}

.liga-info h3 {
  margin: 0 0 0.5rem 0;
  color: #0f172a;
  font-size: 1.15rem;
}

.liga-info p {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0.25rem 0;
}

.liga-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
}

.admin-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: #e2e8f0;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  transition: background 0.2s;
}

.btn-icon:hover {
  background: #cbd5e1;
}

.btn-icon.delete:hover {
  background: #fee2e2;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  padding: 1rem;
}

.modal-content {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
}

@media(min-width: 640px) {
  .modal-content {
    padding: 2.25rem;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #94a3b8;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 2rem;
}

.btn-primary {
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.65rem 1.1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-secondary {
  background: #e2e8f0;
  color: #475569;
  border: none;
  padding: 0.65rem 1.1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  color: #94a3b8;
  padding: 3rem 0;
}
/* Estilos para el logo en la tarjeta de la liga */
.liga-card-header-info {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 0.75rem;
}

.liga-logo-container {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f1f5f9;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid #e2e8f0;
}

.liga-logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.liga-logo-placeholder {
  font-size: 1.25rem;
}

.liga-titles h3 {
  margin: 0 0 0.2rem 0;
  color: #0f172a;
  font-size: 1.1rem;
}

.liga-titles .categoria {
  margin: 0;
  color: #64748b;
  font-size: 0.85rem;
}

.liga-info .equipos-count {
  color: #475569;
  font-size: 0.85rem;
  margin: 0;
  padding-top: 0.5rem;
  border-top: 1px solid #f1f5f9;
}
/* Contenedor de la vista previa del logo en el modal */
.logo-preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  gap: 0.5rem;
}

/* Tamaño fijo y controlado para la miniatura de previsualización */
.preview-img {
  width: 70px;
  height: 70px;
  object-fit: cover; /* Recorta limpiamente la imagen si no es cuadrada */
  border-radius: 50%; /* Opcional: la vuelve circular, puedes cambiarlo a 8px si prefieres escudo cuadrado */
  border: 2px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Texto descriptivo debajo de la miniatura */
.preview-text {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}
</style>