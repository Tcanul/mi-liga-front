import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  
  // Tipamos explícitamente el usuario o permitimos null/any para evitar conflictos
  const savedUser = localStorage.getItem('user')
  const user = ref<any>(savedUser ? JSON.parse(savedUser) : null)

  async function login(email: string, password: string): Promise<void> {
    // Obtenemos la URL y le quitamos la barra final si la tiene por error
    const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
    const API_URL = rawApiUrl.replace(/\/+$/, '')
    
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Credenciales incorrectas')
    }

    // Guardar token y datos del usuario localmente
    token.value = data.token
    user.value = data.user

    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
  }

  function logout(): void {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return { token, user, login, logout }
})