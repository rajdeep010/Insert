import axios from 'axios'
import { uniqueId } from '@/helpers/unique-id'

const NEXT_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUD_NAME || ''
const NEXT_CLOUD_PRESET = process.env.NEXT_PUBLIC_CLOUD_PRESET || ''

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
      `https://api.cloudinary.com/v1_1/${NEXT_CLOUD_NAME}/image/upload`,
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
