let listeners = []
let toasts = []

export const toast = {
  success: (message, duration = 3000) => addToast(message, 'success', duration),
  error: (message, duration = 4000) => addToast(message, 'error', duration),
  info: (message, duration = 3000) => addToast(message, 'info', duration),
}

function addToast(message, type, duration) {
  const id = Date.now() + Math.random().toString(36).substr(2, 9)
  const newToast = { id, message, type }
  toasts = [...toasts, newToast]
  emit()

  if (duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }
}

export function removeToast(id) {
  toasts = toasts.filter((t) => t.id !== id)
  emit()
}

export function subscribeToasts(callback) {
  listeners.push(callback)
  callback(toasts)
  return () => {
    listeners = listeners.filter((l) => l !== callback)
  }
}

function emit() {
  for (const listener of listeners) {
    listener(toasts)
  }
}
