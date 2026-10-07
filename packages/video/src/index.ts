/**
 * VideoAdapter — V1 starter uses unlisted YouTube URLs.
 * Swap implementation later without changing callers.
 */

export type VideoPlayback = {
  provider: 'youtube' | 'unknown';
  videoId: string | null;
  watchUrl: string | null;
  embedUrl: string | null;
  /** Privacy-friendly embed host */
  embedSrc: string | null;
};

export type VideoAdapter = {
  parse(input: string | null | undefined): VideoPlayback;
  isReady(input: string | null | undefined): boolean;
};

const YT_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{6,})/,
  /^([A-Za-z0-9_-]{11})$/,
];

export function extractYouTubeId(input: string): string | null {
  const trimmed = input.trim();
  for (const pattern of YT_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

export function createYouTubeVideoAdapter(): VideoAdapter {
  return {
    parse(input) {
      if (!input) {
        return {
          provider: 'unknown',
          videoId: null,
          watchUrl: null,
          embedUrl: null,
          embedSrc: null,
        };
      }

      const videoId = extractYouTubeId(input);
      if (!videoId) {
        return {
          provider: 'unknown',
          videoId: null,
          watchUrl: input,
          embedUrl: null,
          embedSrc: null,
        };
      }

      return {
        provider: 'youtube',
        videoId,
        watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        embedSrc: `https://www.youtube-nocookie.com/embed/${videoId}`,
      };
    },
    isReady(input) {
      return Boolean(input && extractYouTubeId(input));
    },
  };
}

/** Default app-wide adapter until a dedicated streaming provider is chosen. */
export const videoAdapter = createYouTubeVideoAdapter();
