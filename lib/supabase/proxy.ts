import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  try {
    let supabaseResponse = NextResponse.next({
      request,
    })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
          },
        },
      },
    )

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    // If auth fails, redirect to login for protected routes
    if (error) {
      console.log("[v0] Proxy auth error:", error.message)
      if (request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/admin")) {
        const url = request.nextUrl.clone()
        url.pathname = "/auth/login"
        return NextResponse.redirect(url)
      }
      return supabaseResponse
    }

    // Protect dashboard routes
    if (request.nextUrl.pathname.startsWith("/dashboard") && !user) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      return NextResponse.redirect(url)
    }

    // Protect admin routes
    if (request.nextUrl.pathname.startsWith("/admin")) {
      if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = "/auth/login"
        return NextResponse.redirect(url)
      }

      // Check if user is admin
      const { data: userProfile } = await supabase.from("users").select("is_admin").eq("id", user.id).single()

      if (!userProfile?.is_admin) {
        const url = request.nextUrl.clone()
        url.pathname = "/dashboard"
        return NextResponse.redirect(url)
      }
    }

    // Redirect authenticated users away from auth pages
    if (
      (request.nextUrl.pathname.startsWith("/auth/login") || request.nextUrl.pathname.startsWith("/auth/sign-up")) &&
      user
    ) {
      const { data: userProfile } = await supabase.from("users").select("is_admin").eq("id", user.id).single()

      const url = request.nextUrl.clone()
      if (userProfile?.is_admin) {
        url.pathname = "/admin"
      } else {
        url.pathname = "/dashboard"
      }
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  } catch (error) {
    console.log("[v0] Proxy catch error:", error)
    if (request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/admin")) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      return NextResponse.redirect(url)
    }
    return NextResponse.next({ request })
  }
}
