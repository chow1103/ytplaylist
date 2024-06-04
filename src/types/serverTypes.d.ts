export interface Query {
  key: string | null;
  part: string | string[];
  id?: string;
  pageToken?: string;
  maxResults?: number;
}

export interface PylistQue extends Query {
  mine?: boolean;
}

export interface PylistItsQue extends Query {
  playlistId: string;
}
