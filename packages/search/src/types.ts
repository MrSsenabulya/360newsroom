export type SearchEntityType =
  | 'Article'
  | 'BreakingUpdate'
  | 'University'
  | 'Campus'
  | 'Programme'
  | 'Episode'
  | 'Opportunity'
  | 'Event'
  | 'Vendor';

export type SearchDocument = {
  id: string;
  type: SearchEntityType;
  title: string;
  url: string;
  summary?: string | null;
  campusSlug?: string | null;
  universitySlug?: string | null;
  publishedAt?: string | null;
  keywords?: string[];
};

export type SearchInput = {
  query: string;
  contentTypes?: SearchEntityType[];
  campusSlug?: string;
  limit?: number;
  offset?: number;
};

export type SearchHit = SearchDocument & {
  score?: number;
};

export type SearchResponse = {
  query: string;
  total: number;
  hits: SearchHit[];
  grouped: Partial<Record<SearchEntityType, SearchHit[]>>;
  provider: string;
  degraded?: boolean;
};

export type SearchHealth = {
  ok: boolean;
  provider: string;
  detail?: string;
};

export type SearchAdapter = {
  search(input: SearchInput): Promise<SearchResponse>;
  index(document: SearchDocument): Promise<void>;
  remove(type: SearchEntityType, id: string): Promise<void>;
  health(): Promise<SearchHealth>;
};
