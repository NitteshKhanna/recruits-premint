// contexts/LoadingContext.tsx
'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface LoadingContextType {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  showLoading: () => void
  hideLoading: () => void
  markContentReady: () => void // New function to mark content as ready
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [timerComplete, setTimerComplete] = useState(false)
  const [contentReady, setContentReady] = useState(false)

  // 5-second minimum timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimerComplete(true)
    }, 1000) // 5 seconds minimum

    return () => clearTimeout(timer)
  }, [])

  // Hide loading only when BOTH conditions are met
  useEffect(() => {
    if (timerComplete && contentReady) {
      // Optional: Add small delay for smooth transition
      setTimeout(() => {
        setIsLoading(false)
      }, 300)
    }
  }, [timerComplete, contentReady])

  const markContentReady = () => {
    setContentReady(true)
  }

  const showLoading = () => {
    setIsLoading(true)
    setTimerComplete(false)
    setContentReady(false)
  }
  
  const hideLoading = () => {
    setIsLoading(false)
  }

  return (
    <LoadingContext.Provider value={{ 
      isLoading, 
      setIsLoading, 
      showLoading, 
      hideLoading,
      markContentReady
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
