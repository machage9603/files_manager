"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { FileText, FolderOpen, ImageIcon, Menu, Star, Trash, Upload, User, Settings, LogOut } from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    const token = localStorage.getItem("token")

    // Call the disconnect endpoint
    fetch("/api/auth/disconnect", {
      method: "GET",
      headers: {
        "X-Token": token || "",
      },
    }).finally(() => {
      // Remove token from localStorage
      localStorage.removeItem("token")

      // Redirect to login page
      router.push("/login")
    })
  }

  const routes = [
    {
      label: "All Files",
      icon: FileText,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "My Folders",
      icon: FolderOpen,
      href: "/dashboard/folders",
      active: pathname === "/dashboard/folders",
    },
    {
      label: "Images",
      icon: ImageIcon,
      href: "/dashboard/images",
      active: pathname === "/dashboard/images",
    },
    {
      label: "Starred",
      icon: Star,
      href: "/dashboard/starred",
      active: pathname === "/dashboard/starred",
    },
    {
      label: "Trash",
      icon: Trash,
      href: "/dashboard/trash",
      active: pathname === "/dashboard/trash",
    },
    {
      label: "Upload",
      icon: Upload,
      href: "/dashboard/upload",
      active: pathname === "/dashboard/upload",
    },
    {
      label: "Profile",
      icon: User,
      href: "/dashboard/profile",
      active: pathname === "/dashboard/profile",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
      active: pathname === "/dashboard/settings",
    },
  ]

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="outline" size="icon" className="ml-2 mt-2">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] p-0 pt-10">
          <MobileSidebar routes={routes} onLogout={handleLogout} />
        </SheetContent>
      </Sheet>
      <aside className={cn("hidden border-r bg-background md:block", className)}>
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center border-b px-4">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <FolderOpen className="h-5 w-5 text-primary" />
              <span>Files Manager</span>
            </Link>
          </div>
          <ScrollArea className="flex-1 px-2 py-4">
            <nav className="flex flex-col gap-1">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted",
                    route.active && "bg-muted",
                  )}
                >
                  <route.icon className="h-4 w-4" />
                  {route.label}
                </Link>
              ))}
            </nav>
          </ScrollArea>
          <div className="border-t p-4">
            <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}

function MobileSidebar({
  routes,
  onLogout,
}: {
  routes: { label: string; icon: any; href: string; active: boolean }[]
  onLogout: () => void
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <FolderOpen className="h-5 w-5 text-primary" />
          <span>Files Manager</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="flex flex-col gap-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted",
                route.active && "bg-muted",
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          ))}
        </nav>
      </ScrollArea>
      <div className="border-t p-4">
        <Button variant="outline" className="w-full justify-start" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
