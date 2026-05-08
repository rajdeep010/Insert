import axios from 'axios'
import { uniqueId } from '@/helpers/unique-id'
import { externalServices } from '@/lib/config/services'

const { cloudName: NEXT_CLOUD_NAME, uploadPreset: NEXT_CLOUD_PRESET, uploadUrl: CLOUDINARY_UPLOAD_URL } = externalServices.cloudinary

type UploadType = 'avatar' | 'blog'

interface UploadOptions {
  type: UploadType
  file: File
  username: string
  blogId?: string
  onProgress?: (progress: number) => void
}

export const uploadImage = async ({
  type,
  file,
  username,
  blogId,
  onProgress,
}: UploadOptions): Promise<{ secure_url: string; public_id: string }> => {
  try {
    const uuid = uniqueId
    const formData = new FormData()

    formData.append('file', file)
    formData.append('upload_preset', NEXT_CLOUD_PRESET)

    const folder =
      type === 'avatar' ? `avatar/${username}` : `blogs/${blogId}`

    formData.append('folder', folder)
    formData.append('public_id', uuid)

    const response = await axios.post(
      CLOUDINARY_UPLOAD_URL,
      formData,
      {
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            onProgress(percent)
          }
        },
      }
    )

    return {
      secure_url: response.data.secure_url,
      public_id: response.data.public_id,
    }
  } catch (error) {
    console.error(error)
    throw new Error('Image upload failed')
  }
}
