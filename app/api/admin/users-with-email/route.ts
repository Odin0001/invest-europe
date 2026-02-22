import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: adminCheck } = await supabase.from("users").select("is_admin").eq("id", user.id).single()

    if (!adminCheck?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Fetch users from public.users table
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*")
      .eq("is_admin", false)
      .order("created_at", { ascending: false })

    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 500 })
    }

    const adminSupabase = createAdminClient()

    // Get emails from auth.users using admin API
    const usersWithEmail = await Promise.all(
      (users || []).map(async (u) => {
        const { data: authUser } = await adminSupabase.auth.admin.getUserById(u.id)
        return {
          ...u,
          email: authUser?.user?.email || "N/A",
        }
      }),
    )

    return NextResponse.json(usersWithEmail)
  } catch (error) {
    console.error("[v0] Error fetching users with email:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
