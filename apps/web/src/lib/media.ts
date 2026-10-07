export const PLACEHOLDERS = {
  story: '/placeholders/story.svg',
  portrait: '/placeholders/portrait.svg',
  watch: '/placeholders/watch.svg',
  utility: '/placeholders/utility.svg',
} as const;

export type PlaceholderKind = keyof typeof PLACEHOLDERS;

/** Prefer a real media URL; fall back to a local editorial placeholder. */
export function mediaUrl(
  url: string | null | undefined,
  kind: PlaceholderKind = 'story',
): string {
  if (url && url.trim()) return url;
  return PLACEHOLDERS[kind];
}
