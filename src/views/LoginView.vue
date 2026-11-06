<template>
  <div class="login-container">
    <div class="login-card">
      <!-- ⚽ Logo y Título del Torneo -->
      <div class="login-logo-header">
        <div class="logo-icon">⚽</div>
        <h1>Mi liga de futbol</h1>
        <p>Plataforma de gestión de torneos y estadísticas</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Correo Electrónico</label>
          <input v-model="email" type="email" placeholder="admin@ligas.com" required />
        </div>
        <div class="form-group">
          <label>Contraseña</label>
          <input v-model="password" type="password" placeholder="••••••••" required />
        </div>
        
        <!-- Mensaje de error si falla -->
        <p v-if="error" class="error-msg">{{ error }}</p>

        <button type="submit" class="btn-primary" :disabled="cargando">
          {{ cargando ? 'Validando...' : 'Ingresar al Torneo' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const email = ref('')
const password = ref('')
const error = ref('')
const cargando = ref(false)

const authStore = useAuthStore()
const router = useRouter()

async function handleLogin() {
  try {
    error.value = ''
    cargando.value = true
    
    // Llamada al backend a través de Pinia
    await authStore.login(email.value, password.value)

    // Si es correcto, redirige al Home (o dashboard principal)
    router.push({ name: 'home' })
  } catch (err) {
    error.value = err.message || 'Correo o contraseña incorrectos'
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.85)), 
              url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop');
  background-size: cover;
  background-position: center;
  padding: 1rem;
}

.login-card {
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(10px);
  padding: 2.5rem;
  border-radius: 16px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.login-logo-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.login-logo-header h1 {
  font-size: 1.65rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.3rem 0;
  letter-spacing: -0.5px;
}

.login-logo-header p {
  color: #64748b;
  font-size: 0.88rem;
  margin: 0;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  color: #334155;
}

.form-group input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.95rem;
  box-sizing: border-box;
  transition: all 0.2s ease;
  background: #f8fafc;
}

.form-group input:focus {
  outline: none;
  border-color: #10b981;
  background: white;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
}

.btn-primary {
  width: 100%;
  background: #10b981;
  color: white;
  border: none;
  padding: 0.85rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  margin-top: 0.5rem;
}

.btn-primary:hover {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: 0 6px 15px rgba(16, 185, 129, 0.4);
}

.btn-primary:disabled {
  background: #93c5fd;
  box-shadow: none;
  cursor: not-allowed;
  transform: none;
}

.error-msg {
  color: #dc2626;
  font-size: 0.85rem;
  margin-bottom: 1rem;
  text-align: center;
  background: #fee2e2;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #fecaca;
}
</style>