/** API エラーを表すクラス */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: string,
  ) {
    super(`${status} ${statusText}`);
    this.name = "ApiError";
  }
}

/**
 * Response オブジェクトから ApiError を生成する
 *
 * @param response - fetch の Response オブジェクト
 * @returns ApiError インスタンス
 */
export async function createApiError(response: Response): Promise<ApiError> {
  const body = await response.text().catch(() => "");
  return new ApiError(response.status, response.statusText, body);
}

/**
 * エラーをエージェント向けのメッセージに整形する
 *
 * @param error - エラーオブジェクト
 * @returns エージェントに返すエラーメッセージ
 */
export function formatErrorForAgent(error: unknown): string {
  if (error instanceof ApiError) {
    const lines = [`Error: ${error.status} ${error.statusText}`];

    if (error.body) {
      lines.push(error.body);
    }

    // ステータスコード別の補足メッセージ
    const hint = getStatusHint(error.status);
    if (hint) {
      lines.push(`Hint: ${hint}`);
    }

    return lines.join("\n");
  }

  if (error instanceof Error) {
    return `Error: ${error.message}`;
  }

  return "Error: 予期しないエラーが発生しました";
}

/**
 * ステータスコードに応じた補足メッセージを返す
 *
 * @param status - HTTP ステータスコード
 * @returns 補足メッセージ（該当なしの場合 null）
 */
function getStatusHint(status: number): string | null {
  switch (status) {
    case 401:
      return "API キー（ANYCAST_API_KEY）が正しく設定されているか確認してください";
    case 403:
      return "このリソースへのアクセス権がありません";
    case 404:
      return "指定されたリソースが見つかりません。ID が正しいか確認してください";
    case 409:
      return "リソースの競合が発生しました。既に同じリソースが存在する可能性があります";
    case 500:
      return "サーバー側で問題が発生しています。しばらく待ってからもう一度お試しください";
    default:
      return null;
  }
}
