"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { AdminLogin } from "@/components/admin/admin-login"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { Loader2 } from "lucide-react"

export default function AdminPage() {
  const { isAdmin, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    )
  }

  return isAdmin ? <AdminDashboard /> : <AdminLogin />
}
