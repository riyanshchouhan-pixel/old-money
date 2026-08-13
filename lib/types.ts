export type Track = {
  id: string;
  title: string;
  artist: string;
  film?: string;
  year?: number;
  youtubeId: string;
};

export type Rotation = {
  slug: string;
  name: string;
  hindi?: string;
  tagline: string;
  /** Optional public YouTube playlist. When set, the queue is driven by YouTube itself. */
  youtubePlaylistId?: string;
  trackIds: string[];
};

export type QueueSource =
  | { kind: "rotation"; slug: string }
  | { kind: "all" };
