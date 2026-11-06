import { defineStore } from 'pinia'
import { ref } from 'vue'

const API_LIGAS_URL = 'http://localhost:4000/api/ligas'
const API_EQUIPOS_URL = 'http://localhost:4000/api/equipos'
const API_PARTIDOS_URL = 'http://localhost:4000/api/partidos'
const API_JUGADORES_URL = 'http://localhost:4000/api/jugadores'

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
      const res = await fetch(API_LIGAS_URL)
      if (res.ok) {
        ligas.value = await res.json()
      }
    } catch (error) {
      console.error('Error al obtener ligas:', error)
    }
  }

  async function seleccionarLiga(id) {
    try {
      let encontrada = ligas.value.find(l => l.id === id)
      
      if (encontrada) {
        ligaActual.value = encontrada
      } else {
        const res = await fetch(`${API_LIGAS_URL}/${id}`)
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
      const res = await fetch(API_LIGAS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (res.ok) {
        const nuevaLiga = await res.json()
        // Agregamos la nueva liga al inicio del array para actualizar la interfaz al instante
        ligas.value.unshift(nuevaLiga)
        return nuevaLiga
      } else {
        const errorData = await res.json()
        console.error('Error al crear la liga:', errorData.error)
        throw new Error(errorData.error || 'No se pudo crear la liga')
      }
    } catch (error) {
      console.error('Error de red al crear la liga:', error)
      throw error
    }
  }

  async function actualizarLiga(id, data) {
    try {
      const res = await fetch(`${API_LIGAS_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (res.ok) {
        const actualizada = await res.json()
        const index = ligas.value.findIndex(l => l.id === id)
        if (index !== -1) ligas.value[index] = actualizada
        if (ligaActual.value && ligaActual.value.id === id) {
          ligaActual.value = actualizada
        }
      }
    } catch (error) {
      console.error('Error al actualizar liga:', error)
    }
  }

  async function eliminarLiga(id) {
    try {
      const res = await fetch(`${API_LIGAS_URL}/${id}`, { method: 'DELETE' })
      if (res.ok) {
        ligas.value = ligas.value.filter(l => l.id !== id)
        if (ligaActual.value && ligaActual.value.id === id) {
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
      const res = await fetch(`${API_LIGAS_URL}/${ligaId}/equipos`)
      if (res.ok) {
        equipos.value = await res.json()
      }
    } catch (error) {
      console.error('Error al obtener equipos:', error)
    }
  }

  async function crearEquipo(data) {
    try {
      const res = await fetch(API_EQUIPOS_URL, {
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
      const res = await fetch(`${API_EQUIPOS_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (res.ok) {
        const actualizado = await res.json()
        const index = equipos.value.findIndex(e => e.id === id)
        if (index !== -1) equipos.value[index] = actualizado
      }
    } catch (error) {
      console.error('Error al actualizar equipo:', error)
    }
  }

  async function eliminarEquipo(id) {
    try {
      const res = await fetch(`${API_EQUIPOS_URL}/${id}`, { method: 'DELETE' })
      if (res.ok) {
        equipos.value = equipos.value.filter(e => e.id !== id)
      }
    } catch (error) {
      console.error('Error al eliminar equipo:', error)
    }
  }

  // --- MÉTODOS DE PARTIDOS ---

  async function obtenerPartidosPorJornada(ligaId, jornada) {
    try {
      const res = await fetch(`${API_LIGAS_URL}/${ligaId}/partidos?jornada=${jornada}`)
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
      const res = await fetch(API_PARTIDOS_URL, {
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
      const res = await fetch(`${API_PARTIDOS_URL}/${id}`, { method: 'DELETE' })
      if (res.ok) {
        await obtenerPartidosPorJornada(ligaId, jornada)
      }
    } catch (error) {
      console.error('Error al eliminar partido:', error)
    }
  }

  async function actualizarPartido(id, data, ligaId, jornada) {
    try {
      const res = await fetch(`${API_PARTIDOS_URL}/${id}`, {
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
  async function obtenerJugadoresPorEquipo(equipoId) {
  try {
    const res = await fetch(`http://localhost:4000/api/equipos/${equipoId}/jugadores`)
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
    const res = await fetch(API_JUGADORES_URL, {
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
    const res = await fetch(`${API_JUGADORES_URL}/${id}`, {
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
    const res = await fetch(`${API_JUGADORES_URL}/${id}`, { method: 'DELETE' })
    if (res.ok) {
      await obtenerJugadoresPorEquipo(equipoId)
    }
  } catch (error) {
    console.error('Error al eliminar jugador:', error)
  }
}

async function obtenerGoleadores(ligaId) {
  try {
    const res = await fetch(`http://localhost:4000/api/ligas/${ligaId}/goleadores`)
    if (res.ok) {
      const data = await res.json() // 👈 Asegúrate de que 'data' esté declarada aquí con const o let
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