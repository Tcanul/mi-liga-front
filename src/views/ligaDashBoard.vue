<template>
  <div class="dashboard-container">
    <!-- Header del Dashboard -->
    <header class="dashboard-header">
      <button class="btn-back" @click="router.push('/')">← Volver a Ligas</button>
      <div class="header-info">
        <h1>🏟 Panel de Control</h1>
        <p v-if="ligaStore.ligaActual">Liga: <strong>{{ ligaStore.ligaActual.nombre }}</strong> ({{ ligaStore.ligaActual.categoria }})</p>
      </div>
    </header>

    <!-- Pestañas de Navegación del Panel -->
    <div class="dashboard-tabs">
      <button 
        :class="['tab-btn', pestañaActiva === 'equipos' ? 'active' : '']" 
        @click="pestañaActiva = 'equipos'"
      >
        ⚽ Equipos ({{ ligaStore.equipos ? ligaStore.equipos.length : 0 }})
      </button>
      <button 
        :class="['tab-btn', pestañaActiva === 'posiciones' ? 'active' : '']" 
        @click="pestañaActiva = 'posiciones'"
      >
        📊 Tabla de Posiciones
      </button>
      <button 
        :class="['tab-btn', pestañaActiva === 'rol' ? 'active' : '']" 
        @click="pestañaActiva = 'rol'"
      >
        🗓️ Rol de Juegos
      </button>
      <button 
        :class="['tab-btn', pestañaActiva === 'goleadores' ? 'active' : '']" 
        @click="seleccionarPestaniaGoleadores"
      >
        ⚽ Goleadores (Top 10)
      </button>
    </div>

    <!-- ========================================== -->
    <!-- SECCIÓN 1: EQUIPOS -->
    <!-- ========================================== -->
    <section v-if="pestañaActiva === 'equipos'" class="equipos-section">
      <div class="section-toolbar">
        <h2>Listado de Equipos Inscritos</h2>
        
        <button 
          v-if="esAdmin"
          class="btn-primary" 
          @click="abrirModalCrear"
        >
          + Registrar Nuevo Equipo
        </button>
      </div>

      <!-- Tarjetas de Equipos con Estilos Restaurados -->
      <div class="equipos-grid">
        <div v-for="equipo in ligaStore.equipos" :key="equipo.id" class="equipo-card">
          <div class="equipo-logo-container">
            <img v-if="equipo.logo" :src="equipo.logo" alt="Logo" class="equipo-logo" />
            <div v-else class="equipo-logo-placeholder">⚽</div>
          </div>
          
          <div class="equipo-details">
            <h3>{{ equipo.nombre }}</h3>
            <p class="equipo-dueno"> 👤 Dueño: <strong>{{ equipo.dueno }}</strong></p>
            <p class="equipo-stats-mini">Pts: <strong>{{ equipo.pts || 0 }}</strong> | JJ: {{ equipo.jj || 0 }} | JG: {{ equipo.jg || 0 }} | JE: {{ equipo.je || 0 }} | JP: {{ equipo.jp || 0 }}</p>
            <span :class="['status-badge', equipo.activo ? 'activo' : 'inactivo']">
              {{ equipo.activo ? '● Activo' : '● Inactivo' }}
            </span>
          </div>

          <!-- Acciones de Edición y Eliminación -->
          <div v-if="esAdmin" class="equipo-actions">
            <button class="btn-icon" @click="abrirModalEditar(equipo)" title="Editar Equipo / Estadísticas">✏️</button>
            <button class="btn-icon delete" @click="eliminarEquipo(equipo.id)" title="Eliminar Equipo">🗑</button>
          </div>

          <div class="equipo-card-footer">
            <button class="btn-secondary-sm" @click="abrirModalJugadores(equipo)">
              👥 Ver Jugadores
            </button>
          </div>
        </div>

        <div v-if="!ligaStore.equipos || ligaStore.equipos.length === 0" class="empty-state">
          <div class="empty-icon">🛡</div>
          <p>No hay equipos registrados en esta liga todavía.</p>
        </div>
      </div>
    </section>

    <!-- ========================================== -->
    <!-- SECCIÓN 2: TABLA DE POSICIONES -->
    <!-- ========================================== -->
    <section v-if="pestañaActiva === 'posiciones'" class="posiciones-section">
      <div class="section-toolbar">
        <h2>📊 Tabla General de Posiciones</h2>
        <span class="sub-text">Calculada en tiempo real</span>
      </div>

      <div class="table-responsive">
        <table class="standings-table">
          <thead>
            <tr>
              <th>Pos</th>
              <th>Equipo</th>
              <th>JJ</th>
              <th>JG</th>
              <th>JE</th>
              <th>JP</th>
              <th>GF</th>
              <th>GC</th>
              <th>DG</th>
              <th>PE</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(equipo, index) in tablaPosiciones" :key="equipo.id">
              <td class="pos-col"><strong>{{ index + 1 }}</strong></td>
              <td class="team-col">
                <div class="team-cell-info">
                  <img v-if="equipo.logo" :src="equipo.logo" class="mini-logo" />
                  <span v-else class="mini-placeholder">⚽</span>
                  <span>{{ equipo.nombre }}</span>
                </div>
              </td>
              <td>{{ equipo.jj || 0 }}</td>
              <td>{{ equipo.jg || 0 }}</td>
              <td>{{ equipo.je || 0 }}</td>
              <td>{{ equipo.jp || 0 }}</td>
              <td>{{ equipo.gf || 0 }}</td>
              <td>{{ equipo.gc || 0 }}</td>
              <td :class="Number(equipo.dg) > 0 ? 'text-green' : Number(equipo.dg) < 0 ? 'text-red' : ''">
                {{ equipo.dg || 0 }}
              </td>
              <td>{{ equipo.ptsExtras || 0 }}</td>
              <td><strong class="pts-badge">{{ equipo.pts || 0 }}</strong></td>
            </tr>
            <tr v-if="!ligaStore.equipos || ligaStore.equipos.length === 0">
              <td colspan="11" class="empty-state">No hay equipos para mostrar en la tabla de posiciones.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ========================================== -->
    <!-- SECCIÓN 3: ROL DE JUEGOS Y RESULTADOS -->
    <!-- ========================================== -->
    <section v-if="pestañaActiva === 'rol'" class="rol-section">
      <div class="jornada-bar">
        <div class="jornada-selector">
          <label><strong>Seleccionar Jornada:</strong></label>
          <select v-model.number="jornadaSeleccionada" @change="cargarRolJornada">
            <option v-for="j in 20" :key="j" :value="j">Jornada {{ j }}</option>
          </select>
        </div>

        <button v-if="esAdmin" class="btn-primary" @click="mostrarModalPartido = true">
          + Programar Partido
        </button>
      </div>

      <!-- Banner de Número Impar y Descanso -->
      <div v-if="esImpar" class="descanso-banner">
        <div class="descanso-info">
          ⚠️ <strong>Número Impar de Equipos ({{ totalEquipos }} equipos):</strong> 
          <span>En la Jornada {{ jornadaSeleccionada }} hay un equipo en descanso.</span>
        </div>

        <div class="descanso-selector">
          <label>Equipo que descansa:</label>
          <select v-model="equipoDescansaSeleccionado" @change="guardarDescanso" :disabled="!esAdmin">
            <option value="" disabled>-- Seleccionar Equipo --</option>
            <option v-for="eq in ligaStore.equipos" :key="eq.id" :value="eq.id">
              ☕ {{ eq.nombre }}
            </option>
          </select>
        </div>
      </div>

      <div class="matches-container">
        <h3>Partidos - Jornada {{ jornadaSeleccionada }}</h3>
        
        <div class="matches-grid">
          <div v-for="partido in partidosFiltrados" :key="partido._id" class="match-card">
            <!-- Descanso -->
            <div v-if="partido.equipoDescansa" class="match-descanso">
              <span class="icon">☕</span>
              <p>Esta jornada descansa:</p>
              <h4>{{ partido.equipoDescansa.nombre || 'Equipo' }}</h4>
              <button v-if="esAdmin" class="btn-icon delete" @click="borrarPartido(partido._id)" title="Eliminar descanso">🗑</button>
            </div>

            <!-- Partido Normal con Marcadores y Estatus -->
            <div v-else class="match-content">
              <div class="match-info-top">
                <span> 📅 {{ partido.fecha || 'S/F' }} - ⏰ {{ partido.hora || 'S/H' }}</span>
                <span :class="['estatus-pill', partido.estatus || 'pendiente']">
                  {{ (partido.estatus || 'pendiente').toUpperCase() }}
                </span>
              </div>

              <div class="match-scoreboard">
                <div class="team-box local">
                  <span class="team-name">{{ partido.equipoLocal?.nombre || 'Local' }}</span>
                  <span class="score">{{ partido.golesLocal ?? 0 }}</span>
                </div>
                <span class="vs-divider">VS</span>
                <div class="team-box visitante">
                  <span class="score">{{ partido.golesVisitante ?? 0 }}</span>
                  <span class="team-name">{{ partido.equipoVisitante?.nombre || 'Visitante' }}</span>
                </div>
              </div>

              <div v-if="esAdmin" class="match-card-actions">
                <button class="btn-secondary-sm" @click="abrirModalResultado(partido)">⚽ Capturar Resultado</button>
                <button class="btn-icon delete" @click="borrarPartido(partido._id)">🗑 Eliminar</button>
              </div>
            </div>
          </div>

          <div v-if="partidosFiltrados.length === 0" class="empty-state">
            <p>No hay partidos ni descansos programados para la Jornada {{ jornadaSeleccionada }}.</p>
          </div>
        </div>
      </div>
    </section>

    <section v-if="pestañaActiva === 'goleadores'" class="rol-section">
      <!-- ⚽ SECCIÓN DE GOLEADORES -->
        <div class="goleadores-card">
          <h2>🏆 Tabla de Goleadores - Top 10</h2>
          <table class="tabla-goleadores">
          <thead>
            <tr>
              <th>#</th>
              <th>Jugador</th>
              <th>Goles</th>
            </tr>
          </thead>
          <tbody>
            <!-- Se asegura de tratarlo como arreglo sin importar si viene directo o envuelto -->
            <tr v-for="(goleador, index) in (Array.isArray(ligaStore.goleadoresTop) ? ligaStore.goleadoresTop : (ligaStore.goleadoresTop?.goleadores || []))" :key="goleador.jugadorId || index">
              <td>{{ index + 1 }}</td>
              <td>{{ goleador.nombre || goleador.jugadorNombre || 'Sin nombre' }}</td>
              <td><strong>{{ goleador.goles ?? goleador.totalGoles ?? 0 }}</strong></td>
            </tr>
            <tr v-if="!ligaStore.goleadoresTop || (Array.isArray(ligaStore.goleadoresTop) && ligaStore.goleadoresTop.length === 0)">
              <td colspan="3" class="text-center">Aún no hay goles registrados en esta liga.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Modal Crear / Editar Equipo -->
    <div v-if="mostrarModal" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal-content large-modal">
        <div class="modal-header">
          <h2>{{ modoEdicion ? '✏️ Editar Equipo y Estadísticas' : '✨ Registrar Nuevo Equipo' }}</h2>
          <button class="close-btn" @click="cerrarModal">&times;</button>
        </div>
        
        <form @submit.prevent="guardarEquipo">
          <div class="form-grid">
            <div class="form-group">
              <label>Nombre del Equipo</label>
              <input v-model="formulario.nombre" type="text" placeholder="Ej. Real Madrid FC" required />
            </div>

            <div class="form-group">
              <label>Dueño del Equipo</label>
              <input v-model="formulario.dueno" type="text" placeholder="Nombre del representante" required />
            </div>

            <!-- NUEVO: Campo para asignar el correo del capitán -->
            <div class="form-group full-width">
              <label>Correo del Capitán (Permiso para gestionar jugadores)</label>
              <input v-model="formulario.capitanEmail" type="email" placeholder="ejemplo@ligas.com" />
            </div>

            <div class="form-group full-width">
              <label>URL del Logo (Opcional)</label>
              <input v-model="formulario.logo" type="url" placeholder="https://ejemplo.com/logo.png" />
            </div>
          </div>

          <div v-if="modoEdicion" class="stats-edit-section">
            <h3>📈  Estadísticas del Torneo</h3>
            <div class="stats-grid">
              <div class="form-group"><label>JJ</label><input v-model.number="formulario.jj" type="number" min="0" /></div>
              <div class="form-group"><label>JG</label><input v-model.number="formulario.jg" type="number" min="0" /></div>
              <div class="form-group"><label>JE</label><input v-model.number="formulario.je" type="number" min="0" /></div>
              <div class="form-group"><label>JP</label><input v-model.number="formulario.jp" type="number" min="0" /></div>
              <div class="form-group"><label>GF</label><input v-model.number="formulario.gf" type="number" min="0" /></div>
              <div class="form-group"><label>GC</label><input v-model.number="formulario.gc" type="number" min="0" /></div>
              <div class="form-group"><label>PE</label><input v-model.number="formulario.ptsExtras" type="number" min="0" /></div>
            </div>
          </div>

          <div class="form-group checkbox-group" style="margin-top: 1rem;">
            <label>
              <input v-model="formulario.activo" type="checkbox" />
              Equipo Activo en el Torneo
            </label>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="cerrarModal">Cancelar</button>
            <button type="submit" class="btn-primary">{{ modoEdicion ? 'Guardar Cambios' : 'Dar de Alta' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Programar Partido -->
    <div v-if="mostrarModalPartido" class="modal-overlay" @click.self="mostrarModalPartido = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>🗓 Programar Partido - J.{{ jornadaSeleccionada }}</h2>
          <button class="close-btn" @click="mostrarModalPartido = false">&times;</button>
        </div>
        <form @submit.prevent="guardarNuevoPartido">
          <div class="form-group">
            <label>Equipo Local</label>
            <select v-model="formPartido.equipoLocalId" required>
              <option value="" disabled>Selecciona Local</option>
              <option v-for="eq in ligaStore.equipos" :key="eq.id" :value="eq.id" :disabled="eq.id === formPartido.equipoVisitanteId">{{ eq.nombre }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>Equipo Visitante</label>
            <select v-model="formPartido.equipoVisitanteId" required>
              <option value="" disabled>Selecciona Visitante</option>
              <option v-for="eq in ligaStore.equipos" :key="eq.id" :value="eq.id" :disabled="eq.id === formPartido.equipoLocalId">{{ eq.nombre }}</option>
            </select>
          </div>

          <div class="form-group"><label>Fecha</label><input v-model="formPartido.fecha" type="date" required /></div>
          <div class="form-group"><label>Hora</label><input v-model="formPartido.hora" type="time" required /></div>
          <div class="form-group"><label>Cancha / Sede</label><input v-model="formPartido.cancha" type="text" placeholder="Ej. Cancha Principal" /></div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="mostrarModalPartido = false">Cancelar</button>
            <button type="submit" class="btn-primary">Guardar Partido</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Capturar Resultado -->
    <div v-if="mostrarModalResultadoFlag" class="modal-overlay" @click.self="mostrarModalResultadoFlag = false">
      <div class="modal-content large-modal">
        <div class="modal-header">
          <h2>⚽ Capturar Marcador</h2>
          <button class="close-btn" @click="mostrarModalResultadoFlag = false">&times;</button>
        </div>
        <form @submit.prevent="guardarResultadoPartido">
          <div class="score-inputs-grid">
            <div class="form-group text-center">
              <label>{{ partidoEditando?.equipoLocal?.nombre || 'Local' }}</label>
              <input v-model.number="formResultado.golesLocal" type="number" min="0" required class="input-score" @change="ajustarArregloGoleadores('local')" />
            </div>
            <div class="form-group text-center">
              <label>{{ partidoEditando?.equipoVisitante?.nombre || 'Visitante' }}</label>
              <input v-model.number="formResultado.golesVisitante" type="number" min="0" required class="input-score" @change="ajustarArregloGoleadores('visitante')" />
            </div>
          </div>

          <!-- ⚽ SELECTORES DINÁMICOS PARA GOLEADORES LOCALES -->
          <div v-if="formResultado.golesLocal > 0" class="seccion-goleadores">
            <h4>Goleadores de {{ partidoEditando?.equipoLocal?.nombre }}</h4>
            <div v-for="(n, index) in formResultado.golesLocal" :key="'loc-' + index" class="form-group">
              <label>Gol {{ index + 1 }}</label>
              <select v-model="formResultado.goleadoresLocal[index]" required>
                <option :value="undefined" disabled>Selecciona el jugador</option>
                <option v-for="jugador in jugadoresLocal" :key="jugador.id || jugador._id" :value="{ jugadorId: jugador.id || jugador._id, nombre: jugador.nombre }">
                  {{ jugador.nombre }} (#{{ jugador.dorsal }})
                </option>
              </select>
            </div>
          </div>

          <!-- ⚽ SELECTORES DINÁMICOS PARA GOLEADORES VISITANTES -->
          <div v-if="formResultado.golesVisitante > 0" class="seccion-goleadores">
            <h4>Goleadores de {{ partidoEditando?.equipoVisitante?.nombre }}</h4>
            <div v-for="(n, index) in formResultado.golesVisitante" :key="'vis-' + index" class="form-group">
              <label>Gol {{ index + 1 }}</label>
              <select v-model="formResultado.goleadoresVisitante[index]" required>
                <option :value="undefined" disabled>Selecciona el jugador</option>
                <option v-for="jugador in jugadoresVisitante" :key="jugador.id || jugador._id" :value="{ jugadorId: jugador.id || jugador._id, nombre: jugador.nombre }">
                  {{ jugador.nombre }} (#{{ jugador.dorsal }})
                </option>
              </select>
            </div>
          </div>

          <div class="form-group" style="margin-top: 1rem;">
            <label>Estatus del Partido</label>
            <select v-model="formResultado.estatus" required>
              <option value="pendiente">Pendiente</option>
              <option value="completado">Completado</option>
              <option value="suspendido">Suspendido</option>
            </select>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="mostrarModalResultadoFlag = false">Cancelar</button>
            <button type="submit" class="btn-primary">Actualizar Resultado</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de Jugadores / Plantilla -->
    <div v-if="mostrarModalJugadores" class="modal-overlay" @click.self="mostrarModalJugadores = false">
      <div class="modal-content large-modal">
        <div class="modal-header">
          <h2>👥 Plantilla: {{ equipoSeleccionadoJugadores?.nombre }}</h2>
          <button class="close-btn" @click="mostrarModalJugadores = false">&times;</button>
        </div>

        <!-- Formulario para Agregar/Editar Jugador (Solo Admin, Liga Owner o Capitán Asignado) -->
        <form v-if="puedeGestionarJugadores(equipoSeleccionadoJugadores)" @submit.prevent="guardarJugador" class="jugador-form">
          <h4>{{ modoEdicionJugador ? '✏️ Editar Jugador' : '➕ Registrar Jugador' }}</h4>
          <div class="jugador-form-grid">
            <input v-model="formJugador.nombre" type="text" placeholder="Nombre completo" required />
            <input v-model.number="formJugador.dorsal" type="number" placeholder="Dorsal (#)" min="1" max="99" required />
            <select v-model="formJugador.posicion" required>
              <option value="Portero">Portero</option>
              <option value="Defensa">Defensa</option>
              <option value="Medio">Medio</option>
              <option value="Delantero">Delantero</option>
            </select>
            <button type="submit" class="btn-primary-sm">
              {{ modoEdicionJugador ? 'Actualizar' : 'Agregar' }}
            </button>
          </div>
        </form>

        <div v-else class="read-only-banner">
          ℹ️ Vista en modo lectura. Solo el capitán asignado o la administración pueden modificar la plantilla.
        </div>

        <!-- Lista de Jugadores Registrados -->
        <div class="jugadores-list-container">
          <table class="jugadores-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Posición</th>
                <th v-if="puedeGestionarJugadores(equipoSeleccionadoJugadores)">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="jugador in ligaStore.jugadores" :key="jugador._id">
                <td><strong>#{{ jugador.dorsal }}</strong></td>
                <td>{{ jugador.nombre }}</td>
                <td><span class="posicion-tag">{{ jugador.posicion }}</span></td>
                <td v-if="puedeGestionarJugadores(equipoSeleccionadoJugadores)">
                  <button class="btn-icon" @click="editarJugadorForm(jugador)">✏️</button>
                  <button class="btn-icon delete" @click="borrarJugador(jugador._id)">🗑</button>
                </td>
              </tr>
              <tr v-if="!ligaStore.jugadores || ligaStore.jugadores.length === 0">
                <td colspan="4" class="empty-state">No hay jugadores registrados en esta plantilla.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLigaStore } from '@/stores/ligaStore'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const router = useRouter()
const ligaStore = useLigaStore()
const authStore = useAuthStore()

const ligaId = route.params.id
const pestañaActiva = ref('equipos')

// Rol de juegos
const jornadaSeleccionada = ref(1)
const equipoDescansaSeleccionado = ref('')
const mostrarModalPartido = ref(false)

const formPartido = ref({
  equipoLocalId: '',
  equipoVisitanteId: '',
  fecha: '',
  hora: '',
  cancha: 'Cancha Principal'
})

// Resultado modal
const mostrarModalResultadoFlag = ref(false)
const partidoEditando = ref(null)
const jugadoresLocal = ref([])
const jugadoresVisitante = ref([])
const formResultado = ref({ golesLocal: 0, golesVisitante: 0, estatus: 'pendiente',goleadoresLocal: [], goleadoresVisitante: [] })

const mostrarModal = ref(false)
const modoEdicion = ref(false)
const equipoIdEditando = ref(null)

const formulario = ref({
  nombre: '',
  dueno: '',
  capitanEmail: '',
  logo: '',
  activo: true,
  jj: 0, jg: 0, je: 0, jp: 0, gf: 0, gc: 0, ptsExtras: 0
})

const totalEquipos = computed(() => ligaStore.equipos ? ligaStore.equipos.length : 0)
const esImpar = computed(() => totalEquipos.value > 0 && totalEquipos.value % 2 !== 0)
const partidosFiltrados = computed(() => ligaStore.partidos || [])

const tablaPosiciones = computed(() => {
  if (!ligaStore.equipos) return []

  return [...ligaStore.equipos].map(eq => {
    const jj = Number(eq.jj) || 0
    const jg = Number(eq.jg) || 0
    const je = Number(eq.je) || 0
    const jp = Number(eq.jp) || 0
    const gf = Number(eq.gf) || 0
    const gc = Number(eq.gc) || 0
    const ptsExtras = Number(eq.ptsExtras) || 0
    
    // Cálculo seguro de diferencia de goles y puntos totales
    const dg = gf - gc
    const pts = (jg * 3) + (je * 1) + ptsExtras

    return { ...eq, jj, jg, je, jp, gf, gc, dg, ptsExtras, pts }
  }).sort((a, b) => {
    // Ordenar por Puntos desc, luego Diferencia de Goles desc, luego Goles a Favor desc
    if (b.pts !== a.pts) return b.pts - a.pts
    if (b.dg !== a.dg) return b.dg - a.dg
    return b.gf - a.gf
  })
})

onMounted(async () => {
  await ligaStore.seleccionarLiga(ligaId)
  await ligaStore.obtenerEquiposPorLiga(ligaId)
  await cargarRolJornada()
  if (ligaStore.obtenerGoleadores) {
  await ligaStore.obtenerGoleadores(ligaId)
  }
})

async function cambiarPestaña(tab) {
  pestañaActiva.value = tab
  if (tab === 'goleadores' && ligaStore.obtenerGoleadores) {
    await ligaStore.obtenerGoleadores(ligaId)
  }
}

async function cargarRolJornada() {
  await ligaStore.obtenerPartidosPorJornada(ligaId, jornadaSeleccionada.value)
  const registroDescanso = ligaStore.partidos?.find(p => p.equipoDescansa)
  equipoDescansaSeleccionado.value = registroDescanso ? (registroDescanso.equipoDescansa._id || registroDescanso.equipoDescansa) : ''
}

async function guardarDescanso() {
  if (!equipoDescansaSeleccionado.value) return
  await ligaStore.crearPartido({
    ligaId,
    jornada: jornadaSeleccionada.value,
    equipoDescansaId: equipoDescansaSeleccionado.value
  })
}

async function guardarNuevoPartido() {
  await ligaStore.crearPartido({
    ligaId,
    jornada: jornadaSeleccionada.value,
    ...formPartido.value
  })
  mostrarModalPartido.value = false
  formPartido.value = { equipoLocalId: '', equipoVisitanteId: '', fecha: '', hora: '', cancha: 'Cancha Principal' }
}

async function abrirModalResultado(partido) {
  partidoEditando.value = partido
  
  formResultado.value = {
    golesLocal: partido.golesLocal || 0,
    golesVisitante: partido.golesVisitante || 0,
    estatus: partido.estatus || 'completado',
    goleadoresLocal: partido.goleadoresLocal ? [...partido.goleadoresLocal] : [],
    goleadoresVisitante: partido.goleadoresVisitante ? [...partido.goleadoresVisitante] : []
  }

  // Cargar plantillas de ambos equipos
  const idLocal = partido.equipoLocal?._id || partido.equipoLocal
  const idVisitante = partido.equipoVisitante?._id || partido.equipoVisitante

  if (idLocal) {
    await ligaStore.obtenerJugadoresPorEquipo(idLocal)
    jugadoresLocal.value = [...(ligaStore.jugadores || [])]
  }

  if (idVisitante) {
    await ligaStore.obtenerJugadoresPorEquipo(idVisitante)
    jugadoresVisitante.value = [...(ligaStore.jugadores || [])]
  }

  mostrarModalResultadoFlag.value = true
}

// Ajusta el tamaño del arreglo de goleadores si cambian los goles
function ajustarArregloGoleadores(equipo) {
  if (equipo === 'local') {
    formResultado.value.goleadoresLocal = formResultado.value.goleadoresLocal.slice(0, formResultado.value.golesLocal)
  } else {
    formResultado.value.goleadoresVisitante = formResultado.value.goleadoresVisitante.slice(0, formResultado.value.golesVisitante)
  }
}



async function guardarResultadoPartido() {
  if (!partidoEditando.value) return
  
  await ligaStore.actualizarPartido(partidoEditando.value._id, formResultado.value, ligaId, jornadaSeleccionada.value)
  await ligaStore.obtenerEquiposPorLiga(ligaId)
  await ligaStore.obtenerGoleadores(ligaId)
  mostrarModalResultadoFlag.value = false
}

async function borrarPartido(id) {
  if (confirm('¿Deseas eliminar este registro?')) {
    await ligaStore.eliminarPartido(id, ligaId, jornadaSeleccionada.value)
  }
}

function abrirModalCrear() {
  modoEdicion.value = false
  formulario.value = { nombre: '', dueno: '',capitanEmail: '', logo: '', activo: true, jj: 0, jg: 0, je: 0, jp: 0, gf: 0, gc: 0, ptsExtras: 0 }
  equipoIdEditando.value = null
  mostrarModal.value = true
}

function abrirModalEditar(equipo) {
  modoEdicion.value = true
  equipoIdEditando.value = equipo.id
  formulario.value = { 
    nombre: equipo.nombre, dueno: equipo.dueno, capitanEmail: equipo.capitanEmail || '', logo: equipo.logo, activo: equipo.activo,
    jj: equipo.jj || 0, jg: equipo.jg || 0, je: equipo.je || 0, jp: equipo.jp || 0,
    gf: equipo.gf || 0, gc: equipo.gc || 0, ptsExtras: equipo.ptsExtras || 0
  }
  mostrarModal.value = true
}

function cerrarModal() {
  mostrarModal.value = false
}

async function guardarEquipo() {
  const datosEquipo = { ...formulario.value, ligaId }
  if (modoEdicion.value) {
    await ligaStore.actualizarEquipo(equipoIdEditando.value, datosEquipo)
  } else {
    await ligaStore.crearEquipo(datosEquipo)
  }
  cerrarModal()
}

async function eliminarEquipo(id) {
  if (confirm('¿Estás seguro de eliminar este equipo de la liga?')) {
    await ligaStore.eliminarEquipo(id)
  }
}

// Computada para saber si el usuario actual es admin o dueño de liga
const esAdmin = computed(() => {
  return authStore.user?.rol === 'admin' || authStore.user?.rol === 'liga_owner'
})

// Evalúa si el capitán actual tiene derecho a editar la plantilla de un equipo específico
// Función para validar permisos de gestión en el modal de jugadores
function puedeGestionarJugadores(equipo) {
  // Si es admin o dueño de liga, puede gestionar cualquier equipo
  if (authStore.user?.rol === 'admin' || authStore.user?.rol === 'liga_owner') {
    return true
  }
  
  // Si es capitán, solo puede gestionar si su correo coincide exactamente con el del equipo
  if (authStore.user?.email && equipo?.capitanEmail) {
    return authStore.user.email.trim().toLowerCase() === equipo.capitanEmail.trim().toLowerCase()
  }
  
  return false
}

// Modal de Plantilla / Jugadores
const mostrarModalJugadores = ref(false)
const equipoSeleccionadoJugadores = ref(null)
const modoEdicionJugador = ref(false)
const jugadorIdEditando = ref(null)

const formJugador = ref({
  nombre: '',
  dorsal: '',
  posicion: 'Portero'
})

async function abrirModalJugadores(equipo) {
  equipoSeleccionadoJugadores.value = equipo
  await ligaStore.obtenerJugadoresPorEquipo(equipo.id)
  limpiarFormJugador()
  mostrarModalJugadores.value = true
}

function limpiarFormJugador() {
  modoEdicionJugador.value = false
  jugadorIdEditando.value = null
  formJugador.value = { nombre: '', dorsal: '', posicion: 'Portero' }
}

function editarJugadorForm(jugador) {
  modoEdicionJugador.value = true
  jugadorIdEditando.value = jugador._id
  formJugador.value = {
    nombre: jugador.nombre,
    dorsal: jugador.dorsal,
    posicion: jugador.posicion
  }
}

async function guardarJugador() {
  if (!equipoSeleccionadoJugadores.value) return

  const payload = {
    ...formJugador.value,
    equipoId: equipoSeleccionadoJugadores.value.id  || equipoSeleccionadoJugadores.value._id
  }

  if (modoEdicionJugador.value) {
    await ligaStore.actualizarJugador(jugadorIdEditando.value, payload, equipoSeleccionadoJugadores.value.id || equipoSeleccionadoJugadores.value._id)
  } else {
    await ligaStore.crearJugador(payload)
  }
  limpiarFormJugador()
}

async function seleccionarPestaniaGoleadores() {
  pestañaActiva.value = 'goleadores'
  // Forzamos la consulta al backend cada vez que abren la pestaña
  await ligaStore.obtenerGoleadores(ligaId)
}

async function borrarJugador(id) {
  if (confirm('¿Eliminar jugador de la plantilla?')) {
    await ligaStore.eliminarJugador(id, equipoSeleccionadoJugadores.value.id || equipoSeleccionadoJugadores.value._id)
  }
}

</script>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Inter', system-ui, sans-serif;
  color: #1e293b;
}

.dashboard-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.btn-back {
  background: #e2e8f0;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.dashboard-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.5rem;
}

.tab-btn {
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  cursor: pointer;
  color: #64748b;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-btn.active {
  color: #2563eb;
  border-bottom-color: #2563eb;
}

.section-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.sub-text {
  font-size: 0.85rem;
  color: #64748b;
}

/* �� ESTILOS RESTAURADOS DE LAS TARJETAS (CARDS) DE EQUIPOS */
.equipos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.equipo-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.equipo-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08);
}

.equipo-logo-container {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  background: #f1f5f9;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid #e2e8f0;
}

.equipo-logo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.equipo-logo-placeholder {
  font-size: 1.5rem;
}

.equipo-details {
  flex-grow: 1;
}

.equipo-details h3 {
  margin: 0 0 0.15rem 0;
  font-size: 1.05rem;
  color: #0f172a;
}

.equipo-dueno {
  margin: 0 0 0.25rem 0;
  font-size: 0.82rem;
  color: #64748b;
}

.equipo-stats-mini {
  margin: 0 0 0.4rem 0;
  font-size: 0.78rem;
  color: #475569;
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 700;
}

.status-badge.activo { color: #10b981; }
.status-badge.inactivo { color: #ef4444; }

.equipo-actions {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.2rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.btn-icon:hover {
  background: #f1f5f9;
}

/* Estilos de la Tabla de Posiciones */
.table-responsive {
  width: 100%;
  overflow-x: auto;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.standings-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  font-size: 0.95rem;
}

.standings-table th {
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.standings-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}

.standings-table tr:hover {
  background: #f8fafc;
}

.pos-col { width: 50px; color: #64748b; }
.team-col { text-align: left; }

.team-cell-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
}

.mini-logo {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

.mini-placeholder { font-size: 1.1rem; }
.text-green { color: #10b981; font-weight: 600; }
.text-red { color: #ef4444; font-weight: 600; }

.pts-badge {
  background: #eff6ff;
  color: #2563eb;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
}

/* Estilos del Rol de Juegos y Tarjetas de Partidos */
.jornada-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  margin-bottom: 1.5rem;
}

.jornada-selector select {
  margin-left: 0.75rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-weight: bold;
}

.descanso-banner {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.descanso-selector select {
  margin-left: 0.5rem;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  border: 1px solid #d97706;
  background: white;
  font-weight: 600;
}

.matches-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.match-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.match-descanso {
  text-align: center;
  color: #b45309;
}

.match-descanso .icon { font-size: 2rem; }

.match-info-top {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 0.5rem;
}

.match-scoreboard {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin: 0.75rem 0;
  border: 1px solid #e2e8f0;
}

.team-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.95rem;
}

.team-box.visitante { flex-direction: row-reverse; }

.score {
  background: #2563eb;
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-size: 1.1rem;
}

.vs-divider { font-size: 0.8rem; color: #94a3b8; font-weight: bold; }

.estatus-pill {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 9999px;
}
.estatus-pill.pendiente { background: #fef3c7; color: #d97706; }
.estatus-pill.completado { background: #d1fae5; color: #059669; }
.estatus-pill.suspendido { background: #fee2e2; color: #dc2626; }

.match-card-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.75rem;
  border-top: 1px solid #f1f5f9;
  padding-top: 0.5rem;
}

.btn-secondary-sm {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  color: #334155;
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
}

.modal-content.large-modal { max-width: 550px; }

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 14px;
  width: 100%;
  box-sizing: border-box;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.full-width { grid-column: span 2; }

.stats-edit-section {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.stats-edit-section h3 {
  font-size: 1rem;
  margin-bottom: 0.75rem;
  color: #334155;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.form-group { margin-bottom: 0.75rem; }

.form-group label {
  display: block;
  margin-bottom: 0.3rem;
  font-weight: 600;
  font-size: 0.8rem;
  color: #475569;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 0.55rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  box-sizing: border-box;
}

.score-inputs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.input-score {
  font-size: 1.5rem;
  text-align: center;
  font-weight: bold;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn-primary {
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.65rem 1.1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary {
  background: #e2e8f0;
  color: #475569;
  border: none;
  padding: 0.65rem 1.1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  color: #94a3b8;
  padding: 3rem 0;
}
.equipo-card-footer {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #f1f5f9;
}

.jugador-form {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-bottom: 1.25rem;
}

.jugador-form h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #334155;
}

.jugador-form-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr auto;
  gap: 0.5rem;
}

.btn-primary-sm {
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.5rem 0.8rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.read-only-banner {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.jugadores-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.jugadores-table th, .jugadores-table td {
  padding: 0.6rem;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
}

.posicion-tag {
  background: #f1f5f9;
  color: #475569;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-tabs {
  display: flex;
  gap: 0.75rem;
  margin: 1.5rem 0;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0.75rem;
  flex-wrap: wrap;
}

.tab-btn {
  background: #f1f5f9;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  color: #475569;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background: #e2e8f0;
}

.tab-btn.active {
  background: #2563eb;
  color: white;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.goleadores-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.tabla-goleadores {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.tabla-goleadores th, .tabla-goleadores td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
}

.tabla-goleadores th {
  background: #f8fafc;
  font-weight: 600;
  color: #1e293b;
}

.text-center {
  text-align: center;
  color: #94a3b8;
  padding: 2rem 0;
}
</style>