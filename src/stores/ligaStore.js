import { defineStore } from 'pinia'
import { ref } from 'vue'

// Definimos una base limpia para la API (removiendo barras finales por seguridad)
const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const API_BASE_URL = rawApiUrl.replace(/\/+$/, '')

export const useLigaStore = defineStore('liga', () => {
  const ligas = ref([])
  const ligaActual = ref(null)
  const equipos = ref([])
  const partidos = ref([])
  const jugadores = ref([])
  const goleadoresTop = ref([])
  
  // --- MÉTODOS DE LIGAS ---

  async function obtenerLigas() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ligas`)
      if (res.ok) {
        ligas.value = await res.json()
      }
    } catch (error) {
      console.error('Error al obtener ligas:', error)
    }
  }

  async function seleccionarLiga(id) {
    try {
      let encontrada = ligas.value.find(l => l.id === id || l._id === id)
      
      if (encontrada) {
        ligaActual.value = encontrada
      } else {
        const res = await fetch(`${API_BASE_URL}/api/ligas/${id}`)
        if (res.ok) {
          ligaActual.value = await res.json()
        }
      }
    } catch (error) {
      console.error('Error al seleccionar la liga:', error)
    }
  }

  async function crearLiga(data) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ligas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const responseData = await res.json()

      if (res.ok) {
        ligas.value.unshift(responseData)
        return responseData
      } else {
        throw new Error(responseData.error || 'No se pudo crear la liga')
      }
    } catch (error) {
      console.error('Error de red al crear la liga:', error)
      throw error
    }
  }

  async function actualizarLiga(id, data) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ligas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (res.ok) {
        const actualizada = await res.json()
        const index = ligas.value.findIndex(l => l.id === id || l._id === id)
        if (index !== -1) ligas.value[index] = actualizada
        if (ligaActual.value && (ligaActual.value.id === id || ligaActual.value._id === id)) {
          ligaActual.value = actualizada
        }
      }
    } catch (error) {
      console.error('Error al actualizar liga:', error)
    }
  }

  async function eliminarLiga(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ligas/${id}`, { method: 'DELETE' })
      if (res.ok) {
        ligas.value = ligas.value.filter(l => l.id !== id && l._id !== id)
        if (ligaActual.value && (ligaActual.value.id === id || ligaActual.value._id === id)) {
          ligaActual.value = null
        }
      }
    } catch (error) {
      console.error('Error al eliminar liga:', error)
    }
  }

  // --- MÉTODOS DE EQUIPOS ---

  async function obtenerEquiposPorLiga(ligaId) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ligas/${ligaId}/equipos`)
      if (res.ok) {
        equipos.value = await res.json()
      } else {
        equipos.value = []
      }
    } catch (error) {
      console.error('Error al obtener equipos:', error)
      equipos.value = []
    }
  }

  async function crearEquipo(data) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/equipos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (res.ok) {
        const nuevo = await res.json()
        equipos.value.unshift(nuevo)
      }
    } catch (error) {
      console.error('Error al crear equipo:', error)
    }
  }

  async function actualizarEquipo(id, data) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/equipos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (res.ok) {
        const actualizado = await res.json()
        const index = equipos.value.findIndex(e => e.id === id || e._id === id)
        if (index !== -1) equipos.value[index] = actualizado
      }
    } catch (error) {
      console.error('Error al actualizar equipo:', error)
    }
  }

  async function eliminarEquipo(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/equipos/${id}`, { method: 'DELETE' })
      if (res.ok) {
        equipos.value = equipos.value.filter(e => e.id !== id && e._id !== id)
      }
    } catch (error) {
      console.error('Error al eliminar equipo:', error)
    }
  }

  // --- MÉTODOS DE PARTIDOS ---

  async function obtenerPartidosPorJornada(ligaId, jornada) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ligas/${ligaId}/partidos?jornada=${jornada}`)
      if (res.ok) {
        const data = await res.json()
        partidos.value = Array.isArray(data) ? data : []
      } else {
        partidos.value = []
      }
    } catch (error) {
      console.error('Error al obtener partidos:', error)
      partidos.value = []
    }
  }

  async function crearPartido(data) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/partidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (res.ok) {
        await obtenerPartidosPorJornada(data.ligaId, data.jornada)
      }
    } catch (error) {
      console.error('Error al crear el partido:', error)
    }
  }

  async function eliminarPartido(id, ligaId, jornada) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/partidos/${id}`, { method: 'DELETE' })
      if (res.ok) {
        await obtenerPartidosPorJornada(ligaId, jornada)
      }
    } catch (error) {
      console.error('Error al eliminar partido:', error)
    }
  }

  async function actualizarPartido(id, data, ligaId, jornada) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/partidos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (res.ok) {
        await obtenerPartidosPorJornada(ligaId, jornada)
      }
    } catch (error) {
      console.error('Error al actualizar el partido:', error)
    }
  }

  // --- MÉTODOS DE JUGADORES ---

  async function obtenerJugadoresPorEquipo(equipoId) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/equipos/${equipoId}/jugadores`)
      if (res.ok) {
        jugadores.value = await res.json()
      } else {
        jugadores.value = []
      }
    } catch (error) {
      console.error('Error al obtener jugadores:', error)
      jugadores.value = []
    }
  }

  async function crearJugador(data) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/jugadores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (res.ok) {
        await obtenerJugadoresPorEquipo(data.equipoId)
      }
    } catch (error) {
      console.error('Error al crear jugador:', error)
    }
  }

  async function actualizarJugador(id, data, equipoId) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/jugadores/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (res.ok) {
        await obtenerJugadoresPorEquipo(equipoId)
      }
    } catch (error) {
      console.error('Error al actualizar jugador:', error)
    }
  }

  async function eliminarJugador(id, equipoId) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/jugadores/${id}`, { method: 'DELETE' })
      if (res.ok) {
        await obtenerJugadoresPorEquipo(equipoId)
      }
    } catch (error) {
      console.error('Error al eliminar jugador:', error)
    }
  }

  async function obtenerGoleadores(ligaId) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ligas/${ligaId}/goleadores`)
      if (res.ok) {
        const data = await res.json()
        goleadoresTop.value = data
      } else {
        goleadoresTop.value = []
      }
    } catch (error) {
      console.error('Error al obtener goleadores:', error)
      goleadoresTop.value = []
    }
  }

  return { 
    ligas, 
    ligaActual, 
    equipos,
    partidos,
    obtenerLigas, 
    seleccionarLiga, 
    crearLiga, 
    actualizarLiga, 
    eliminarLiga,
    obtenerEquiposPorLiga,
    crearEquipo,
    actualizarEquipo,
    eliminarEquipo,
    obtenerPartidosPorJornada,
    crearPartido,
    eliminarPartido,
    actualizarPartido,
    jugadores, 
    obtenerJugadoresPorEquipo, 
    crearJugador, 
    actualizarJugador, 
    eliminarJugador,
    obtenerGoleadores,
    goleadoresTop
  }
})