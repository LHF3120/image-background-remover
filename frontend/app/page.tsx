'use client'
import { useState, useCallback, useRef } from 'react'
export default function Home() {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [fileName, setFileName] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const resultBlobRef = useRef<Blob | null>(null)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://image-background-remover.LHF3120.workers.dev'
  const handleFile = useCallback(async (file: File) => {
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) { setErrorMessage('Please upload JPG, PNG, or WEBP image.'); setState('error'); return }
    if (file.size > 50 * 1024 * 1024) { setErrorMessage('File too large. Maximum 50MB.'); setState('error'); return }
    const originalUrl = URL.createObjectURL(file)
    setOriginalImage(originalUrl)
    setFileName(file.name.replace(/\.[^.]+$/, '-no-bg.png'))
    setErrorMessage(null)
    setState('loading')
    try {
      const formData = new FormData()
      formData.append('image', file)
      const response = await fetch(API_URL, { method: 'POST', body: formData })
      if (!response.ok) throw new Error('Failed to remove background')
      const blob = await response.blob()
      resultBlobRef.current = blob
      setResultImage(URL.createObjectURL(blob))
      setState('success')
    } catch { setErrorMessage('Failed to process image. Please try again.'); setState('error') }
  }, [API_URL])
  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); const file = e.dataTransfer.files[0]; if (file) handleFile(file) }, [handleFile])
  const handleDownload = useCallback(() => {
    if (!resultBlobRef.current) return
    const url = URL.createObjectURL(resultBlobRef.current)
    const a = document.createElement('a')
    a.href = url; a.download = fileName
    document.body.appendChild(a); a.click()
    document.body.removeChild(a); URL.revokeObjectURL(url)
  }, [fileName])
  const handleReset = useCallback(() => {
    if (originalImage) URL.revokeObjectURL(originalImage)
    if (resultImage) URL.revokeObjectURL(resultImage)
    setOriginalImage(null); setResultImage(null); setErrorMessage(null); setState('idle'); setFileName(''); resultBlobRef.current = null
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [originalImage, resultImage])
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] flex flex-col">
      <header className="py-8 text-center text-white"><h1 className="text-4xl font-bold mb-2">🖼️ Image Background Remover</h1><p className="text-white/90 text-lg">Remove image backgrounds with one click</p></header>
      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-8">
          {(state === 'idle' || state === 'error') && (
            <div className={`border-3 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ${isDragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-500 hover:bg-gray-50'}`}
              onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }} onDragLeave={() => setIsDragOver(false)} onClick={() => fileInputRef.current?.click()}>
              <div className="text-6xl mb-4">📤</div>
              <p className="text-lg text-gray-600 mb-2">Drag & drop your image here, or <span className="text-indigo-500 font-semibold">browse</span></p>
              <p className="text-sm text-gray-400">Supports JPG, PNG, WEBP (max 50MB)</p>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
            </div>)}
          {state === 'error' && errorMessage && <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">{errorMessage}</div>}
          {state === 'loading' && <div className="py-16 text-center"><div className="w-16 h-16 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" /><p className="text-gray-600 text-lg">Removing background...</p></div>}
          {state === 'success' && (
            <>
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div><h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">Original</h3><div className="rounded-lg overflow-hidden bg-gray-100 p-4">{originalImage && <img src={originalImage} alt="Original" className="w-full h-auto max-h-80 object-contain mx-auto" />}</div></div>
                <div><h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">Result</h3><div className="rounded-lg overflow-hidden checkerboard p-4">{resultImage && <img src={resultImage} alt="Result" className="w-full h-auto max-h-80 object-contain mx-auto" />}</div></div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={handleDownload} className="px-8 py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-semibold rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">⬇️ Download Result</button>
                <button onClick={handleReset} className="px-8 py-3 bg-white text-indigo-500 font-semibold rounded-lg border-2 border-indigo-500 hover:bg-indigo-50 transition-all duration-200">🔄 Process Another</button>
              </div>
            </>
          )}
        </div>
      </div>
      <footer className="py-6 text-center text-white/80 text-sm"><p>Powered by <a href="https://www.remove.bg" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Remove.bg</a> + <a href="https://workers.cloudflare.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Cloudflare Workers</a></p></footer>
    </main>
  )
}
