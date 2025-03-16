'use client'

import { useState, useRef, type ChangeEvent } from 'react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'

export default function ImageUploadPreview() {
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setPreview(null)
      return
    }

    // ファイルサイズチェック (10MB以下)
    if (file.size > 10 * 1024 * 1024) {
      alert('ファイルサイズは10MB以下にしてください')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      setPreview(null)
      return
    }

    // 画像ファイルかチェック
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      setPreview(null)
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleClearImage = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <Input
        id="image"
        name="image"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
      />
      
      {preview && (
        <div className="mt-4 space-y-2">
          <div className="relative aspect-video w-full max-h-[300px] overflow-hidden rounded-md border border-gray-200">
            <Image
              src={preview}
              alt="プレビュー"
              fill
              className="object-contain"
            />
          </div>
          <button
            type="button"
            onClick={handleClearImage}
            className="text-sm text-red-500 hover:text-red-700"
          >
            画像をクリア
          </button>
        </div>
      )}
    </div>
  )
} 