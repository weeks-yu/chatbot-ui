import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next")

  // 从请求头中获取原始的Host
  const host = request.headers.get("host")
  const protocol = request.headers.get("x-forwarded-proto") || "http"
  const origin = `${protocol}://${host}`

  if (code) {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    await supabase.auth.exchangeCodeForSession(code)
  }

  if (next) {
    return NextResponse.redirect(origin + next)
  } else {
    return NextResponse.redirect(origin)
  }
}
