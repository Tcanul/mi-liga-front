<template>
  <div class="info-tooltip-container">
    <!-- Icono de información (puedes usar un SVG, un ícono de FontAwesome o un simple círculo con una "i") -->
    <button type="button" class="btn-info-icon" @click.stop="toggleTooltip" title="Más información">
      ℹ️
    </button>

    <!-- Popup flotante -->
    <div v-if="isOpen" class="tooltip-popup">
      <div class="tooltip-header">
        <span class="tooltip-title">{{ titulo }}</span>
        <button type="button" class="tooltip-close" @click="isOpen = false">&times;</button>
      </div>
      <p class="tooltip-text">{{ descripcion }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Recibimos la descripción y el título como propiedades (props)
defineProps({
  titulo: {
    type: String,
    default: 'Información'
  },
  descripcion: {
    type: String,
    required: true
  }
})

const isOpen = ref(false)

function toggleTooltip() {
  isOpen.value = !isOpen.value
}

// Opcional: Cerrar el popup si haces clic fuera de él
function handleClickOutside(event) {
  if (!event.target.closest('.info-tooltip-container')) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.info-tooltip-container {
  position: relative;
  display: inline-block;
  margin-left: 6px;
}

.btn-info-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.btn-info-icon:hover {
  opacity: 1;
}

/* Estilos del popup flotante */
.tooltip-popup {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 125%; /* Se muestra arriba del icono */
  width: 260px;
  background: #1e293b; /* Color oscuro acorde a tu navbar */
  color: #f8fafc;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -4px rgba(0, 0, 0, 0.2);
  font-size: 0.85rem;
  z-index: 50;
  text-align: left;
  animation: fadeIn 0.15s ease-in-out;
}

/* Pequeña flecha apuntando hacia abajo */
.tooltip-popup::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 6px;
  border-style: solid;
  border-color: #1e293b transparent transparent transparent;
}

.tooltip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.35rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 0.25rem;
}

.tooltip-title {
  font-weight: 600;
  color: #38bdf8; /* Azul claro para destacar el título */
}

.tooltip-close {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.tooltip-close:hover {
  color: #ffffff;
}

.tooltip-text {
  margin: 0;
  line-height: 1.4;
  color: #cbd5e1;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>