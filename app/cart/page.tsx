"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

// Mock cart data
const initialCartItems = [
  {
    id: "1",
    title: "Calculus Textbook",
    price: 45,
    image: "/placeholder.svg",
    seller: "Alex Johnson",
    quantity: 1,
  },
  {
    id: "3",
    title: "Graphing Calculator",
    price: 50,
    image: "/placeholder.svg",
    seller: "Taylor Wilson",
    quantity: 1,
  },
]

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState(initialCartItems)
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return

    setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
  }

  const removeItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const serviceFee = 2.5
  const total = subtotal + serviceFee

  const handleCheckout = () => {
    setIsCheckingOut(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsCheckingOut(false)
      // Clear cart and redirect to success page
      setCartItems([])
      router.push("/checkout/success")
    }, 2000)
  }

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <Link href="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Continue Shopping
      </Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          <span className="font-medium">{cartItems.length} items</span>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Your cart is empty</h2>
              <p className="text-muted-foreground">Looks like you haven't added any items to your cart yet.</p>
              <Button asChild>
                <Link href="/dashboard">Browse Items</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Cart Items</CardTitle>
                <CardDescription>Review your items before checkout</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 rounded-lg border p-4">
                    <div className="h-20 w-20 rounded-md bg-muted">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        className="h-full w-full object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">Seller: {item.seller}</p>
                      <p className="font-medium">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center rounded-md border">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-r-none"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                          <span className="sr-only">Decrease quantity</span>
                        </Button>
                        <div className="flex h-8 w-8 items-center justify-center text-sm">{item.quantity}</div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-l-none"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                          <span className="sr-only">Increase quantity</span>
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-muted-foreground"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Review your order details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Fee</span>
                  <span>${serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-4 font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full">Proceed to Checkout</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Complete Your Purchase</DialogTitle>
                      <DialogDescription>Choose how you'd like to pay for your items.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="rounded-lg border p-4">
                        <div className="flex items-center gap-2">
                          <input type="radio" id="wallet" name="payment" className="h-4 w-4" defaultChecked />
                          <label htmlFor="wallet" className="font-medium">
                            Pay with Wallet Balance
                          </label>
                        </div>
                        <div className="mt-2 pl-6">
                          <p className="text-sm text-muted-foreground">Current balance: $75.50</p>
                          {total > 75.5 && (
                            <p className="text-sm text-red-500 mt-1">
                              Insufficient funds. Please top up your wallet or choose another payment method.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="rounded-lg border p-4">
                        <div className="flex items-center gap-2">
                          <input type="radio" id="card" name="payment" className="h-4 w-4" />
                          <label htmlFor="card" className="font-medium">
                            Pay with Credit/Debit Card
                          </label>
                        </div>
                        <div className="mt-2 pl-6">
                          <p className="text-sm text-muted-foreground">
                            Your saved cards will be available for selection.
                          </p>
                        </div>
                      </div>

                      <div className="rounded-lg border p-4">
                        <div className="flex items-center gap-2">
                          <input type="radio" id="meetup" name="payment" className="h-4 w-4" />
                          <label htmlFor="meetup" className="font-medium">
                            Pay at Meetup
                          </label>
                        </div>
                        <div className="mt-2 pl-6">
                          <p className="text-sm text-muted-foreground">
                            Pay with cash when you meet the seller on campus.
                          </p>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" className="w-full sm:w-auto">
                        Cancel
                      </Button>
                      <Button className="w-full sm:w-auto" onClick={handleCheckout} disabled={isCheckingOut}>
                        {isCheckingOut ? "Processing..." : "Complete Purchase"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

