export const baseUrl = typeof window === 'undefined' 
  ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  : process.env.NEXT_PUBLIC_API_URL || '';