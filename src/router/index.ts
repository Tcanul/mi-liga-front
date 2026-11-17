import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LigaDashboard from '../views/ligaDashBoard.vue'
import LoginView from '../views/LoginView.vue'
import { useAuthStore } from '@/stores/authStore.ts'
import UsuariosView from '@/views/UsuariosView.vue'
import TablaGeneralPublica from '@/views/TablaGeneralPublica.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'HomePublica',
      component: TablaGeneralPublica
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guestOnly: true } // 👈 Evita que usuarios con sesión entren aquí
    },
    {
      path: '/homeView',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
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

// Guardia global para proteger rutas según la sesión
router.beforeEach((to, _, next) => {
  const authStore = useAuthStore()
  const token = authStore.token

  // 1. Si la ruta es exclusiva para invitados (login) y YA tiene token, mandarlo al inicio
  //if (to.meta.guestOnly && token) {
  //  return next({ name: 'HomePublica' }) // O puedes mandarlo a '/homeView'
  //}

  // 2. Si la ruta requiere autenticación y NO hay token, mandar al login
  if (to.meta.requiresAuth && !token) {
    return next({ name: 'login' })
  }

  next()
})
export default router