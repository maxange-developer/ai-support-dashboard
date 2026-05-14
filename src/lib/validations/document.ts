const ALLOWED_EXTENSIONS = new Set(['.pdf', '.md', '.txt'])
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

export function validateUploadFile(file: unknown): { errorCode: string } | null {
  if (!(file instanceof File)) return { errorCode: 'errorMissing' }
  if (file.size === 0) return { errorCode: 'errorMissing' }
  if (file.size > MAX_SIZE) return { errorCode: 'errorTooLarge' }

  const ext = '.' + (file.name.split('.').pop()?.toLowerCase() ?? '')
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return { errorCode: 'errorUnsupported' }
  }

  return null
}
