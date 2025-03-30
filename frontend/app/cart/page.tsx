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
import { useWalletService } from "@/components/wallet/transaction-service"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"

// Mock cart data
const initialCartItems = [
  {
    id: "1",
    title: "Calculus Textbook",
    price: 45,
    image: "/placeholder.svg",
    seller: "Alex Johnson",
    sellerId: "user1",
    quantity: 1,
  },
  {
    id: "3",
    title: "Graphing Calculator",
    price: 50,
    image: "/placeholder.svg",
    seller: "Taylor Wilson",
    sellerId: "user3",
    quantity: 1,
  },
]

export default function CartPage() {
  const router = useRouter()
  const { walletState, processPurchase } = useWalletService()
  const [cartItems, setCartItems] = useState(initialCartItems)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("wallet")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

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

  const handleCheckout = async () => {
    setIsCheckingOut(true)

    try {
      if (paymentMethod === "wallet") {
        // Check if user has enough balance
        if (walletState.balance < total) {
          toast({
            title: "Insufficient funds",
            description: "Please top up your wallet or choose another payment method.",
            variant: "destructive",
            action: (
              <ToastAction altText="Top Up" onClick={() => router.push("/profile/wallet")}>
                Top Up
              </ToastAction>
            ),
          })
          setIsCheckingOut(false)
          return
        }

        // Process each item as a separate transaction
        for (const item of cartItems) {
          const success = await processPurchase(item.price * item.quantity, item.id, item.sellerId, item.title)

          if (!success) {
            toast({
              title: "Transaction failed",
              description: `Failed to purchase ${item.title}. Please try again.`,
              variant: "destructive",
            })
            setIsCheckingOut(false)
            return
          }
        }

        // All transactions successful
        setCartItems([])
        setIsDialogOpen(false)
        router.push("/checkout/success")
      } else {
        // Simulate other payment methods
        setTimeout(() => {
          setCartItems([])
          setIsDialogOpen(false)
          router.push("/checkout/success")
        }, 2000)
      }
    } catch (error) {
      console.error("Checkout error:", error)
      toast({
        title: "Checkout failed",
        description: "An error occurred during checkout. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCheckingOut(false)
    }
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
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                          <input
                            type="radio"
                            id="wallet"
                            name="payment"
                            className="h-4 w-4"
                            checked={paymentMethod === "wallet"}
                            onChange={() => setPaymentMethod("wallet")}
                          />
                          <label htmlFor="wallet" className="font-medium">
                            Pay with Wallet Balance
                          </label>
                        </div>
                        <div className="mt-2 pl-6">
                          <p className="text-sm text-muted-foreground">
                            Current balance: ${walletState.balance.toFixed(2)}
                          </p>
                          {total > walletState.balance && (
                            <p className="text-sm text-red-500 mt-1">
                              Insufficient funds. Please top up your wallet or choose another payment method.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="rounded-lg border p-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id="card"
                            name="payment"
                            className="h-4 w-4"
                            checked={paymentMethod === "card"}
                            onChange={() => setPaymentMethod("card")}
                          />
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
                          <input
                            type="radio"
                            id="meetup"
                            name="payment"
                            className="h-4 w-4"
                            checked={paymentMethod === "meetup"}
                            onChange={() => setPaymentMethod("meetup")}
                          />
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
                      <Button variant="outline" className="w-full sm:w-auto" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        className="w-full sm:w-auto"
                        onClick={handleCheckout}
                        disabled={isCheckingOut || (paymentMethod === "wallet" && total > walletState.balance)}
                      >
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

