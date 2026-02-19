export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-|-$/g, "");
}

export function propertySlug(title: string, locality: string, suffix?: string): string {
  const base = `${slugify(title)}-${slugify(locality)}`;
  return suffix ? `${base}-${suffix}` : base;
}
