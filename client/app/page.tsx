import { redirect } from "next/navigation"

export default function Home() {
  // Redirect to login page if not authenticated, or to dashboard if authenticated
  redirect("/login")

  return null
}
