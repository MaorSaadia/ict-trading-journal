'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  value?: string | null
  onChange: (file: File | null) => void
  disabled?: boolean
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  // ✅ FIX: Initialize preview from value prop (existing image URL)
  const [preview, setPreview] = useState<string | null>(value || null)

  // ✅ FIX: Update preview when value prop changes (e.g. when edit dialog opens)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreview(value || null)
  }, [value])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const selectedFile = acceptedFiles[0]
      if (!selectedFile) return

      // Show local preview
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)

      // Pass file to parent
      onChange(selectedFile)
    },
    [onChange]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    maxFiles: 1,
    disabled,
  })

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPreview(null)
    onChange(null)
  }

  return (
    <div className="space-y-2">
      {preview ? (
        // ✅ Show existing image OR new preview
        <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted group">
          <Image
            src={preview}
            alt="Trade screenshot"
            fill
            className="object-contain"
            // ✅ unoptimized for blob/data URLs from local preview
            unoptimized={preview.startsWith('data:')}
          />
          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-md p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {/* Click to replace */}
          {!disabled && (
            <div
              {...getRootProps()}
              className="absolute inset-0 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <input {...getInputProps()} />
              <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                Click to replace
              </span>
            </div>
          )}
        </div>
      ) : (
        // Dropzone when no image
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary hover:bg-primary/5'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            {isDragActive ? (
              <p className="text-sm text-muted-foreground">Drop image here...</p>
            ) : (
              <>
                <p className="text-sm font-medium">
                  Drop screenshot here or click to browse
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