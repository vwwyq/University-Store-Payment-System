import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import DashboardNav from "@/components/dashboard-nav"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  BookOpen,
  Laptop,
  Sofa,
  Shirt,
  Wrench,
  MoreHorizontal,
  User,
  ListOrdered,
  MessageSquare,
  Wallet,
  Settings,
} from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNav />
      <div className="flex-1 items-start md:grid md:grid-cols-[220px_1fr] lg:grid-cols-[240px_1fr]">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <ScrollArea className="h-full py-6 pl-8 pr-6">
            <div className="space-y-4">
              <div className="py-2">
                <h2 className="mb-2 text-lg font-semibold">Categories</h2>
                <div className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/dashboard/books">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Books & Textbooks
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/dashboard/electronics">
                      <Laptop className="mr-2 h-4 w-4" />
                      Electronics
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/dashboard/furniture">
                      <Sofa className="mr-2 h-4 w-4" />
                      Furniture
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/dashboard/clothing">
                      <Shirt className="mr-2 h-4 w-4" />
                      Clothing
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/dashboard/services">
                      <Wrench className="mr-2 h-4 w-4" />
                      Services
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/dashboard/other">
                      <MoreHorizontal className="mr-2 h-4 w-4" />
                      Other
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="py-2">
                <h2 className="mb-2 text-lg font-semibold">Account</h2>
                <div className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/profile/listings">
                      <ListOrdered className="mr-2 h-4 w-4" />
                      My Listings
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/profile/messages">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Messages
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/profile/wallet">
                      <Wallet className="mr-2 h-4 w-4" />
                      Wallet
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/profile/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </aside>
        <main className="flex w-full flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  )
}

