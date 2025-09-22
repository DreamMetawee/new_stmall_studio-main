export function slugify(name?: string): string {
  if (!name) return ""
  return name.toLowerCase().trim().replace(/\//g, "|").replace(/\s+/g, "-")
}
