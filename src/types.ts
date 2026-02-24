// チャンネル系

export interface Channel {
  id: string;
  name: string;
  description: string | null;
  userPrompt: string;
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

export interface SetUserPromptRequest {
  userPrompt: string;
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

// 台本系

export interface GenerateScriptRequest {
  prompt: string;
  durationMinutes?: number;
  withEmotion?: boolean;
}

export interface ScriptJob {
  id: string;
  episodeId: string;
  status:
    | "pending"
    | "processing"
    | "canceling"
    | "completed"
    | "failed"
    | "canceled";
  progress: number;
  prompt: string;
  durationMinutes: number;
  withEmotion: boolean;
  episode?: {
    id: string;
    title: string;
    channel?: { id: string; name: string };
  } | null;
  scriptLinesCount?: number | null;
  errorMessage?: string | null;
  errorCode?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Speaker {
  id: string;
  name: string;
  persona: string;
  voice: Voice;
}

export interface ScriptLine {
  id: string;
  lineOrder: number;
  speaker: Speaker;
  text: string;
  emotion?: string | null;
  createdAt: string;
  updatedAt: string;
}
