// components/Loading/Loading.tsx
'use client'
import { useLoading } from '@/contexts/LoadingContext'
import { useState, useEffect } from 'react'
import './loading.scss' // Import your loading styles

export default function Loading() {
  const { isLoading } = useLoading()
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    if (isLoading) {
      // 5-second timer
      const timer = setTimeout(() => {
        setFadeOut(true) // Start fade out
      }, 5000) // 5 seconds

      return () => clearTimeout(timer)
    }
  }, [isLoading])

  // Hide component after fade out
  useEffect(() => {
    if (fadeOut) {
      const timer = setTimeout(() => {
        // This will be handled by the context
      }, 500) // Match CSS transition duration
      
      return () => clearTimeout(timer)
    }
  }, [fadeOut])

  if (!isLoading) return null

  return (
    <div className={`loading-overlay ${fadeOut ? 'fade-out' : ''}`}>
      <div className="loading-content">
        {/* Your custom loading design here */}
        <div className="custom-spinner"></div>
        <h2>Loading...</h2>
      </div>
    </div>
  )
}