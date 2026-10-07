export const CAMPUS_COOKIE = 'c360_campus';
export const CAMPUS_STORAGE_KEY = 'c360_campus';

export type CampusOption = {
  slug: string;
  name: string;
  universityName: string;
};

export function parseCampusCookie(value: string | undefined): string | null {
  if (!value) return null;
  const slug = value.trim().toLowerCase();
  return slug || null;
}
