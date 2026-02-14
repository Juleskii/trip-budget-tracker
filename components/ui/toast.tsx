'use client'

import { useEffect, useState } from 'react'

type ToastType = 'success' | 'error' | 'info'

type Toast = {
  id: string
  message: string
  type: ToastType
}

let toastListeners: Array<(toast: Toast) => void> = []
let toastIdCounter = 0

export function showToast(message: string, type: ToastType = 'success') {
  const toast: Toast = {
    id: `toast-${++toastIdCounter}`,
    message,
    type,
  }
  toastListeners.forEach((listener) => listener(toast))
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const listener = (toast: Toast) => {
      setToasts((prev) => [...prev, toast])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id))
      }, 4000)
    }
    toastListeners.push(listener)
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener)
    }
  }, [])

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  )
}

function Toast({ toast }: { toast: Toast }) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsExiting(true), 3600)
    return () => clearTimeout(timer)
  }, [])

  const styles = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  }

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  }

  return (
    <div
      className={`
        pointer-events-auto
        flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg
        min-w-[300px] max-w-md
        transform transition-all duration-300
        ${isExiting ? 'translate-x-[400px] opacity-0' : 'translate-x-0 opacity-100'}
        ${styles[toast.type]}
      `}
    >
      <span className="text-lg font-bold">{icons[toast.type]}</span>
      <p className="text-sm font-medium flex-1">{toast.message}</p>
    </div>
  )
}
