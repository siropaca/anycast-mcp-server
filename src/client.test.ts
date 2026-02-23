import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AnycastClient } from "./client.js";
import { ApiError } from "./errors.js";

const BASE_URL = "https://api.example.com";
const API_KEY = "ak_test_key";

function mockFetchResponse(body: unknown, status = 200): void {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify(body), {
        status,
        statusText: status === 200 ? "OK" : "Error",
        headers: { "Content-Type": "application/json" },
      }),
    ),
  );
}

function mockFetchError(status: number, statusText: string, body = ""): void {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(body, { status, statusText }),
    ),
  );
}

describe("AnycastClient", () => {
  let client: AnycastClient;

  beforeEach(() => {
    client = new AnycastClient(BASE_URL, API_KEY);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("共通リクエスト処理", () => {
    it("認証ヘッダーを付与してリクエストする", async () => {
      mockFetchResponse([]);

      await client.listChannels();

      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/api/v1/me/channels`,
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            "X-API-Key": API_KEY,
          }),
        }),
      );
    });

    it("GET リクエストに Content-Type を付与しない", async () => {
      mockFetchResponse([]);

      await client.listChannels();

      const call = vi.mocked(fetch).mock.calls[0];
      const headers = call[1]?.headers as Record<string, string>;
      expect(headers["Content-Type"]).toBeUndefined();
    });

    it("ベース URL の末尾スラッシュを除去する", async () => {
      const clientWithSlash = new AnycastClient(`${BASE_URL}/`, API_KEY);
      mockFetchResponse([]);

      await clientWithSlash.listChannels();

      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/api/v1/me/channels`,
        expect.anything(),
      );
    });

    it("HTTP エラー時に ApiError をスローする", async () => {
      mockFetchError(404, "Not Found", "resource not found");

      await expect(client.getChannel("invalid-id")).rejects.toThrow(ApiError);
    });

    it("POST リクエストでボディを送信する", async () => {
      const channelData = {
        name: "Test Channel",
        categoryId: "cat-1",
        characters: { create: [{ name: "Host", persona: "明るい", voiceId: "v-1" }] },
      };
      mockFetchResponse({ id: "ch-1", ...channelData });

      await client.createChannel(channelData);

      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/api/v1/channels`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(channelData),
        }),
      );
    });
  });

  describe("チャンネル系", () => {
    it("listChannels: 一覧を取得する", async () => {
      const channels = [{ id: "ch-1", name: "Channel 1" }];
      mockFetchResponse(channels);

      const result = await client.listChannels();

      expect(result).toEqual(channels);
    });

    it("getChannel: 詳細を取得する", async () => {
      const channel = { id: "ch-1", name: "Channel 1" };
      mockFetchResponse(channel);

      const result = await client.getChannel("ch-1");

      expect(result).toEqual(channel);
      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/api/v1/me/channels/ch-1`,
        expect.anything(),
      );
    });

    it("updateChannel: チャンネルを更新する", async () => {
      const updated = { id: "ch-1", name: "Updated" };
      mockFetchResponse(updated);

      const result = await client.updateChannel("ch-1", {
        name: "Updated",
        categoryId: "cat-1",
      });

      expect(result).toEqual(updated);
      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/api/v1/channels/ch-1`,
        expect.objectContaining({ method: "PATCH" }),
      );
    });

    it("publishChannel: チャンネルを公開する", async () => {
      const published = { id: "ch-1", publishedAt: "2024-01-01" };
      mockFetchResponse(published);

      const result = await client.publishChannel("ch-1");

      expect(result).toEqual(published);
      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/api/v1/channels/ch-1/publish`,
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  describe("エピソード系", () => {
    it("listEpisodes: 一覧を取得する", async () => {
      const episodes = [{ id: "ep-1", title: "Episode 1" }];
      mockFetchResponse(episodes);

      const result = await client.listEpisodes("ch-1");

      expect(result).toEqual(episodes);
      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/api/v1/me/channels/ch-1/episodes`,
        expect.anything(),
      );
    });

    it("getEpisode: 詳細を取得する", async () => {
      const episode = { id: "ep-1", title: "Episode 1" };
      mockFetchResponse(episode);

      const result = await client.getEpisode("ch-1", "ep-1");

      expect(result).toEqual(episode);
      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/api/v1/me/channels/ch-1/episodes/ep-1`,
        expect.anything(),
      );
    });

    it("createEpisode: エピソードを作成する", async () => {
      const episode = { id: "ep-1", title: "New Episode" };
      mockFetchResponse(episode);

      const result = await client.createEpisode("ch-1", {
        title: "New Episode",
      });

      expect(result).toEqual(episode);
      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/api/v1/channels/ch-1/episodes`,
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("updateEpisode: エピソードを更新する", async () => {
      const episode = { id: "ep-1", title: "Updated" };
      mockFetchResponse(episode);

      const result = await client.updateEpisode("ch-1", "ep-1", {
        title: "Updated",
        description: "desc",
      });

      expect(result).toEqual(episode);
      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/api/v1/channels/ch-1/episodes/ep-1`,
        expect.objectContaining({ method: "PATCH" }),
      );
    });

    it("publishEpisode: エピソードを公開する", async () => {
      const episode = { id: "ep-1", publishedAt: "2024-01-01" };
      mockFetchResponse(episode);

      const result = await client.publishEpisode("ch-1", "ep-1");

      expect(result).toEqual(episode);
      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/api/v1/channels/ch-1/episodes/ep-1/publish`,
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  describe("台本系", () => {
    it("generateScript: 台本生成ジョブを開始する", async () => {
      const job = { id: "job-1", status: "pending" };
      mockFetchResponse({ data: job });

      const result = await client.generateScript("ch-1", "ep-1", {
        prompt: "AIの未来",
        durationMinutes: 15,
        withEmotion: true,
      });

      expect(result).toEqual(job);
      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/api/v1/channels/ch-1/episodes/ep-1/script/generate-async`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            prompt: "AIの未来",
            durationMinutes: 15,
            withEmotion: true,
          }),
        }),
      );
    });

    it("getScriptJob: ジョブの状態を取得する", async () => {
      const job = { id: "job-1", status: "completed", progress: 100 };
      mockFetchResponse({ data: job });

      const result = await client.getScriptJob("job-1");

      expect(result).toEqual(job);
      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/api/v1/script-jobs/job-1`,
        expect.anything(),
      );
    });

    it("listScriptLines: 台本行一覧を取得する", async () => {
      const lines = [{ id: "line-1", lineOrder: 1, text: "こんにちは" }];
      mockFetchResponse({ data: lines });

      const result = await client.listScriptLines("ch-1", "ep-1");

      expect(result).toEqual(lines);
      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/api/v1/channels/ch-1/episodes/ep-1/script/lines`,
        expect.anything(),
      );
    });
  });

  describe("マスタデータ系", () => {
    it("listCategories: カテゴリ一覧を取得する", async () => {
      const categories = [{ id: "cat-1", slug: "tech", name: "テクノロジー" }];
      mockFetchResponse(categories);

      const result = await client.listCategories();

      expect(result).toEqual(categories);
      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/api/v1/categories`,
        expect.anything(),
      );
    });

    it("listVoices: ボイス一覧を取得する", async () => {
      const voices = [{ id: "v-1", name: "Voice 1", provider: "google", gender: "female" }];
      mockFetchResponse(voices);

      const result = await client.listVoices();

      expect(result).toEqual(voices);
      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/api/v1/voices`,
        expect.anything(),
      );
    });

    it("listCharacters: キャラクター一覧を取得する", async () => {
      const characters = [{ id: "char-1", name: "Host" }];
      mockFetchResponse(characters);

      const result = await client.listCharacters();

      expect(result).toEqual(characters);
      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/api/v1/me/characters`,
        expect.anything(),
      );
    });
  });
});
