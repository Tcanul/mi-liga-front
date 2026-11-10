<template>
  <div class="public-container">
    <!-- Barra superior de navegación -->
    <header class="public-header">
      <div class="header-brand">
        <span class="logo-icon">⚽</span>
        <span class="brand-title">Mi Liga de Fútbol</span>
      </div>
      <div class="header-actions">
        <router-link to="/login" class="btn-login">
          Iniciar Sesión
        </router-link>
      </div>
    </header>

    <!-- Contenido Principal -->
    <main class="main-content">
      <div class="page-title-container">
        <h1>Tabla General de Posiciones</h1>
        <p>Selecciona una liga para consultar las estadísticas actualizadas del torneo.</p>
      </div>

      <!-- Selector de Ligas -->
      <div class="selector-container">
        <label for="liga-select">Seleccionar Torneo / Liga:</label>
        <select 
          id="liga-select" 
          v-model="ligaSeleccionadaId" 
          @change="cambiarLiga"
        >
          <option value="" disabled>-- Elige una liga --</option>
          <option v-for="liga in ligas" :key="liga._id || liga.id" :value="liga._id || liga.id">
            {{ liga.nombre }}
          </option>
        </select>
      </div>

      <!-- Tabla de Posiciones -->
      <div class="table-card">
        <div class="table-responsive">
          <table class="ranking-table">
            <thead>
              <tr>
                <th class="text-center">Pos</th>
                <th>Equipo</th>
                <th class="text-center">JJ</th>
                <th class="text-center">JG</th>
                <th class="text-center">JE</th>
                <th class="text-center">JP</th>
                <th class="text-center">GF</th>
                <th class="text-center">GC</th>
                <th class="text-center">DIF</th>
                <th class="text-center pts-col">Pts</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(equipo, index) in tablaPosiciones" :key="equipo._id || equipo.id || index">
                <td class="text-center fw-bold">
                  <span class="pos-badge" :class="{'pos-top': index < 3}">{{ index + 1 }}</span>
                </td>
                <td class="team-cell">
                  <div class="team-info">
                    <span 
                      v-if="equipo.logo" 
                      class="team-logo" 
                      :style="{ backgroundImage: `url(${equipo.logo})` }"
                    ></span>
                    <span v-else class="team-logo-placeholder">⚽</span>
                    <span class="team-name">{{ equipo.nombre }}</span>
                  </div>
                </td>
                <td class="text-center">{{ equipo.jj }}</td>
                <td class="text-center">{{ equipo.jg }}</td>
                <td class="text-center">{{ equipo.je }}</td>
                <td class="text-center">{{ equipo.jp }}</td>
                <td class="text-center">{{ equipo.gf }}</td>
                <td class="text-center">{{ equipo.gc }}</td>
                <td class="text-center fw-bold" :class="equipo.dg >= 0 ? 'text-positive' : 'text-negative'">
                  {{ equipo.dg > 0 ? `+${equipo.dg}` : equipo.dg }}
                </td>
                <td class="text-center pts-val">{{ equipo.pts }}</td>
              </tr>
              <tr v-if="cargando">
                <td colspan="10" class="state-message">
                  <div class="spinner"></div>
                  Cargando estadísticas...
                </td>
              </tr>
              <tr v-else-if="tablaPosiciones.length === 0">
                <td colspan="10" class="state-message">
                  No hay equipos registrados en esta liga.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 📢 SECCIÓN DE AVISOS ACTIVOS DE LA LIGA (GRIDVIEW - COLOCADA DEBAJO DE LA TABLA) -->
      <div v-if="avisosActivos.length > 0" class="avisos-public-section">
        <h3 class="avisos-section-title">📢 Avisos Oficiales del Torneo</h3>
        <div class="avisos-grid-public">
          <div v-for="aviso in avisosActivos" :key="aviso._id" class="aviso-public-card">
            <div class="aviso-card-date">
              <span>📅 {{ new Date(aviso.createdAt).toLocaleDateString() }}</span>
            </div>
            <div class="aviso-card-text">
              <p>{{ aviso.texto }}</p>
            </div>
            <!-- Botón condicional si el texto es extenso -->
            <div v-if="aviso.texto && aviso.texto.length > 120" class="aviso-card-action">
              <button class="btn-leer-mas" @click="abrirPopupAviso(aviso)">Ver completo</button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 🪟 POPUP / MODAL PARA AVISOS EXTENSOS -->
    <div v-if="modalAvisoAbierto" class="modal-overlay-public" @click.self="cerrarPopupAviso">
      <div class="modal-content-public">
        <div class="modal-header-public">
          <h3>📢 Aviso Importante</h3>
          <button class="close-btn-public" @click="cerrarPopupAviso">&times;</button>
        </div>
        <div class="modal-body-public">
          <p>{{ avisoSeleccionado?.texto }}</p>
        </div>
        <div class="modal-footer-public">
          <button class="btn-cerrar-popup" @click="cerrarPopupAviso">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- Pie de página -->
    <footer class="public-footer">
      <p>Mi Liga de Fútbol &copy; 2026 - Todos los derechos reservados</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '')

const ligas = ref([])
const ligaSeleccionadaId = ref('')
const equiposDeLiga = ref([])
const cargando = ref(false)

// Estados para los avisos públicos
const avisosLiga = ref([])
const modalAvisoAbierto = ref(false)
const avisoSeleccionado = ref(null)

// Filtrar únicamente los avisos que estén activos (activo: true)
const avisosActivos = computed(() => {
  return avisosLiga.value.filter(a => a.activo === true)
})

// Función computada para ordenar y calcular los puntos y diferencia de goles
const tablaPosiciones = computed(() => {
  if (!equiposDeLiga.value || equiposDeLiga.value.length === 0) return []

  return [...equiposDeLiga.value].map(eq => {
    const jj = Number(eq.jj) || 0
    const jg = Number(eq.jg) || 0
    const je = Number(eq.je) || 0
    const jp = Number(eq.jp) || 0
    const gf = Number(eq.gf) || 0
    const gc = Number(eq.gc) || 0
    const ptsExtras = Number(eq.ptsExtras) || 0
    
    const dg = gf - gc
    const pts = (jg * 3) + (je * 1) + ptsExtras

    return { ...eq, jj, jg, je, jp, gf, gc, dg, ptsExtras, pts }
  }).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts
    if (b.dg !== a.dg) return b.dg - a.dg
    return b.gf - a.gf
  })
})

// Al cargar el componente, traemos la lista de ligas públicas
onMounted(async () => {
  cargando.value = true
  try {
    const resLigas = await fetch(`${API_URL}/api/ligas`)
    if (!resLigas.ok) throw new Error('Error al obtener las ligas')
    
    const dataLigas = await resLigas.json()
    ligas.value = Array.isArray(dataLigas) ? dataLigas : (dataLigas.ligas || dataLigas.data || [])

    // Si hay ligas, seleccionamos la primera y cargamos sus equipos y avisos
    if (ligas.value.length > 0) {
      const primeraLiga = ligas.value[0]
      ligaSeleccionadaId.value = primeraLiga._id || primeraLiga.id
      await cargarDatosLiga(ligaSeleccionadaId.value)
    }
  } catch (error) {
    console.error('Error al inicializar la vista pública:', error)
  } finally {
    cargando.value = false
  }
})

// Función unificada cuando el usuario cambia de liga en el combo
const cambiarLiga = async () => {
  if (!ligaSeleccionadaId.value) return
  await cargarDatosLiga(ligaSeleccionadaId.value)
}

// Carga en paralelo o secuencia los equipos y los avisos de la liga seleccionada
const cargarDatosLiga = async (ligaId) => {
  cargando.value = true
  try {
    await Promise.all([
      cargarEquiposDeLiga(ligaId),
      cargarAvisosPublicos(ligaId)
    ])
  } catch (error) {
    console.error('Error al cargar datos de la liga:', error)
  } finally {
    cargando.value = false
  }
}

// Trae los equipos de la liga seleccionada
const cargarEquiposDeLiga = async (ligaId) => {
  const response = await fetch(`${API_URL}/api/ligas/${ligaId}/equipos`)
  if (!response.ok) throw new Error('Error al obtener los equipos de la liga')
  const data = await response.json()
  equiposDeLiga.value = Array.isArray(data) ? data : (data.equipos || data.data || [])
}

// Trae los avisos creados por la liga desde el backend
const cargarAvisosPublicos = async (ligaId) => {
  try {
    const response = await fetch(`${API_URL}/api/ligas/${ligaId}/avisos`)
    if (response.ok) {
      const data = await response.json()
      avisosLiga.value = Array.isArray(data) ? data : []
    } else {
      avisosLiga.value = []
    }
  } catch (error) {
    console.error('Error al obtener avisos públicos:', error)
    avisosLiga.value = []
  }
}

// Métodos para controlar el popup de lectura de avisos largos
const abrirPopupAviso = (aviso) => {
  avisoSeleccionado.value = aviso
  modalAvisoAbierto.value = true
}

const cerrarPopupAviso = () => {
  modalAvisoAbierto.value = false
  avisoSeleccionado.value = null
}
</script>

<style scoped>
/* Estilos Generales */
.public-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #f8fafc;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

/* Header */
.public-header {
  background: rgba(15, 23, 42, 0.95);
  border-bottom: 1px solid #334155;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(8px);
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  font-size: 1.5rem;
}

.brand-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #34d399;
  letter-spacing: 0.5px;
}

.btn-login {
  background: #059669;
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}

.btn-login:hover {
  background: #047857;
  transform: translateY(-1px);
}

/* Main Content */
.main-content {
  flex: 1;
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
  padding: 2.5rem 1rem;
  box-sizing: border-box;
}

.page-title-container {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title-container h1 {
  font-size: 2.2rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
}

.page-title-container p {
  color: #94a3b8;
  font-size: 1rem;
  margin: 0;
}

/* Selector de Ligas */
.selector-container {
  max-width: 400px;
  margin: 0 auto 2rem auto;
  text-align: center;
}

.selector-container label {
  display: block;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #cbd5e1;
  margin-bottom: 0.5rem;
  letter-spacing: 0.5px;
}

.selector-container select {
  width: 100%;
  background: #1e293b;
  border: 2px solid #475569;
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  outline: none;
  cursor: pointer;
  transition: all 0.2s;
}

.selector-container select:focus {
  border-color: #34d399;
  box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.2);
}

/* 📢 ESTILOS DEL GRIDVIEW DE AVISOS (DEBAJO DE LA TABLA) */
.avisos-public-section {
  margin-top: 2.5rem;
}

.avisos-section-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #34d399;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.avisos-grid-public {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.aviso-public-card {
  background: rgba(30, 41, 59, 0.85);
  border: 1px solid #334155;
  border-left: 4px solid #34d399;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}

.aviso-public-card:hover {
  transform: translateY(-2px);
}

.aviso-card-date {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.aviso-card-text p {
  color: #e2e8f0;
  font-size: 0.92rem;
  line-height: 1.5;
  margin: 0 0 0.75rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 3; /* Trunca a 3 líneas máximo */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
}

.aviso-card-action {
  text-align: right;
  border-top: 1px solid #334155;
  padding-top: 0.6rem;
}

.btn-leer-mas {
  background: transparent;
  border: none;
  color: #34d399;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}

.btn-leer-mas:hover {
  color: #6ee7b7;
  text-decoration: underline;
}

/* Tarjeta de la Tabla */
.table-card {
  background: #1e293b;
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
  border: 1px solid #334155;
  overflow: hidden;
}

.table-responsive {
  overflow-x: auto;
}

.ranking-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  white-space: nowrap;
}

.ranking-table th {
  background: #0f172a;
  color: #94a3b8;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 1rem 0.75rem;
  border-bottom: 2px solid #334155;
}

.ranking-table td {
  padding: 0.9rem 0.75rem;
  border-bottom: 1px solid #334155;
  font-size: 0.95rem;
  color: #e2e8f0;
}

.ranking-table tbody tr:hover {
  background: rgba(52, 211, 153, 0.04);
}

/* Detalles específicos de celdas */
.text-center {
  text-align: center;
}

.fw-bold {
  font-weight: 700;
}

.pos-badge {
  display: inline-block;
  width: 24px;
  height: 24px;
  line-height: 24px;
  border-radius: 50%;
  background: #334155;
  color: #cbd5e1;
  font-size: 0.8rem;
}

.pos-top {
  background: #059669;
  color: #ffffff;
  font-weight: bold;
}

.team-cell {
  min-width: 200px;
}

.team-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.team-logo {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  background-color: #334155;
  display: inline-block;
  flex-shrink: 0;
}

.team-logo-placeholder {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.team-name {
  font-weight: 600;
  color: #f1f5f9;
}

.text-positive {
  color: #34d399;
}

.text-negative {
  color: #f87171;
}

.pts-col {
  color: #34d399 !important;
}

.pts-val {
  font-weight: 800;
  color: #34d399;
  font-size: 1.05rem;
  background: rgba(52, 211, 153, 0.08);
}

/* 🪟 ESTILOS DEL POPUP / MODAL */
.modal-overlay-public {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content-public {
  background: #1e293b;
  border: 1px solid #475569;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  animation: modalFadeIn 0.2s ease-out;
}

@keyframes modalFadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.modal-header-public {
  background: #0f172a;
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #334155;
}

.modal-header-public h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #34d399;
}

.close-btn-public {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #94a3b8;
  cursor: pointer;
}

.close-btn-public:hover {
  color: #ffffff;
}

.modal-body-public {
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
}

.modal-body-public p {
  margin: 0;
  color: #f8fafc;
  font-size: 1rem;
  line-height: 1.6;
  white-space: pre-line;
  word-break: break-word;
}

.modal-footer-public {
  background: #0f172a;
  padding: 0.75rem 1.25rem;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #334155;
}

.btn-cerrar-popup {
  background: #334155;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-cerrar-popup:hover {
  background: #475569;
}

/* Estados de carga y vacío */
.state-message {
  text-align: center;
  padding: 3rem 1rem;
  color: #94a3b8;
  font-style: italic;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(52, 211, 153, 0.2);
  border-top-color: #34d399;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 0.75rem auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Footer */
.public-footer {
  background: #0f172a;
  border-top: 1px solid #334155;
  text-align: center;
  padding: 1.5rem;
  color: #64748b;
  font-size: 0.85rem;
}
</style>