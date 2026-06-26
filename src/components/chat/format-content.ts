/** Strip angle-bracket tokens (<addr>, <mailto:…>) and email header lines. */
export function formatContent(raw: string, type: string) {
  let text = raw.replace(/<[^>]+>/g, ' ')
  if (type === 'email') {
    text = text.replace(
      /^\s*(from|to|cc|bcc|subject|date|sent|reply-to|importance)\s*:.*$/gim,
      ' ',
    )
  }
  return text.replace(/\s+/g, ' ').trim()
}
