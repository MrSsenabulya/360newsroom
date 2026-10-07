import { sanitizeEditorialHtml } from '@campus360/content/sanitize';

type Props = {
  html: string;
  className?: string;
};

/** Public HTML body — sanitized again at the render boundary. */
export function ProseHtml({ html, className }: Props) {
  const safe = sanitizeEditorialHtml(html);
  return (
    <div
      className={`c360-prose${className ? ` ${className}` : ''}`}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
