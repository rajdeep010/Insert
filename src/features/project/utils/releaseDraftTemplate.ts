export const DEFAULT_RELEASE_DRAFT_TEMPLATE = [
  '## Summary',
  '- What changed in this release?',
  '',
  '## Highlights',
  '- Feature: ',
  '- Improvement: ',
  '- Fix: ',
  '',
  '## Breaking Changes',
  '- None',
  '',
  '## Migration Notes',
  '- N/A',
].join('\n')

const normalizeTemplate = (value: string) => value.replace(/\r\n/g, '\n').trim()

const toParagraphNode = (line: string) => ({
  type: 'paragraph',
  attrs: { textAlign: null },
  content: [{ type: 'text', text: line }],
})

export const toReleaseDraftTemplate = (template?: string | null) => {
  const normalized = normalizeTemplate(String(template || ''))
  return normalized.length ? normalized : DEFAULT_RELEASE_DRAFT_TEMPLATE
}

export const buildReleaseDraftContent = (title: string, template?: string | null) => {
  const compiledTemplate = toReleaseDraftTemplate(template)
    .replaceAll('{title}', title)
    .replaceAll('{{title}}', title)

  const lines = compiledTemplate.split('\n')

  return {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { textAlign: null, level: 1 },
        content: [{ type: 'text', text: title }],
      },
      ...lines.map((line) => toParagraphNode(line)),
    ],
  }
}
