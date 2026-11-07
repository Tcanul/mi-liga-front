import { createApp } from 'vue'
import { createPinia } from 'pinia' // 1. Importar createPinia
import App from './App.vue'
import router from './router' // O index.ts

import './assets/main.css' // O tus estilos globales si los tienes

const app = createApp(App)

app.use(createPinia()) // 2. Registrar Pinia en la aplicación
app.use(router)

app.mount('#app')