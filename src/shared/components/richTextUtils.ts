export function isRichTextEmpty(html: string): boolean {
  return html.replace(/<[^>]*>/g, "").trim().length === 0;
}
