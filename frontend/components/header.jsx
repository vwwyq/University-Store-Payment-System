"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Search, ShoppingBag, User } from "lucide-react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { usePathname } from "next/navigation"

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const pathname = usePathname()

  // Only show login/signup buttons on the home page
  const isHomePage = pathname === "/"

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
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
                <Link href="/" className="hover:text-foreground/80">
                  Home
                </Link>
                {isHomePage ? (
                  <>
                    <Link href="/login" className="hover:text-foreground/80">
                      Login
                    </Link>
                    <Link href="/signup" className="hover:text-foreground/80">
                      Sign Up
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/dashboard" className="hover:text-foreground/80">
                      Dashboard
                    </Link>
                    <Link href="/dashboard/books" className="hover:text-foreground/80">
                      Browse
                    </Link>
                    <Link href="/sell" className="hover:text-foreground/80">
                      Sell
                    </Link>
                    <Link href="/profile/messages" className="hover:text-foreground/80">
                      Messages
                    </Link>
                    <Link href="/profile" className="hover:text-foreground/80">
                      Account
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
            <ShoppingBag className="h-5 w-5" />
            <span className="hidden md:inline-block">Campus Marketplace</span>
          </Link>
          {!isHomePage && (
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link href="/dashboard" className="font-medium transition-colors hover:text-foreground/80">
                Dashboard
              </Link>
              <Link href="/dashboard/books" className="font-medium transition-colors hover:text-foreground/80">
                Browse
              </Link>
              <Link href="/sell" className="font-medium transition-colors hover:text-foreground/80">
                Sell
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isSearchOpen ? (
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full bg-background pl-8 pr-4"
                autoFocus
                onBlur={() => setIsSearchOpen(false)}
              />
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}

          {isHomePage ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="icon" asChild>
              <Link href="/profile">
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
              </Link>
            </Button>
          )}

          <ModeToggle />

          {!isHomePage && (
            <Button asChild className="hidden md:flex">
              <Link href="/sell">Sell an Item</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

