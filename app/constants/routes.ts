export const routes = {
  login: {
    label: 'เข้าสู่ระบบ',
    to: '/login',
  },
  dashboard: {
    label: 'หน้าแรก',
    to: '/',
  },
  projects: {
    label: 'โครงการ',
    to: '/projects',
  },
  settings: {
    label: 'ตั้งค่า',
    to: '/settings',
  },
  zones: {
    label: 'เขต',
    to: '/zones',
  },
  products: {
    label: 'สินค้า',
    to: '/products',
  },
  customers: {
    label: 'ลูกค้า',
    to: '/customers',
  },
} as const
