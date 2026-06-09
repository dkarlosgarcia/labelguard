import axios from 'axios'

const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export async function analyzeLabel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const [meta, base64] = e.target.result.split(',')
      const mediaType = meta.match(/:(.*?);/)[1]
      try {
        const res = await axios.post(`${apiBase}/api/analyze`, { imageBase64: base64, mediaType })
        resolve(res.data)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
