// app/loading.tsx
import './loading.scss'

export default function Loading() {
  return (
    <div className="loading-container">
      <div className="loading-content">
        {/* Your loading animation/content here */}
        <div className="spinner"></div>
        <h2>Loading...</h2>
      </div>
    </div>
  )
}