"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import bcrypt from "bcryptjs"

interface AdminUser {
  id: string
  cpf_cnpj: string
  name: string
}

interface AuthContextType {
  isAdmin: boolean
  adminUser: AdminUser | null
  isLoading: boolean
  login: (cpfCnpj: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isSupabaseConfigured: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_KEY = "restaurant_admin_session"

// Fallback para quando Supabase não está configurado
const FALLBACK_ADMIN = {
  cpfCnpj: "00000000000",
  password: "admin123",
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      setIsSupabaseConfigured(!!supabase)

      const stored = localStorage.getItem(AUTH_KEY)
      if (stored) {
        try {
          const session = JSON.parse(stored)
          if (session.expiresAt > Date.now()) {
            setIsAdmin(true)
            setAdminUser(session.user)
          } else {
            localStorage.removeItem(AUTH_KEY)
          }
        } catch {
          localStorage.removeItem(AUTH_KEY)
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (cpfCnpj: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanCpfCnpj = cpfCnpj.replace(/\D/g, "")
    const supabase = createClient()

    // Se Supabase não está configurado, usa fallback
    if (!supabase) {
      if (cleanCpfCnpj === FALLBACK_ADMIN.cpfCnpj && password === FALLBACK_ADMIN.password) {
        const user: AdminUser = {
          id: "fallback",
          cpf_cnpj: cleanCpfCnpj,
          name: "Administrador",
        }
        const session = {
          user,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 horas
        }
        localStorage.setItem(AUTH_KEY, JSON.stringify(session))
        setIsAdmin(true)
        setAdminUser(user)
        return { success: true }
      }
      return { success: false, error: "CPF/CNPJ ou senha incorretos" }
    }

    // Busca admin no banco de dados
    const { data: admin, error } = await supabase
      .from("admin_users")
      .select("id, cpf_cnpj, name, password_hash")
      .eq("cpf_cnpj", cleanCpfCnpj)
      .single()

    if (error || !admin) {
      return { success: false, error: "CPF/CNPJ não encontrado" }
    }

    // Verifica a senha
    const isValidPassword = await bcrypt.compare(password, admin.password_hash)
    if (!isValidPassword) {
      return { success: false, error: "Senha incorreta" }
    }

    const user: AdminUser = {
      id: admin.id,
      cpf_cnpj: admin.cpf_cnpj,
      name: admin.name,
    }

    const session = {
      user,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 horas
    }
    localStorage.setItem(AUTH_KEY, JSON.stringify(session))
    setIsAdmin(true)
    setAdminUser(user)

    return { success: true }
  }

  const logout = () => {
    setIsAdmin(false)
    setAdminUser(null)
    localStorage.removeItem(AUTH_KEY)
  }

  return (
    <AuthContext.Provider value={{ isAdmin, adminUser, isLoading, login, logout, isSupabaseConfigured }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
