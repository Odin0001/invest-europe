import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const type = searchParams.get("type")

  // If there's no code, redirect to login
  if (!code) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
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

    // Check the type of request (recovery, invite, signup, etc.)
    if (type === "recovery") {
      // Redirect to the reset password page where the user can enter their new password
      return NextResponse.redirect(new URL("/auth/reset-password", request.url))
    }

    // For other types (invite, signup, verification), redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url))
  } catch (error) {
    return NextResponse.redirect(
      new URL(`/auth/error?error=${encodeURIComponent("Failed to process authentication")}`, request.url)
    )
  }
}
