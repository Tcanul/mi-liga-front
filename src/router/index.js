import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LigaDashboard from '../views/LigaDashboard.vue'
import LoginView from '../views/LoginView.vue'
import { useAuthStore } from '@/stores/authStore'
import UsuariosView from '@/views/UsuariosView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true } // Requiere estar logueado
    },
    {
      path: '/liga/:id',
      name: 'liga-dashboard',
      component: LigaDashboard,
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: '/usuarios',
      name: 'usuarios',
      component: UsuariosView,
      meta: { requiresAuth: true }
    }
  ]
})

// Guardia global para proteger rutas según el rol o sesión
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const token = authStore.token

  if (to.meta.requiresAuth && !token) {
    // Si la ruta requiere sesión y no hay token, manda al Login
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router