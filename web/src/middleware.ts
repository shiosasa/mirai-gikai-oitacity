import { type NextRequest, NextResponse } from "next/server";
import {
  DIFFICULTY_COOKIE_NAME,
  type DifficultyLevelEnum,
  VALID_DIFFICULTY_LEVELS,
} from "./features/bill-difficulty/shared/types";
import { parseDifficultyLevel } from "./features/bill-difficulty/shared/utils/parse-difficulty-level";
import {
  createUnauthorizedResponse,
  getBasicAuthConfig,
  isPageSpeedInsights,
  validateBasicAuth,
} from "./lib/basic-auth";

export function middleware(request: NextRequest) {
  // /dev routes: 本番では404、開発ではauthスキップ
  if (request.nextUrl.pathname.startsWith("/dev")) {
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.redirect(new URL("/not-found", request.url));
    }
    return NextResponse.next();
  }

  const response = _handleDifficultyCookie(request);

  const authConfig = getBasicAuthConfig();

  // Basic認証の設定がない場合はスキップ
  if (!authConfig) {
    return response;
  }

  // HTML ナビゲーションだけ認証（画像やJSON, css/js, fetch等は通す）
  if (!_isHtmlRequest(request)) return response;

  // PageSpeed Insightsからのアクセスは認証をスキップ
  if (isPageSpeedInsights(request)) {
    return response;
  }

  // Basic認証の検証
  if (validateBasicAuth(request, authConfig)) {
    return response;
  }

  return createUnauthorizedResponse();
}

/**
 * 有効な難易度レベルかチェック
 */
export function isValidDifficultyLevel(
  value: string | null
): value is DifficultyLevelEnum {
  if (!value) return false;
  return VALID_DIFFICULTY_LEVELS.includes(value as DifficultyLevelEnum);
}

/**
 * 現在のページの難易度だけをServer Componentsへ渡す。
 * ブラウザに残っている旧Cookieは使わず、URL指定がなければnormal。
 */
function _handleDifficultyCookie(request: NextRequest): NextResponse {
  const { searchParams } = new URL(request.url);
  const difficulty = parseDifficultyLevel(searchParams.get("difficulty"));
  request.cookies.set(DIFFICULTY_COOKIE_NAME, difficulty);
  return NextResponse.next({ request: { headers: request.headers } });
}

export function isHtmlAcceptHeader(accept: string): boolean {
  return accept.includes("text/html");
}

function _isHtmlRequest(request: NextRequest) {
  const accept = request.headers.get("accept") || "";
  return isHtmlAcceptHeader(accept);
}
