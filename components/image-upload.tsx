'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface ImageUploadProps {
  value?: string | null
  onChange: (url: string | null) => void
  disabled?: boolean
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreview(value || null)
  }, [value])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const selectedFile = acceptedFiles[0]
      if (selectedFile) {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          setPreview(result)
          // Trigger onChange with preview and file
          const input = document.getElementById('trade-image-file') as HTMLInputElement
          if (input) {
            const dataTransfer = new DataTransfer()
            dataTransfer.items.add(selectedFile)
            input.files = dataTransfer.files
            input.dispatchEvent(new Event('change', { bubbles: true }))
          }
        }
        reader.readAsDataURL(selectedFile)
      }
    },
    []
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    maxFiles: 1,
    disabled,
  })

  const handleRemove = () => {
    setPreview(null)
    onChange(null)
    const input = document.getElementById('trade-image-file') as HTMLInputElement
    if (input) {
      input.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <input type="file" id="trade-image-file" className="hidden" />
      {preview ? (
        <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
          <Image
            src={preview}
            alt="Trade screenshot"
            fill
            className="object-contain"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary'}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            {isDragActive ? (
              <p className="text-sm text-muted-foreground">Drop the image here...</p>
            ) : (
              <>
                <p className="text-sm font-medium">
                  Drop your trade screenshot here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, JPEG or WEBP (max 10MB)
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
