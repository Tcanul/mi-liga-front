<template>
  <div class="goleadores-container">
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
        <tr v-for="(goleador, index) in ligaStore.goleadoresTop" :key="goleador.jugadorId">
          <td>{{ index + 1 }}</td>
          <td>{{ goleador.nombre }}</td>
          <td><strong>{{ goleador.goles }}</strong></td>
        </tr>
        <tr v-if="ligaStore.goleadoresTop.length === 0">
          <td colspan="3" class="text-center">Aún no hay goles registrados en esta liga.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useLigaStore } from '@/stores/ligaStore'

const route = useRoute()
const ligaStore = useLigaStore()
const ligaId = route.params.id

onMounted(async () => {
  await ligaStore.obtenerGoleadores(ligaId)
})
</script>

<style scoped>
.goleadores-container {
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}
.tabla-goleadores {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
.tabla-goleadores th, .tabla-goleadores td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
}
.tabla-goleadores th {
  background: #f8fafc;
  font-weight: 600;
}
</style>