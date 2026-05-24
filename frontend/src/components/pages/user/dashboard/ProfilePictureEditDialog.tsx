import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import { AlertCircle, Upload, Loader2 } from "lucide-react"
import Cropper from "react-easy-crop"
import "react-easy-crop/react-easy-crop.css"
import { uploadImage } from "@/lib/api/images"

interface Area {
  x: number
  y: number
  width: number
  height: number
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUser: {
    name: string
    email: string
  }
  onUploadSuccess?: (imageUrl: string) => void
  isLoading?: boolean
}

export default function ProfilePictureEditDialog({
  open,
  onOpenChange,
  currentUser: _currentUser,
  onUploadSuccess,
  isLoading = false,
}: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setError("Format gambar harus JPEG, PNG, WebP, atau GIF")
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setError(`Ukuran maksimal 2MB (file ini ${(file.size / 1024 / 1024).toFixed(1)}MB)`)
      return
    }

    setError(null)
    setSelectedFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
    // Generate preview dari cropped area
    generateCroppedPreview(croppedAreaPixels)
  }, [preview])

  const generateCroppedPreview = async (pixelCrop: Area) => {
    if (!preview) return
    try {
      const croppedBlob = await getCroppedImg(preview, pixelCrop)
      const url = URL.createObjectURL(croppedBlob)
      setCroppedPreview(url)
    } catch (err) {
      console.error("Error generating preview:", err)
    }
  }

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener("load", () => resolve(image))
      image.addEventListener("error", (err) => reject(err))
      image.setAttribute("crossOrigin", "anonymous")
      image.src = url
    })

  const getCroppedImg = async (imageSrc: string, pixelCrop: Area): Promise<Blob> => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      throw new Error("No 2d context")
    }

    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    )

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) throw new Error("Canvas is empty")
        resolve(blob)
      }, "image/jpeg", 0.9)
    })
  }

  const handleUpload = async () => {
    if (!selectedFile || !preview || !croppedAreaPixels) {
      setError("Pilih gambar terlebih dahulu")
      return
    }

    try {
      setIsUploading(true)
      setError(null)

      // Get cropped image as blob
      const croppedBlob = await getCroppedImg(preview, croppedAreaPixels)
      const croppedFile = new File([croppedBlob], `profile-${Date.now()}.jpg`, { type: "image/jpeg" })

      // Upload to backend with 'profiles' category
      const result = await uploadImage(croppedFile, 'profiles')

      // Success
      onUploadSuccess?.(result.url)
      setSelectedFile(null)
      setPreview(null)
      setCroppedPreview(null)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setCroppedAreaPixels(null)
      onOpenChange(false)

    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal upload gambar"
      setError(message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setPreview(null)
    setCroppedPreview(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClose = () => {
    handleReset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Foto Profil</DialogTitle>
          <DialogDescription>Pilih dan potong foto profil kamu</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!preview ? (
            // Upload button
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="font-medium text-gray-700">Pilih Gambar</p>
                <p className="text-xs text-gray-500 mt-1">JPEG, PNG, WebP atau GIF (Max 2MB)</p>
              </button>
            </div>
          ) : (
            // Crop preview
            <div className="space-y-4">
              <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ width: "100%", height: "350px" }}>
                {preview && (
                  <Cropper
                    image={preview}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    restrictPosition={true}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                  />
                )}
              </div>

              {/* Zoom slider */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Zoom</label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Preview */}
              {croppedPreview && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Preview Hasil Crop</label>
                  <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                    <div className="relative">
                      <img 
                        src={croppedPreview} 
                        alt="Cropped preview" 
                        className="w-32 h-32 rounded-full object-cover border-4 border-primary-600 shadow-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Change file button */}
              <Button
                variant="outline"
                onClick={() => {
                  handleReset()
                  fileInputRef.current?.click()
                }}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Pilih Gambar Lain
              </Button>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading || isLoading}>
            Batal
          </Button>
          {preview && croppedPreview && (
            <Button
              className="bg-primary-600 hover:bg-primary-700"
              onClick={handleUpload}
              disabled={isUploading || isLoading}
            >
              {isUploading || isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {isUploading || isLoading ? "Mengunggah..." : "Simpan Foto"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
