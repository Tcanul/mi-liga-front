<template>
  <div id="app">
    <nav class="navbar" v-if="mostrarNavbar">
      <div class="nav-brand">🏆 Sistema Ligas</div>
      <div class="nav-user">
        <span style="margin-right: 20px">Hola <strong>{{ authStore.user.nombre }} </strong> ({{ authStore.user.rol }})</span>
        <button @click="cerrarSesion" class="btn-logout">Cerrar Sesión</button>
      </div>
    </nav>

    <!-- Vistas principales -->
    <RouterView />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterView, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// Validamos estrictamente cuándo mostrar el navbar superior
const mostrarNavbar = computed(() => {
  const esLogin = route.path.startsWith('/login')
  const esPublico = route.path === '/' // La tabla general pública
  
  // Si hay usuario logueado, NO estamos en el login, y NO estamos en la raíz pública (opcional, adáptalo si quieres que se vea en el home)
  // O simplemente ocultarlo si es estrictamente el login:
  return authStore.user !== null && !esLogin && !esPublico
})

function cerrarSesion() {
  authStore.logout()
  router.push('/login')
}
</script>

<style>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #1e293b;
  color: white;
  padding: 1rem 2rem;
}
.btn-logout {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}
.btn-back
{
  background: #e2e8f0;
    border: none;
    padding: 0.6rem 1rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
}
</style>