import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

/**
 * 暫定の門番（Basic 認証）。認証の本実装までのつなぎ（docs/ai-dev-guide.md §1）。
 *
 * API にはユーザー確認が無いため、これが無いと URL を知る誰でも
 * タスクを読み書き・削除できる。API ごとにチェックを書くと追加時に漏れるので、
 * 全リクエストが通る proxy で一括して塞ぐ。
 *
 * 環境変数が無いときは本番では 503 で止める（設定漏れで全公開に戻る事故を防ぐ）。
 * `next dev` だけは未設定でも素通しにして、ローカル開発の手間を増やさない。
 */

const USER = process.env.BASIC_AUTH_USER;
const PASSWORD = process.env.BASIC_AUTH_PASSWORD;

/** 長さの違いで比較時間が変わらないよう、ハッシュ同士を定数時間で比べる */
function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

function isAuthorized(header: string | null): boolean {
  if (!header?.startsWith("Basic ") || !USER || !PASSWORD) return false;
  const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
  const sep = decoded.indexOf(":");
  if (sep === -1) return false;
  // 片方が外れても両方比べる（どちらが違ったかを時間で漏らさない）
  const userOk = safeEqual(decoded.slice(0, sep), USER);
  const passOk = safeEqual(decoded.slice(sep + 1), PASSWORD);
  return userOk && passOk;
}

export function proxy(request: NextRequest) {
  if (!USER || !PASSWORD) {
    if (process.env.NODE_ENV === "development") return NextResponse.next();
    return new NextResponse("Service unavailable: auth is not configured", {
      status: 503,
    });
  }

  if (isAuthorized(request.headers.get("authorization"))) {
    return NextResponse.next();
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="daily-app", charset="UTF-8"' },
  });
}

export const config = {
  /* 静的アセット・アイコン・PWA マニフェストは除外する。
   * マニフェストはブラウザが資格情報なしで取りに行くため、
   * ここで弾くとホーム画面追加が壊れる。 */
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|icons/|manifest\\.webmanifest).*)",
  ],
};
