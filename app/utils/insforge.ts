import { createClient } from '@insforge/sdk'

export const insforge = createClient({
  baseUrl: 'https://backend.mhalong.com',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4ODU5MDF9.Ygjhh-RfyPtlJ7ee0f3XDhHhT0gbwHhKuKVZKUvv1-8',
})
