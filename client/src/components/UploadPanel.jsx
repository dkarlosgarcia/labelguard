import { useState, useRef } from 'react'
import axios from 'axios'

function UploadPanel({ setResult, setLoading, setError, loading }) {
  const [preview, setPreview] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()

  const handleFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  const handleAnalyze = async (file) => {
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)

    const reader = new FileReader()
    reader.onload = async (e) => {
      const dataUrl = e.target.result
      const [meta, base64] = dataUrl.split(',')
      const mediaType = meta.match(/:(.*?);/)[1]

      try {
        const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'
        const response = await axios.post(`${apiBase}/api/analyze`, {
          imageBase64: base64,
          mediaType
        })
        setResult(response.data)
      } catch (err) {
        setError('Analysis failed. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const onFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFile(file)
      handleAnalyze(file)
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
      handleAnalyze(file)
    }
  }

  return (
    <div className="panel upload-panel">
      <h2 className="panel-title">1. Upload Label Image</h2>

      <div
        className={`dropzone ${dragOver ? 'drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current.click()}
      >
        {preview ? (
          <img src={preview} alt="Label preview" className="preview-img" />
        ) : (
          <>
            <div className="upload-icon">⬆</div>
            <p>Drag and drop your image here</p>
            <p className="upload-hint">or <span className="link">click to browse</span></p>
            <p className="upload-meta">Supports: JPG, PNG, WEBP · Max size: 10MB</p>
          </>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={onFileChange}
      />

      {loading && <p className="loading-text">Analyzing label...</p>}
    </div>
  )
}

export default UploadPanel
