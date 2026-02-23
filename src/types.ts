// チャンネル系

export interface Channel {
  id: string;
  name: string;
  description: string | null;
  categoryId: string;
  category: Category;
  characters: Character[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChannelSummary {
  id: string;
  name: string;
  description: string | null;
  publishedAt: string | null;
}

export interface CreateChannelRequest {
  name: string;
  description?: string;
  categoryId: string;
  characters: ChannelCharacters;
}

export interface ChannelCharacters {
  connect?: { characterId: string }[];
  create?: {
    name: string;
    persona: string;
    voiceId: string;
  }[];
}

export interface UpdateChannelRequest {
  name: string;
  description?: string;
  categoryId: string;
}

// エピソード系

export interface Episode {
  id: string;
  channelId: string;
  title: string;
  description: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EpisodeSummary {
  id: string;
  title: string;
  description: string | null;
  publishedAt: string | null;
}

export interface CreateEpisodeRequest {
  title: string;
  description?: string;
}

export interface UpdateEpisodeRequest {
  title: string;
  description: string;
}

// マスタデータ系

export interface Category {
  id: string;
  slug: string;
  name: string;
}

export interface Voice {
  id: string;
  name: string;
  provider: string;
  gender: string;
}

export interface Character {
  id: string;
  name: string;
  persona: string;
  voice: Voice;
}
