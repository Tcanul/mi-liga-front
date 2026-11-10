<template>
  <div class="dashboard-container">
    <!-- Header del Dashboard -->
    <header class="dashboard-header">
      <button class="btn-back" @click="router.push('/homeView')">← Volver a Ligas</button>
      <div class="header-info">
        <h1>🏟 Panel de Control</h1>
        <p v-if="ligaStore.ligaActual">Liga: <strong>{{ ligaStore.ligaActual.nombre }}</strong> ({{ ligaStore.ligaActual.categoria }})</p>
      </div>
    </header>

    <!-- Pestañas de Navegación del Panel (Adaptables horizontalmente) -->
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
        📊 Posiciones
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
      <!-- Pestaña Avisos -->
      <button 
        @click="pestañaActiva = 'avisos'" 
        :class="['tab-btn', pestañaActiva === 'avisos' ? 'active' : '']"
      >
        📢 Avisos
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
          + Registrar Equipo
        </button>
      </div>

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

          <div class="equipo-actions" v-if="esAdmin">
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
        <span class="sub-text">Tiempo real</span>
      </div>

      <div class="table-responsive">
        <table class="standings-table">
          <thead>
            <tr>
              <th>Pos</th>
              <th class="team-col">Equipo</th>
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
                  <span class="team-text-name">{{ equipo.nombre }}</span>
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
          <label><strong>Jornada:</strong></label>
          <select v-model.number="jornadaSeleccionada" @change="cargarRolJornada">
            <option v-for="j in 20" :key="j" :value="j">Jornada {{ j }}</option>
          </select>
        </div>

        <button v-if="esAdmin" class="btn-primary" @click="mostrarModalPartido = true">
          + Programar
        </button>
      </div>

      <!-- Banner de Número Impar y Descanso -->
      <div v-if="esImpar" class="descanso-banner">
        <div class="descanso-info">
          ⚠️ <strong>Número Impar ({{ totalEquipos }} equipos):</strong> 
          <span>Hay un equipo en descanso en la J.{{ jornadaSeleccionada }}.</span>
        </div>

        <div class="descanso-selector">
          <label>Descansa:</label>
          <select v-model="equipoDescansaSeleccionado" @change="guardarDescanso" :disabled="!esAdmin">
            <option value="" disabled>-- Seleccionar --</option>
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

            <!-- Partido Normal -->
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
                <button class="btn-secondary-sm" @click="abrirModalResultado(partido)">⚽ Capturar</button>
                <button class="btn-icon delete" @click="borrarPartido(partido._id)">🗑</button>
              </div>
            </div>
          </div>

          <div v-if="partidosFiltrados.length === 0" class="empty-state">
            <p>No hay partidos ni descansos programados para la Jornada {{ jornadaSeleccionada }}.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ========================================== -->
    <!-- SECCIÓN 4: GOLEADORES -->
    <!-- ========================================== -->
    <section v-if="pestañaActiva === 'goleadores'" class="rol-section">
      <div class="goleadores-card">
        <h2>🏆 Tabla de Goleadores - Top 10</h2>
        <div class="table-responsive">
          <table class="tabla-goleadores">
            <thead>
              <tr>
                <th>#</th>
                <th class="team-col">Jugador</th>
                <th>Goles</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(goleador, index) in (Array.isArray(ligaStore.goleadoresTop) ? ligaStore.goleadoresTop : (ligaStore.goleadoresTop?.goleadores || []))" :key="goleador.jugadorId || index">
                <td>{{ index + 1 }}</td>
                <td class="team-col">{{ goleador.nombre || goleador.jugadorNombre || 'Sin nombre' }}</td>
                <td><strong>{{ goleador.goles ?? goleador.totalGoles ?? 0 }}</strong></td>
              </tr>
              <tr v-if="!ligaStore.goleadoresTop || (Array.isArray(ligaStore.goleadoresTop) && ligaStore.goleadoresTop.length === 0)">
                <td colspan="3" class="text-center">Aún no hay goles registrados en esta liga.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- ========================================== -->
    <!-- SECCIÓN 5: AVISOS (Rediseñado Profesional) -->
    <!-- ========================================== -->
    <section v-if="pestañaActiva === 'avisos'" class="avisos-section-modern">
      <div class="avisos-header-banner">
        <div class="avisos-header-text">
          <h2>📢 Tablón de Avisos Oficiales</h2>
          <p>Mantén informados a los equipos y capitanes con comunicados importantes del torneo.</p>
        </div>
      </div>

      <!-- Formulario para crear o editar aviso -->
      <div class="aviso-form-card">
        <div class="form-card-title">
          <span>{{ editandoAvisoId ? '✏️ Modificar Aviso' : '✨ Publicar Nuevo Comunicado' }}</span>
        </div>
        <form @submit.prevent="guardarAviso">
          <div class="form-group">
            <label>Contenido del Aviso</label>
            <textarea 
              v-model="formularioAviso.texto" 
              rows="3" 
              placeholder="Escribe aquí las indicaciones, cambios de horario o avisos generales..." 
              required
            ></textarea>
          </div>
          
          <div class="form-footer-row">
            <label class="custom-checkbox-container">
              <input type="checkbox" v-model="formularioAviso.activo" />
              <span class="checkmark-text">Marcar como Aviso Activo / Visible</span>
            </label>

            <div class="form-action-btns">
              <button v-if="editandoAvisoId" type="button" class="btn-cancel-modern" @click="cancelarEdicionAviso">
                Cancelar
              </button>
              <button type="submit" class="btn-submit-modern">
                {{ editandoAvisoId ? 'Guardar Cambios' : 'Publicar Aviso' }}
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- Listado de Avisos -->
      <div class="avisos-content-wrapper">
        <div class="list-heading">
          <h3>Comunicados Publicados</h3>
          <span class="badge-count">{{ avisosLiga.length }} avisos</span>
        </div>

        <div v-if="cargandoAvisos" class="avisos-loading-state">
          <div class="spinner-loader"></div>
          <p>Cargando avisos...</p>
        </div>

        <div v-else-if="avisosLiga.length === 0" class="avisos-empty-state">
          <div class="empty-icon-box">📭</div>
          <p>No hay avisos registrados para esta liga actualmente.</p>
        </div>

        <div v-else class="avisos-cards-grid">
          <div 
            v-for="aviso in avisosLiga" 
            :key="aviso._id" 
            class="aviso-item-card" 
            :class="{ 'card-inactivo': !aviso.activo }"
          >
            <div class="aviso-card-header">
              <span :class="['modern-status-pill', aviso.activo ? 'status-activo' : 'status-inactivo']">
                {{ aviso.activo ? '● Activo' : '● Inactivo' }}
              </span>
              <span class="aviso-date-tag">📅 {{ new Date(aviso.createdAt).toLocaleDateString() }}</span>
            </div>

            <div class="aviso-card-body">
              <p>{{ aviso.texto }}</p>
            </div>

            <div class="aviso-card-footer" v-if="esAdmin">
              <button @click="editarAviso(aviso)" class="btn-action-edit" title="Editar Aviso">
                ✏️ Editar
              </button>
              <button @click="eliminarAviso(aviso._id)" class="btn-action-delete" title="Eliminar Aviso">
                🗑 Eliminar
              </button>
            </div>
          </div>
        </div>
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

            <div class="form-group full-width">
              <label>Correo del Capitán (Permiso para gestionar jugadores)</label>
              <input v-model="formulario.capitanEmail" type="email" placeholder="ejemplo@ligas.com" />
            </div>

            <div class="form-group full-width">
              <label>Logo del Equipo (Subir desde tu dispositivo)</label>
              <input type="file" accept="image/*" @change="onFileSelected" class="file-input" />
              
              <!-- Vista previa de la imagen seleccionada -->
              <div v-if="formulario.logo" class="logo-preview-container">
                <img :src="formulario.logo" alt="Vista previa del logo" class="preview-img" />
                <span class="preview-text">Logo seleccionado</span>
              </div>
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
                <option :value="null" disabled>Selecciona el jugador</option>
                <option v-for="jugador in jugadoresLocal" :key="jugador.id || jugador._id" :value="jugador.id || jugador._id">
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
                <option :value="null" disabled>Selecciona el jugador</option>
                <option v-for="jugador in jugadoresVisitante" :key="jugador.id || jugador._id" :value="jugador.id || jugador._id">
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

        <div class="jugadores-list-container table-responsive">
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
                  <div class="action-buttons-cell">
                    <button class="btn-icon" @click="editarJugadorForm(jugador)">✏️</button>
                    <button class="btn-icon delete" @click="borrarJugador(jugador._id)">🗑</button>
                  </div>
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

const mostrarModalResultadoFlag = ref(false)
const partidoEditando = ref(null)
const jugadoresLocal = ref([])
const jugadoresVisitante = ref([])
const formResultado = ref({ golesLocal: 0, golesVisitante: 0, estatus: 'pendiente', goleadoresLocal: [], goleadoresVisitante: [] })

const mostrarModal = ref(false)
const modoEdicion = ref(false)
const equipoIdEditando = ref(null)

// --- ESTADOS Y LÓGICA DE AVISOS ---
const avisosLiga = ref([])
const cargandoAvisos = ref(false)
const editandoAvisoId = ref(null)

const formularioAviso = ref({
  texto: '',
  activo: true
})

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
    
    const dg = gf - gc
    const pts = (jg * 3) + (je * 1) + ptsExtras

    return { ...eq, jj, jg, je, jp, gf, gc, dg, ptsExtras, pts }
  }).sort((a, b) => {
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
  await cargarAvisosLiga()
})

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
  
  const mapGoleadores = (lista) => {
    if (!lista) return []
    return lista.map(g => g.jugadorId?._id || g.jugadorId || g)
  }

  formResultado.value = {
    golesLocal: partido.golesLocal || 0,
    golesVisitante: partido.golesVisitante || 0,
    estatus: partido.estatus || 'completado',
    goleadoresLocal: mapGoleadores(partido.goleadoresLocal),
    goleadoresVisitante: mapGoleadores(partido.goleadoresVisitante)
  }

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

function ajustarArregloGoleadores(equipo) {
  if (equipo === 'local') {
    formResultado.value.goleadoresLocal = formResultado.value.goleadoresLocal.slice(0, formResultado.value.golesLocal)
  } else {
    formResultado.value.goleadoresVisitante = formResultado.value.goleadoresVisitante.slice(0, formResultado.value.golesVisitante)
  }
}

async function guardarResultadoPartido() {
  if (!partidoEditando.value) return

  // Auxiliar para buscar el objeto del jugador completo por su ID
  const obtenerDatosJugador = (id, lista) => {
    const jug = lista.find(j => (j.id || j._id) === id)
    return {
      jugadorId: id,
      nombre: jug ? jug.nombre : 'Sin nombre'
    }
  }

  // Mapeamos enviando tanto jugadorId como el nombre del jugador
  const payload = {
    golesLocal: formResultado.value.golesLocal,
    golesVisitante: formResultado.value.golesVisitante,
    estatus: formResultado.value.estatus,
    goleadoresLocal: formResultado.value.goleadoresLocal
      .filter(id => id) // Evita elementos vacíos o nulos
      .map(id => obtenerDatosJugador(id, jugadoresLocal.value)),
    goleadoresVisitante: formResultado.value.goleadoresVisitante
      .filter(id => id)
      .map(id => obtenerDatosJugador(id, jugadoresVisitante.value))
  }
  
  await ligaStore.actualizarPartido(partidoEditando.value._id, payload, ligaId, jornadaSeleccionada.value)
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
  formulario.value = { nombre: '', dueno: '', capitanEmail: '', logo: '', activo: true, jj: 0, jg: 0, je: 0, jp: 0, gf: 0, gc: 0, ptsExtras: 0 }
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

const esAdmin = computed(() => {
  return authStore.user?.rol === 'admin' || authStore.user?.rol === 'liga_owner'
})

function puedeGestionarJugadores(equipo) {
  if (authStore.user?.rol === 'admin' || authStore.user?.rol === 'liga_owner') {
    return true
  }
  if (authStore.user?.email && equipo?.capitanEmail) {
    return authStore.user.email.trim().toLowerCase() === equipo.capitanEmail.trim().toLowerCase()
  }
  return false
}

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
    equipoId: equipoSeleccionadoJugadores.value.id || equipoSeleccionadoJugadores.value._id
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
  await ligaStore.obtenerGoleadores(ligaId)
}

async function borrarJugador(id) {
  if (confirm('¿Eliminar jugador de la plantilla?')) {
    await ligaStore.eliminarJugador(id, equipoSeleccionadoJugadores.value.id || equipoSeleccionadoJugadores.value._id)
  }
}

// Función para convertir la imagen del dispositivo a Base64
function onFileSelected(event) {
  const file = event.target.files[0]
  if (file) {
    // Validar que sea una imagen y que no pese más de 2MB (recomendado para bases de datos NoSQL)
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
      // Se asigna la cadena Base64 al campo logo del formulario
      formulario.value.logo = e.target.result
    }
    reader.readAsDataURL(file)
  }
}
const cargarAvisosLiga = async () => {
  if (!ligaId) return
  cargandoAvisos.value = true
  try {
    const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '')
    const res = await fetch(`${API_URL}/api/ligas/${ligaId}/avisos`)
    if (res.ok) {
      avisosLiga.value = await res.json()
    }
  } catch (error) {
    console.error('Error al cargar avisos:', error)
  } finally {
    cargandoAvisos.value = false
  }
}

const guardarAviso = async () => {
  try {
    const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '')
    const url = editandoAvisoId.value 
      ? `${API_URL}/api/avisos/${editandoAvisoId.value}`
      : `${API_URL}/api/avisos`
    
    const method = editandoAvisoId.value ? 'PUT' : 'POST'
    const bodyData = {
      ligaId: ligaId, // 👈 Usamos la variable correcta 'ligaId'
      texto: formularioAviso.value.texto,
      activo: formularioAviso.value.activo
    }

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    })

    if (res.ok) {
      formularioAviso.value = { texto: '', activo: true }
      editandoAvisoId.value = null
      await cargarAvisosLiga()
    } else {
      alert('Error al guardar el aviso')
    }
  } catch (error) {
    console.error('Error al guardar aviso:', error)
  }
}

const editarAviso = (aviso) => {
  editandoAvisoId.value = aviso._id
  formularioAviso.value = {
    texto: aviso.texto,
    activo: aviso.activo
  }
}

const cancelarEdicionAviso = () => {
  editandoAvisoId.value = null
  formularioAviso.value = { texto: '', activo: true }
}

const eliminarAviso = async (id) => {
  if (!confirm('¿Estás seguro de eliminar este aviso?')) return
  try {
    const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '')
    const res = await fetch(`${API_URL}/api/avisos/${id}`, { method: 'DELETE' })
    if (res.ok) {
      await cargarAvisosLiga()
    }
  } catch (error) {
    console.error('Error al eliminar aviso:', error)
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

.btn-back {
  background: #e2e8f0;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  width: fit-content;
}

.dashboard-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.5rem;
  overflow-x: auto;
  white-space: nowrap;
}

.tab-btn {
  background: #f1f5f9;
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.6rem 1rem;
  cursor: pointer;
  color: #64748b;
  border-bottom: 2px solid transparent;
  border-radius: 6px 6px 0 0;
  transition: all 0.2s;
  flex-shrink: 0;
}

.tab-btn.active {
  color: #2563eb;
  background: #eff6ff;
  border-bottom-color: #2563eb;
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

.sub-text {
  font-size: 0.85rem;
  color: #64748b;
}

/* Equipos Grid */
.equipos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.equipo-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  flex-wrap: wrap;
}

.equipo-logo-container {
  width: 50px;
  height: 50px;
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
  font-size: 1.3rem;
}

.equipo-details {
  flex-grow: 1;
  min-width: 140px;
}

.equipo-details h3 {
  margin: 0 0 0.15rem 0;
  font-size: 1rem;
  color: #0f172a;
}

.equipo-dueno {
  margin: 0 0 0.2rem 0;
  font-size: 0.8rem;
  color: #64748b;
}

.equipo-stats-mini {
  margin: 0 0 0.3rem 0;
  font-size: 0.75rem;
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
  gap: 0.25rem;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
  padding: 0.3rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.btn-icon:hover { background: #f1f5f9; }
.btn-icon.delete:hover { background: #fee2e2; }

.equipo-card-footer {
  width: 100%;
  margin-top: 0.25rem;
  padding-top: 0.5rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
}

/* Tablas Responsivas */
.table-responsive {
  width: 100%;
  overflow-x: auto;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  -webkit-overflow-scrolling: touch;
}

.standings-table, .tabla-goleadores, .jugadores-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  font-size: 0.9rem;
  white-space: nowrap;
}

.standings-table th, .tabla-goleadores th, .jugadores-table th {
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
  padding: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}

.standings-table td, .tabla-goleadores td, .jugadores-table td {
  padding: 0.65rem 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}

.pos-col { width: 40px; color: #64748b; }
.team-col { text-align: left !important; }

.team-cell-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.mini-logo {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.mini-placeholder { font-size: 1rem; }
.text-green { color: #10b981; font-weight: 600; }
.text-red { color: #ef4444; font-weight: 600; }

.pts-badge {
  background: #eff6ff;
  color: #2563eb;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
}

/* Rol de Juegos */
.jornada-bar {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: white;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  margin-bottom: 1.25rem;
}

@media(min-width: 640px) {
  .jornada-bar {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.jornada-selector select {
  margin-left: 0.5rem;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-weight: bold;
}

.descanso-banner {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

@media(min-width: 640px) {
  .descanso-banner {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.descanso-selector select {
  margin-top: 0.25rem;
  padding: 0.4rem;
  border-radius: 6px;
  border: 1px solid #d97706;
  background: white;
  font-weight: 600;
  width: 100%;
}

@media(min-width: 640px) {
  .descanso-selector select {
    width: auto;
    margin-left: 0.5rem;
    margin-top: 0;
  }
}

.matches-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
  margin-top: 1rem;
}

.match-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.match-descanso {
  text-align: center;
  color: #b45309;
}
.match-descanso .icon { font-size: 1.8rem; }

.match-info-top {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 0.4rem;
}

.match-scoreboard {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  margin: 0.5rem 0;
  border: 1px solid #e2e8f0;
}

.team-box {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
  font-size: 0.85rem;
  max-width: 40%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.team-box.visitante { flex-direction: row-reverse; }

.score {
  background: #2563eb;
  color: white;
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
  font-size: 1rem;
}

.vs-divider { font-size: 0.75rem; color: #94a3b8; font-weight: bold; }

.estatus-pill {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.15rem 0.4rem;
  border-radius: 9999px;
}
.estatus-pill.pendiente { background: #fef3c7; color: #d97706; }
.estatus-pill.completado { background: #d1fae5; color: #059669; }
.estatus-pill.suspendido { background: #fee2e2; color: #dc2626; }

.match-card-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  border-top: 1px solid #f1f5f9;
  padding-top: 0.4rem;
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

/* ========================================== */
/* ESTILOS PROFESIONALES PARA LA SECCIÓN DE AVISOS */
/* ========================================== */
.avisos-section-modern {
  background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
}

.avisos-header-banner {
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 1rem;
}

.avisos-header-text h2 {
  font-size: 1.35rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.3rem 0;
}

.avisos-header-text p {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0;
}

/* Formulario de Aviso Estilizado */
.aviso-form-card {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.form-card-title span {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  display: block;
  margin-bottom: 1rem;
}

.aviso-form-card textarea {
  width: 100%;
  padding: 0.85rem;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.95rem;
  color: #0f172a;
  background-color: #f8fafc;
  resize: vertical;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.aviso-form-card textarea:focus {
  outline: none;
  border-color: #2563eb;
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.form-footer-row {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
  align-items: flex-start;
}

@media(min-width: 640px) {
  .form-footer-row {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.custom-checkbox-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.custom-checkbox-container input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #2563eb;
  cursor: pointer;
}

.checkmark-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: #334155;
}

.form-action-btns {
  display: flex;
  gap: 0.75rem;
  width: 100%;
}

@media(min-width: 640px) {
  .form-action-btns {
    width: auto;
  }
}

.btn-submit-modern {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border: none;
  padding: 0.65rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
  transition: all 0.2s ease;
  flex: 1;
}

.btn-submit-modern:hover {
  background: linear-gradient(135deg, #1d4ed8, #1e40af);
  box-shadow: 0 6px 8px -1px rgba(37, 99, 235, 0.3);
  transform: translateY(-1px);
}

.btn-cancel-modern {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #cbd5e1;
  padding: 0.65rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-cancel-modern:hover {
  background: #e2e8f0;
  color: #334155;
}

/* Listado de Avisos (Grid Moderno) */
.avisos-content-wrapper .list-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.avisos-content-wrapper h3 {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.badge-count {
  background: #e0e7ff;
  color: #3730a3;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
}

.avisos-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;
}

.aviso-item-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-top: 4px solid #2563eb;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.aviso-item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08);
}

.aviso-item-card.card-inactivo {
  border-top-color: #94a3b8;
  opacity: 0.75;
  background: #f8fafc;
}

.aviso-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.modern-status-pill {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
}

.status-activo {
  background: #d1fae5;
  color: #065f46;
}

.status-inactivo {
  background: #f1f5f9;
  color: #64748b;
}

.aviso-date-tag {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.aviso-card-body p {
  margin: 0 0 1rem 0;
  font-size: 0.95rem;
  color: #334155;
  line-height: 1.5;
  white-space: pre-line;
  word-break: break-word;
}

.aviso-card-footer {
  display: flex;
  gap: 0.5rem;
  border-top: 1px solid #f1f5f9;
  padding-top: 0.75rem;
  justify-content: flex-end;
}

.btn-action-edit {
  background: #f8fafc;
  color: #0f172a;
  border: 1px solid #cbd5e1;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action-edit:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
}

.btn-action-delete {
  background: #fff1f2;
  color: #e11d48;
  border: 1px solid #fecdd3;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action-delete:hover {
  background: #ffe4e6;
  border-color: #fda4af;
}

.avisos-loading-state, .avisos-empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem 1rem;
  background: #ffffff;
  border-radius: 12px;
  border: 1px dashed #cbd5e1;
  color: #64748b;
}

.empty-icon-box {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.spinner-loader {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 0.75rem auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Modales Adaptables */
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
  overflow-y: auto;
}

.modal-content.large-modal { max-width: 550px; }

.modal-content {
  background: white;
  padding: 1.25rem;
  border-radius: 14px;
  width: 100%;
  max-width: 420px;
  max-height: 85vh;
  overflow-y: auto;
  box-sizing: border-box;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
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
  margin-bottom: 0.75rem;
}

.modal-header h2 {
  font-size: 1.05rem;
  margin: 0;
}

.form-group {
  margin-bottom: 0.6rem;
}

@media(min-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.full-width { grid-column: 1 / -1; }

.stats-edit-section {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e2e8f0;
}

.stats-edit-section h3 {
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
  color: #334155;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

@media(min-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.form-group label {
  display: block;
  margin-bottom: 0.2rem;
  font-weight: 600;
  font-size: 0.78rem;
  color: #475569;
}

.form-group input, 
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  box-sizing: border-box;
  font-size: 0.88rem;
  background-color: #fff;
}

.score-inputs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.input-score {
  font-size: 1.25rem;
  text-align: center;
  font-weight: bold;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.btn-primary, .btn-secondary {
  padding: 0.55rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.85rem;
  border: none;
}
.btn-primary { background: #2563eb; color: white; }
.btn-secondary { background: #e2e8f0; color: #475569; }

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  color: #94a3b8;
  padding: 2.5rem 0;
}

.jugador-form {
  background: #f8fafc;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-bottom: 1rem;
}

.jugador-form h4 {
  margin: 0 0 0.4rem 0;
  font-size: 0.85rem;
  color: #334155;
}

.jugador-form-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

@media(min-width: 640px) {
  .jugador-form-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1.5fr auto;
  }
}

.btn-primary-sm {
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.4rem 0.7rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.8rem;
}

.read-only-banner {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  font-size: 0.8rem;
  margin-bottom: 0.75rem;
}

.posicion-tag {
  background: #f1f5f9;
  color: #475569;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
}

.goleadores-card {
  background: white;
  padding: 1.25rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.text-center {
  text-align: center;
  color: #94a3b8;
  padding: 1.5rem 0;
}

.action-buttons-cell {
  display: flex;
  gap: 0.25rem;
  justify-content: center;
}
.file-input {
  padding: 0.4rem !important;
  background: #f8fafc;
  cursor: pointer;
}

.logo-preview-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
  background: #f1f5f9;
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
}

.preview-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #94a3b8;
}

.preview-text {
  font-size: 0.8rem;
  color: #475569;
  font-weight: 500;
}
</style>