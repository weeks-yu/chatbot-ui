import { createClient } from "@/lib/supabase/middleware";
import { i18nRouter } from "next-i18n-router";
import { NextResponse, type NextRequest } from "next/server";
import i18nConfig from "./i18nConfig";

// 从环境变量中获取密码（更安全）
const CORRECT_PASSWORD = process.env.PASSWORD || 'MF-&S792!.S';

export async function middleware(request: NextRequest) {
  // 检查密码是否正确
  if (!request.headers.get('cookie')?.includes(`site_password=${CORRECT_PASSWORD}`)) {
    // 如果密码不正确，重定向到登录页面
    return NextResponse.rewrite(new URL('/login.html', request.url));
  }

  // 国际化路由处理
  const i18nResult = i18nRouter(request, i18nConfig);
  if (i18nResult) return i18nResult;

  try {
    const { supabase, response } = createClient(request);

    const session = await supabase.auth.getSession();

    const redirectToChat = session && request.nextUrl.pathname === "/";

    if (redirectToChat) {
      const { data: homeWorkspace, error } = await supabase
        .from("workspaces")
        .select("*")
        .eq("user_id", session.data.session?.user.id)
        .eq("is_home", true)
        .single();

      if (!homeWorkspace) {
        throw new Error(error?.message);
      }

      return NextResponse.redirect(
        new URL(`/${homeWorkspace.id}/chat`, request.url)
      );
    }

    return response;
  } catch (e) {
    return NextResponse.next({
      request: {
        headers: request.headers
      }
    });
  }
}

export const config = {
  matcher: "/((?!api|static|.*\\..*|_next|auth).*)"
};
