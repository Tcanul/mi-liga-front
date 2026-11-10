<template>
  <div id="app">
    <!-- Navbar superior condicional (Solo se muestra si hay sesión) -->
    <nav v-if="authStore.user" class="navbar">
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
import { RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const router = useRouter()

function cerrarSesion() {
  authStore.logout()
  router.push('/')
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