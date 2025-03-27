import Link from "next/link"
import { ShoppingBag } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container flex flex-col gap-6 py-8 md:flex-row md:items-start md:justify-between md:py-12">
        <div className="flex flex-col gap-2">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
            <ShoppingBag className="h-5 w-5" />
            <span>Campus Marketplace</span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-xs">
            A marketplace for university students to buy and sell items within their campus community.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-12 sm:grid-cols-3 md:grid-cols-4">
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Marketplace</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-muted-foreground transition-colors hover:text-foreground">
                  Browse
                </Link>
              </li>
              <li>
                <Link href="/sell" className="text-muted-foreground transition-colors hover:text-foreground">
                  Sell
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-muted-foreground transition-colors hover:text-foreground">
                  Categories
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Account</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/account" className="text-muted-foreground transition-colors hover:text-foreground">
                  Profile
                </Link>
              </li>
              <li>
                <Link href="/messages" className="text-muted-foreground transition-colors hover:text-foreground">
                  Messages
                </Link>
              </li>
              <li>
                <Link
                  href="/account/listings"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  My Listings
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Help</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq" className="text-muted-foreground transition-colors hover:text-foreground">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground transition-colors hover:text-foreground">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/safety" className="text-muted-foreground transition-colors hover:text-foreground">
                  Safety Tips
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Campus Marketplace. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/cookies" className="hover:text-foreground">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

