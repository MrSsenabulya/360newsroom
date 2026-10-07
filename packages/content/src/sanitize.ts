import sanitizeHtml from 'sanitize-html';

/**
 * Editorial HTML sanitizer for Next.js RSC.
 * Uses sanitize-html (no jsdom) — isomorphic-dompurify breaks webpack with
 * ENOENT on `.next/browser/default-stylesheet.css`.
 */

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'h2',
  'h3',
  'h4',
  'ul',
  'ol',
  'li',
  'blockquote',
  'a',
  'img',
  'iframe',
  'figure',
  'figcaption',
  'div',
  'span',
];

const editorialOptions: sanitizeHtml.IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: {
    a: ['href', 'name', 'target', 'rel', 'title', 'class'],
    img: ['src', 'alt', 'title', 'width', 'height', 'class'],
    iframe: [
      'src',
      'width',
      'height',
      'allow',
      'allowfullscreen',
      'frameborder',
      'referrerpolicy',
      'title',
      'class',
    ],
    '*': ['class'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: {
    img: ['http', 'https'],
    iframe: ['https'],
  },
  allowedIframeHostnames: [
    'www.youtube.com',
    'youtube.com',
    'www.youtube-nocookie.com',
    'youtube-nocookie.com',
  ],
  allowIframeRelativeUrls: false,
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
  },
};

/** Sanitize editorial HTML before write and before public render. */
export function sanitizeEditorialHtml(html: string | null | undefined): string {
  if (!html?.trim()) return '';
  return sanitizeHtml(html, editorialOptions);
}

/** True when TipTap left only empty paragraphs / whitespace. */
export function isEmptyHtml(html: string | null | undefined): boolean {
  if (!html?.trim()) return true;
  return stripHtml(html).length === 0;
}

/** Plain text for cards/meta — strips all tags. */
export function stripHtml(html: string | null | undefined): string {
  if (!html?.trim()) return '';
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}
