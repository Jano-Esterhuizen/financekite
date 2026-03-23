import axios from 'axios'
import { createClient } from '@/lib/supabase/client'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Automatically attach the Supabase JWT to every request
api.interceptors.request.use(async (config) => {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }

  return config
})

// Handle 401s globally — redirect to sign in
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const supabase = createClient()
      await supabase.auth.signOut()
      window.location.href = '/sign-in'
    }
    return Promise.reject(error)
  }
)

export default api

/*
📘 Why an Axios interceptor? An interceptor runs automatically before every request and after every response. 
The request interceptor attaches the JWT token so we never have to remember to add it manually in each API call. 
The response interceptor catches 401 errors globally
if the token expires, the user is automatically signed out and redirected, instead of seeing a broken page.
 */