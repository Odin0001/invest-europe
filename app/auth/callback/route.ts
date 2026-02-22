import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const type = searchParams.get("type")

  // If there's no code, it's likely just navigating to the page after email verification
  if (!code || !type) {
    return NextResponse.redirect(new URL("/auth/reset-password", request.url))
  }

  const supabase = await createClient()

  try {
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return NextResponse.redirect(
        new URL(`/auth/error?error=${encodeURIComponent(error.message)}`, request.url)
      )
    }

    // Redirect to the reset password page where the user can enter their new password
    return NextResponse.redirect(new URL("/auth/reset-password", request.url))
  } catch (error) {
    return NextResponse.redirect(
      new URL(`/auth/error?error=${encodeURIComponent("Failed to process password reset")}`, request.url)
    )
  }
}
