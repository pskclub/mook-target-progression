export const PROJECT_PROGRESS_STATUS = {
  PLAN_IN: 'PLAN_IN',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const

export const PROJECT_PROGRESS_STATUS_LABEL = {
  PLAN_IN: 'เเพลนเข้าไป',
  PENDING: 'ขาขึ้น',
  APPROVED: 'ขาลง',
  REJECTED: 'ยกเลิก',
} as const

export const getStatusColor = (status: string): 'warning' | 'success' | 'error' | 'neutral' | 'info' => {
  const statusMap: Record<string, 'warning' | 'success' | 'error' | 'neutral' | 'info'> = {
    PLAN_IN: 'info',
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'error',
  }

  return statusMap[status] || 'neutral'
}

export const statusOptions: IOption[] = Object.values(PROJECT_PROGRESS_STATUS).map((status) => ({
  label: PROJECT_PROGRESS_STATUS_LABEL[status],
  value: status,
}))
