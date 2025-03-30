"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Menu, MessageSquare, Search, ShoppingBag, ShoppingCart } from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ModeToggle } from "@/components/mode-toggle"
import { useAuth } from "@/providers/auth-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function DashboardNav() {
  const pathname = usePathname()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { user, logout } = useAuth()

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!user) return "U"
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center gap-2 md:gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="grid gap-6 text-lg font-medium">
                <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
                  <ShoppingBag className="h-5 w-5" />
                  <span>Campus Marketplace</span>
                </Link>
                <Link href="/dashboard" className="hover:text-foreground/80">
                  Dashboard
                </Link>
                <Link href="/dashboard/books" className="hover:text-foreground/80">
                  Books & Textbooks
                </Link>
                <Link href="/dashboard/electronics" className="hover:text-foreground/80">
                  Electronics
                </Link>
                <Link href="/dashboard/furniture" className="hover:text-foreground/80">
                  Furniture
                </Link>
                <Link href="/dashboard/clothing" className="hover:text-foreground/80">
                  Clothing
                </Link>
                <Link href="/dashboard/services" className="hover:text-foreground/80">
                  Services
                </Link>
                <Link href="/profile" className="hover:text-foreground/80">
                  My Profile
                </Link>
                <Link href="/profile/listings" className="hover:text-foreground/80">
                  My Listings
                </Link>
                <Link href="/profile/messages" className="hover:text-foreground/80">
                  Messages
                </Link>
                <Link href="/profile/wallet" className="hover:text-foreground/80">
                  Wallet
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold">
            <ShoppingBag className="h-5 w-5" />
            <span className="hidden md:inline-block">Campus Marketplace</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-end md:justify-center px-4">
          {isSearchOpen ? (
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for items..."
                className="w-full bg-background pl-8 pr-4"
                autoFocus
                onBlur={() => setIsSearchOpen(false)}
              />
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)} className="md:hidden">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}

          <div className="relative hidden md:flex w-full max-w-sm items-center">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search for items..." className="w-full bg-background pl-8 pr-4" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                2
              </Badge>
              <span className="sr-only">Shopping cart</span>
            </Button>
          </Link>

          <Button variant="ghost" size="icon" asChild>
            <Link href="/profile/messages">
              <MessageSquare className="h-5 w-5" />
              <span className="sr-only">Messages</span>
            </Link>
          </Button>

          <Button variant="ghost" size="icon" asChild>
            <Link href="/notifications">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Link>
          </Button>

          <ModeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profileImage || "/placeholder.svg"} alt={user?.firstName || "User"} />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user ? `${user.firstName} ${user.lastName}` : "My Account"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile/listings">My Listings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile/wallet">Wallet</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Log Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button asChild className="hidden md:flex">
            <Link href="/sell">Sell an Item</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

