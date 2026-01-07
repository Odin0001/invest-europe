import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { ProfileClient } from "@/components/dashboard/profile-client"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader userName={profile?.full_name || user.email || undefined} />

      <div className="flex md:flex-row flex-col flex-1">
        <DashboardNav />
        <main className="flex-1 p-6 md:p-8 bg-slate-50">
          <ProfileClient profile={profile} user={user} />
        </main>
      </div>
    </div>
  )
}
