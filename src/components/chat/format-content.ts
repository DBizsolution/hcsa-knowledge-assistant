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

/**
 * Re-introduce line breaks into a flattened cited passage so email headers,
 * bullet points and numbered items read as structure instead of one long blob.
 * Render the result with `whitespace-pre-line`.
 */
export function formatPassage(raw: string): string {
  return (
    raw
      .replace(/\s+/g, ' ')
      // Each email header field onto its own line (preserve the label's case).
      .replace(
        /\s+(From|To|Cc|Bcc|Subject|Sent|Date|Reply-To)\s*:\s*/g,
        '\n$1: ',
      )
      // Break before bullet markers.
      .replace(/\s*•\s*/g, '\n• ')
      // Break before numbered list items, but not after a label like "Tier 2.".
      .replace(
        /(?<!Tier)(?<!Phase)(?<!Stage)(?<!Level)(?<!Section)\s+(\d{1,2})\.\s+(?=[A-Z])/g,
        '\n$1. ',
      )
      .replace(/ *\n */g, '\n')
      .replace(/\n{2,}/g, '\n')
      .trim()
  )
}
