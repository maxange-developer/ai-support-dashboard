import { extractText } from 'unpdf'

export type SourceType = 'pdf' | 'markdown' | 'manual'

export interface ParsedDoc {
  title: string
  content: string
  sourceType: SourceType
}

export async function parseFile(
  buffer: ArrayBuffer,
  filename: string,
): Promise<ParsedDoc> {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  const title = filename.replace(/\.[^.]+$/, '')

  if (ext === 'pdf') {
    const result = await extractText(new Uint8Array(buffer), { mergePages: true })
    const text = Array.isArray(result.text) ? result.text.join('\n') : result.text
    return { title, content: text, sourceType: 'pdf' }
  }

  const content = new TextDecoder().decode(buffer)
  const sourceType: SourceType = ext === 'md' ? 'markdown' : 'manual'
  return { title, content, sourceType }
}
