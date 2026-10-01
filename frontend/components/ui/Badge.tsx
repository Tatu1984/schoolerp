'use client'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  }

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  )
}

// Status badge for common statuses
interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const statusVariants: Record<string, BadgeProps['variant']> = {
    // Payment statuses
    PENDING: 'warning',
    PAID: 'success',
    PARTIAL: 'info',
    OVERDUE: 'danger',
    CANCELLED: 'default',

    // Order statuses
    CONFIRMED: 'info',
    PREPARING: 'warning',
    READY: 'success',
    DELIVERED: 'success',
    PROCESSING: 'info',
    SHIPPED: 'info',

    // General statuses
    ACTIVE: 'success',
    INACTIVE: 'default',
    APPROVED: 'success',
    REJECTED: 'danger',

    // Admission statuses
    INQUIRY: 'info',
    PROSPECT: 'info',
    TEST_SCHEDULED: 'warning',
    TEST_COMPLETED: 'warning',
    INTERVIEW_SCHEDULED: 'warning',
    WAITLISTED: 'warning',
    ADMITTED: 'success',

    // Leave statuses

    // Library issue statuses
    ISSUED: 'info',
    RETURNED: 'success',
    LOST: 'danger',
    DAMAGED: 'danger',

    // Default
    DEFAULT: 'default',
  }

  const variant = statusVariants[status.toUpperCase()] || 'default'
  const displayStatus = status.replace(/_/g, ' ')

  return (
    <Badge variant={variant} className={className}>
      {displayStatus}
    </Badge>
  )
}
