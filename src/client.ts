import type {
  Category,
  Channel,
  ChannelSummary,
  Character,
  CreateChannelRequest,
  CreateEpisodeRequest,
  Episode,
  EpisodeSummary,
  UpdateChannelRequest,
  UpdateEpisodeRequest,
  Voice,
} from "./types.js";
import { createApiError } from "./errors.js";

/** anycast-backend の HTTP クライアント */
export class AnycastClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    // 末尾スラッシュを除去
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.apiKey = apiKey;
  }

  /**
   * 共通の HTTP リクエストメソッド
   *
   * @param method - HTTP メソッド
   * @param path - API パス（先頭スラッシュ付き）
   * @param body - リクエストボディ（省略可）
   * @returns パース済みレスポンス
   *
   * @throws ApiError - HTTP エラーレスポンスの場合
   */
  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const headers: Record<string, string> = {
      "X-API-Key": this.apiKey,
    };
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

    if (!response.ok) {
      throw await createApiError(response);
    }

    return response.json() as Promise<T>;
  }

  // --- チャンネル系 ---

  /**
   * 自分のチャンネル一覧を取得する
   *
   * @returns チャンネル一覧
   */
  async listChannels(): Promise<ChannelSummary[]> {
    return this.request("GET", "/api/v1/me/channels");
  }

  /**
   * チャンネルの詳細を取得する
   *
   * @param channelId - チャンネル ID
   * @returns チャンネル詳細
   */
  async getChannel(channelId: string): Promise<Channel> {
    return this.request("GET", `/api/v1/me/channels/${channelId}`);
  }

  /**
   * 新しいチャンネルを作成する
   *
   * @param data - チャンネル作成データ
   * @returns 作成されたチャンネル
   */
  async createChannel(data: CreateChannelRequest): Promise<Channel> {
    return this.request("POST", "/api/v1/channels", data);
  }

  /**
   * チャンネルを更新する
   *
   * @param channelId - チャンネル ID
   * @param data - チャンネル更新データ
   * @returns 更新されたチャンネル
   */
  async updateChannel(
    channelId: string,
    data: UpdateChannelRequest,
  ): Promise<Channel> {
    return this.request("PATCH", `/api/v1/channels/${channelId}`, data);
  }

  /**
   * チャンネルを公開する
   *
   * @param channelId - チャンネル ID
   * @returns 公開されたチャンネル
   */
  async publishChannel(channelId: string): Promise<Channel> {
    return this.request("POST", `/api/v1/channels/${channelId}/publish`);
  }

  // --- エピソード系 ---

  /**
   * エピソード一覧を取得する
   *
   * @param channelId - チャンネル ID
   * @returns エピソード一覧
   */
  async listEpisodes(channelId: string): Promise<EpisodeSummary[]> {
    return this.request(
      "GET",
      `/api/v1/me/channels/${channelId}/episodes`,
    );
  }

  /**
   * エピソードの詳細を取得する
   *
   * @param channelId - チャンネル ID
   * @param episodeId - エピソード ID
   * @returns エピソード詳細
   */
  async getEpisode(channelId: string, episodeId: string): Promise<Episode> {
    return this.request(
      "GET",
      `/api/v1/me/channels/${channelId}/episodes/${episodeId}`,
    );
  }

  /**
   * 新しいエピソードを作成する
   *
   * @param channelId - チャンネル ID
   * @param data - エピソード作成データ
   * @returns 作成されたエピソード
   */
  async createEpisode(
    channelId: string,
    data: CreateEpisodeRequest,
  ): Promise<Episode> {
    return this.request(
      "POST",
      `/api/v1/channels/${channelId}/episodes`,
      data,
    );
  }

  /**
   * エピソードを更新する
   *
   * @param channelId - チャンネル ID
   * @param episodeId - エピソード ID
   * @param data - エピソード更新データ
   * @returns 更新されたエピソード
   */
  async updateEpisode(
    channelId: string,
    episodeId: string,
    data: UpdateEpisodeRequest,
  ): Promise<Episode> {
    return this.request(
      "PATCH",
      `/api/v1/channels/${channelId}/episodes/${episodeId}`,
      data,
    );
  }

  /**
   * エピソードを公開する
   *
   * @param channelId - チャンネル ID
   * @param episodeId - エピソード ID
   * @returns 公開されたエピソード
   */
  async publishEpisode(
    channelId: string,
    episodeId: string,
  ): Promise<Episode> {
    return this.request(
      "POST",
      `/api/v1/channels/${channelId}/episodes/${episodeId}/publish`,
    );
  }

  // --- マスタデータ系 ---

  /**
   * カテゴリ一覧を取得する
   *
   * @returns カテゴリ一覧
   */
  async listCategories(): Promise<Category[]> {
    return this.request("GET", "/api/v1/categories");
  }

  /**
   * ボイス一覧を取得する
   *
   * @returns ボイス一覧
   */
  async listVoices(): Promise<Voice[]> {
    return this.request("GET", "/api/v1/voices");
  }

  /**
   * 自分のキャラクター一覧を取得する
   *
   * @returns キャラクター一覧
   */
  async listCharacters(): Promise<Character[]> {
    return this.request("GET", "/api/v1/me/characters");
  }
}
