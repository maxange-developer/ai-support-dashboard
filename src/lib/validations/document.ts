const ALLOWED_EXTENSIONS = new Set(['.pdf', '.md', '.txt'])
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

export function validateUploadFile(file: unknown): { error: string } | null {
  if (!(file instanceof File)) return { error: 'File richiesto' }
  if (file.size === 0) return { error: 'File vuoto' }
  if (file.size > MAX_SIZE) return { error: 'File troppo grande (max 10 MB)' }

  const ext = '.' + (file.name.split('.').pop()?.toLowerCase() ?? '')
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return { error: 'Tipo file non supportato (accetta: .pdf, .md, .txt)' }
  }

  return null
}
