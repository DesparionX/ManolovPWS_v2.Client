export function isRichTextEmpty(html: string): boolean {
  return html.replace(/<[^>]*>/g, "").trim().length === 0;
}

export function stripHtmlToText(html: string): string {
  return html
    .replace(/<(p|div|br|li|h[1-6])[^>]*>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
