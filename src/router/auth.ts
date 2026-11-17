import { createRouter, createWebHistory } from 'vue-router';
// O si es un archivo de rutas o controlador de Pinia/Auth en tu frontend, 
// asegúrate de usar la sintaxis de importación correcta.

// Si este archivo es un router de Vue, la estructura correcta sería así:
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue') // Ejemplo de vista
  }
  // ... tus otras rutas
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token') // O usa tu authStore.token

  // Si la ruta es exclusiva para invitados (como el login) y ya hay sesión activa:
  //if (to.meta.guestOnly && token) {
  //  return next({ path: '/' }) // Lo mandamos al home o dashboard
  //}

  // Si la ruta requiere autenticación y NO hay sesión:
  if (to.meta.requiresAuth && !token) {
    return next({ path: '/login' })
  }

  next() // Continuar normalmente
})

export default router;