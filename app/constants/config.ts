export const PROJECT_PROGRESS_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const

export const PROJECT_PROGRESS_STATUS_LABEL = {
  PENDING: 'ขาขึ้น',
  APPROVED: 'ขาลง',
  REJECTED: 'ยกเลิก',
} as const

export const getStatusColor = (status: string): 'warning' | 'success' | 'error' | 'neutral' => {
  const statusMap: Record<string, 'warning' | 'success' | 'error' | 'neutral'> = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'error',
  }

  return statusMap[status] || 'neutral'
}
