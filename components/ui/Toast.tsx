'use client'

import { Toaster, toast as hotToast } from 'react-hot-toast'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

// Custom toast component
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#fff',
          color: '#363636',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        },
        success: {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          style: {
            border: '1px solid #10B981',
          },
        },
        error: {
          icon: <XCircle className="w-5 h-5 text-red-500" />,
          duration: 5000,
          style: {
            border: '1px solid #EF4444',
          },
        },
      }}
    />
  )
}

// Custom toast functions
export const toast = {
  success: (message: string) => {
    hotToast.success(message, {
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    })
  },
  error: (message: string) => {
    hotToast.error(message, {
      icon: <XCircle className="w-5 h-5 text-red-500" />,
    })
  },
  warning: (message: string) => {
    hotToast(message, {
      icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
      style: {
        border: '1px solid #F59E0B',
      },
    })
  },
  info: (message: string) => {
    hotToast(message, {
      icon: <Info className="w-5 h-5 text-blue-500" />,
      style: {
        border: '1px solid #3B82F6',
      },
    })
  },
  loading: (message: string) => {
    return hotToast.loading(message)
  },
  dismiss: (toastId?: string) => {
    hotToast.dismiss(toastId)
  },
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string
      error: string
    }
  ) => {
    return hotToast.promise(promise, messages)
  },
}

// Hook for using toast in components
interface ToastOptions {
  title: string
  description?: string
  variant?: 'success' | 'error' | 'warning' | 'info'
}

export function useToast() {
  return {
    toast: (options: ToastOptions) => {
      const { title, description, variant = 'info' } = options
      const message = description ? `${title}: ${description}` : title

      switch (variant) {
        case 'success':
          toast.success(message)
          break
        case 'error':
          toast.error(message)
          break
        case 'warning':
          toast.warning(message)
          break
        case 'info':
        default:
          toast.info(message)
          break
      }
    },
  }
}

// Confirmation dialog using toast
export function confirmAction(
  message: string,
  onConfirm: () => void | Promise<void>,
  onCancel?: () => void
) {
  hotToast(
    (t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-gray-700">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              hotToast.dismiss(t.id)
              onCancel?.()
            }}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              hotToast.dismiss(t.id)
              await onConfirm()
            }}
            className="px-3 py-1.5 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            Confirm
          </button>
        </div>
      </div>
    ),
    {
      duration: Infinity,
      style: {
        maxWidth: '400px',
      },
    }
  )
}
