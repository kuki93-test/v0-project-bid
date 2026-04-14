"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { DashboardSidebar } from "./sidebar"

type DashboardMode = "buying" | "selling"

interface DashboardContextType {
  mode: DashboardMode
  setMode: (mode: DashboardMode) => void
}

const DashboardContext = createContext<DashboardContextType | null>(null)

export function useDashboardMode() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error("useDashboardMode must be used within DashboardWrapper")
  }
  return context
}

interface DashboardWrapperProps {
  children: React.ReactNode
  isAdmin: boolean
}

export function DashboardWrapper({ children, isAdmin }: DashboardWrapperProps) {
  const [mode, setModeState] = useState<DashboardMode>("buying")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Load saved mode from localStorage
    const savedMode = localStorage.getItem("dashboard-mode") as DashboardMode | null
    if (savedMode && (savedMode === "buying" || savedMode === "selling")) {
      setModeState(savedMode)
    }
    setMounted(true)
  }, [])

  const setMode = (newMode: DashboardMode) => {
    setModeState(newMode)
    localStorage.setItem("dashboard-mode", newMode)
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex gap-0 md:gap-8">
        <aside className="hidden w-56 shrink-0 md:block">
          <div className="sticky top-24 animate-pulse">
            <div className="mb-4 h-24 rounded-lg bg-muted" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-9 rounded-lg bg-muted" />
              ))}
            </div>
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    )
  }

  return (
    <DashboardContext.Provider value={{ mode, setMode }}>
      <div className="flex gap-0 md:gap-8">
        <DashboardSidebar 
          isAdmin={isAdmin} 
          mode={mode} 
          onModeChange={setMode} 
        />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </DashboardContext.Provider>
  )
}
