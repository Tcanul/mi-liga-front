<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <button class="btn-back" @click="router.push('/')">← Volver al Inicio</button>
      <div class="header-info">
        <h1>👥 Gestión de Usuarios y Roles</h1>
        <p>Administra las cuentas de acceso para Owners y Capitanes.</p>
      </div>
    </header>

    <div class="section-toolbar">
      <h2>Listado de Usuarios del Sistema</h2>
      <button class="btn-primary" @click="abrirModalCrear">+ Crear Nuevo Usuario</button>
    </div>

    <!-- Tabla de Usuarios con Scroll Horizontal Responsivo -->
    <div class="table-responsive">
      <table class="standings-table">
        <thead>
          <tr>
            <th class="team-col">Nombre</th>
            <th>Correo Electrónico</th>
            <th>Rol</th>
            <th>Estatus</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in usuariosFiltrados" :key="user._id">
            <td class="team-col"><strong>{{ user.nombre }}</strong></td>
            <td>{{ user.email }}</td>
            <td>
              <span :class="['rol-badge', user.rol]">
                {{ user.rol === 'admin' ? 'Administrador' : user.rol === 'liga_owner' ? 'Dueño de Liga' : 'Capitán' }}
              </span>
            </td>
            <td>
              <span :class="['status-pill', user.activo ? 'completado' : 'suspendido']">
                {{ user.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td>
              <div v-if="puedeGestionar(user)" class="action-buttons-cell">
                <button class="btn-secondary-sm" @click="abrirModalEditar(user)">✏️ Editar</button>
                <button 
                  :class="['btn-secondary-sm', user.activo ? 'btn-danger-sm' : 'btn-success-sm']" 
                  @click="toggleInactivar(user)"
                >
                  {{ user.activo ? 'Inactivar' : 'Activar' }}
                </button>
              </div>
              <span v-else class="text-muted">Sin permisos</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Crear / Editar Usuario -->
    <div v-if="mostrarModal" class="modal-overlay" @click.self="mostrarModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ modoEdicion ? '✏️ Editar Usuario' : '➕ Crear Nuevo Usuario' }}</h2>
          <button class="close-btn" @click="mostrarModal = false">&times;</button>
        </div>
        <form @submit.prevent="guardarUsuario">
          <div class="form-group">
            <label>Nombre Completo</label>
            <input v-model="formulario.nombre" type="text" placeholder="Ej. Juan Pérez" required />
          </div>

          <div class="form-group">
            <label>Correo Electrónico</label>
            <input v-model="formulario.email" type="email" placeholder="correo@ligas.com" required :disabled="modoEdicion" />
          </div>

          <div class="form-group">
            <label>Contraseña {{ modoEdicion ? '(Dejar en blanco para mantener)' : '' }}</label>
            <input v-model="formulario.password" type="password" placeholder="******" :required="!modoEdicion" />
          </div>

          <div class="form-group">
            <label>Rol del Usuario</label>
            <select v-model="formulario.rol" required>
              <option v-if="authStore.user?.rol === 'admin'" value="liga_owner">Dueño de Liga (Owner)</option>
              <option value="capitan">Capitán</option>
            </select>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="mostrarModal = false">Cancelar</button>
            <button type="submit" class="btn-primary">{{ modoEdicion ? 'Guardar Cambios' : 'Crear Usuario' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const usuarios = ref([])
const mostrarModal = ref(false)
const modoEdicion = ref(false)
const usuarioIdEditando = ref(null)

const formulario = ref({
  nombre: '',
  email: '',
  password: '',
  rol: 'capitan',
  activo: true
})



const usuariosFiltrados = computed(() => {
  if (authStore.user?.rol === 'admin') {
    return usuarios.value.filter(u => u.rol !== 'admin')
  } else if (authStore.user?.rol === 'liga_owner') {
    return usuarios.value.filter(u => u.rol === 'capitan')
  }
  return []
})

function puedeGestionar(targetUser) {
  if (authStore.user?.rol === 'admin') return true
  if (authStore.user?.rol === 'liga_owner' && targetUser.rol === 'capitan') return true
  return false
}

onMounted(async () => {
  await obtenerUsuarios()
})

async function obtenerUsuarios() {
  try {
    const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');
    const res = await fetch(`${API_URL}api/usuarios`)
    if (res.ok) {
      usuarios.value = await res.json()
    }
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
  }
}

function abrirModalCrear() {
  modoEdicion.value = false
  usuarioIdEditando.value = null
  formulario.value = {
    nombre: '',
    email: '',
    password: '',
    rol: authStore.user?.rol === 'admin' ? 'liga_owner' : 'capitan',
    activo: true
  }
  mostrarModal.value = true
}

function abrirModalEditar(user) {
  modoEdicion.value = true
  usuarioIdEditando.value = user._id
  formulario.value = {
    nombre: user.nombre,
    email: user.email,
    password: '',
    rol: user.rol,
    activo: user.activo
  }
  mostrarModal.value = true
}

async function guardarUsuario() {
  const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');
  const url = modoEdicion.value 
    ? `${API_URL}api/usuarios/${usuarioIdEditando.value}`
    : `${API_URL}api/usuarios`
  
  const method = modoEdicion.value ? 'PUT' : 'POST'

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formulario.value)
    })

    if (res.ok) {
      mostrarModal.value = false
      await obtenerUsuarios()
    } else {
      const err = await res.json()
      alert(err.error || 'Error al procesar la solicitud')
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

async function toggleInactivar(user) {
  const nuevoEstatus = !user.activo
  const accionText = nuevoEstatus ? 'activar' : 'inactivar'
  
  if (confirm(`¿Estás seguro de ${accionText} a este usuario?`)) {
    try {
      const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');
      const res = await fetch(`${API_URL}api/usuarios/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, activo: nuevoEstatus })
      })
      if (res.ok) {
        await obtenerUsuarios()
      }
    } catch (error) {
      console.error('Error al cambiar estatus:', error)
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  font-family: 'Inter', system-ui, sans-serif;
  color: #1e293b;
  box-sizing: border-box;
}

.dashboard-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

@media(min-width: 640px) {
  .dashboard-header {
    flex-direction: row;
    align-items: center;
    gap: 1.5rem;
  }
}

.section-toolbar {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

@media(min-width: 640px) {
  .section-toolbar {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  -webkit-overflow-scrolling: touch;
}

.standings-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  font-size: 0.9rem;
  white-space: nowrap;
}

.standings-table th {
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
  padding: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}

.standings-table td {
  padding: 0.65rem 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}

.team-col { text-align: left !important; }

.rol-badge {
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
}
.rol-badge.admin { background: #fee2e2; color: #dc2626; }
.rol-badge.liga_owner { background: #e0e7ff; color: #4338ca; }
.rol-badge.capitan { background: #fef3c7; color: #d97706; }

.action-buttons-cell {
  display: flex;
  gap: 0.35rem;
  justify-content: center;
}

.btn-secondary-sm {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  color: #334155;
}

.btn-danger-sm {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #f87171;
}

.btn-success-sm {
  background: #d1fae5;
  color: #059669;
  border: 1px solid #34d399;
}

.text-muted {
  color: #94a3b8;
  font-size: 0.85rem;
}

/* Modales */
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
  box-sizing: border-box;
}

.modal-content {
  background: white;
  padding: 1.5rem;
  border-radius: 14px;
  width: 100%;
  max-width: 450px;
  box-sizing: border-box;
  max-height: 90vh;
  overflow-y: auto;
}

@media(min-width: 640px) {
  .modal-content {
    padding: 2rem;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}
.modal-header h2 { font-size: 1.15rem; margin: 0; }

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #94a3b8;
}

.form-group {
  margin-bottom: 1.1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 600;
  font-size: 0.85rem;
  color: #475569;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 0.65rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  box-sizing: border-box;
  font-size: 0.9rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.btn-primary, .btn-secondary {
  padding: 0.6rem 1.1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;
  border: none;
}
.btn-primary { background: #2563eb; color: white; }
.btn-secondary { background: #e2e8f0; color: #475569; }
</style>