import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get("code");
  const nextParam = requestUrl.searchParams.get("next");

  const next =
    nextParam &&
    nextParam.startsWith("/") &&
    !nextParam.startsWith("//")
      ? nextParam
      : "/";

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=oauth_failed", requestUrl.origin)
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(
      new URL("/login?error=supabase_not_configured", requestUrl.origin)
    );
  }

  const response = NextResponse.redirect(
    new URL(next, requestUrl.origin)
  );

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          const cookieHeader = request.headers.get("cookie");

          if (!cookieHeader) {
            return [];
          }

          return cookieHeader.split(";").map((cookie) => {
            const [name, ...valueParts] = cookie.trim().split("=");

            return {
              name,
              value: valueParts.join("="),
            };
          });
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("OAuth callback error:", error);

    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(error.message)}`,
        requestUrl.origin
      )
    );
  }

  return response;
}