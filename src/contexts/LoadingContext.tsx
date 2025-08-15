// contexts/LoadingContext.tsx
// Path: src/contexts/LoadingContext.tsx (if using src folder)
// OR: contexts/LoadingContext.tsx (if no src folder)
'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface LoadingContextType {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  showLoading: () => void
  hideLoading: () => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true) // Start with loading
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // 5-second timer
    const timer = setTimeout(() => {
      setFadeOut(true) // Start fade out
      
      // Hide loading after fade animation
      setTimeout(() => {
        setIsLoading(false)
      }, 500) // Match CSS transition duration
      
    }, 3000) // 5 seconds

    return () => clearTimeout(timer)
  }, [])

  const showLoading = () => {
    setIsLoading(true)
    setFadeOut(false)
  }
  
  const hideLoading = () => {
    setFadeOut(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 500)
  }

  return (
    <LoadingContext.Provider value={{ 
      isLoading, 
      setIsLoading, 
      showLoading, 
      hideLoading 
    }}>
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}