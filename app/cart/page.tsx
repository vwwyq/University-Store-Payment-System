"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Minus, Plus, ShoppingCart, Trash2, Loader2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from 'uuid';

const initialCartItems = [
  {
    id: "prod_1",
    title: "Calculus Textbook",
    price: 45,
    image: "/placeholder.svg",
    seller: "Alex Johnson",
    sellerId: 12,
    quantity: 1,
  },
  {
    id: "prod_2",
    title: "Graphing Calculator",
    price: 50,
    image: "/placeholder.svg",
    seller: "Taylor Wilson",
    sellerId: 15,
    quantity: 1,
  },
];

async function fetchUserData() {
  try {
    const userRes = await fetch("http://localhost:5000/api/user", { credentials: "include" });
    if (!userRes.ok) {
      let errorBody = 'Could not read error body';
      try { errorBody = await userRes.text(); } catch (e) { }
      console.error("API User fetch failed:", { status: userRes.status, statusText: userRes.statusText, body: errorBody });
      throw new Error(`Failed to fetch user data: ${userRes.status}`);
    }
    const userData = await userRes.json();
    const balance = parseFloat(userData.balance);
    if (isNaN(balance)) {
      console.warn("User balance received is not a number:", userData.balance);
      return { ...userData, balance: null };
    }
    return { ...userData, balance: balance };

  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [checkoutError, setCheckoutError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      setLoadingUser(true);
      const user = await fetchUserData();
      setCurrentUser(user);
      setLoadingUser(false);
    };
    loadUser();
  }, []);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)));
  };

  const removeItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const serviceFee = 2.5;
  const total = subtotal + serviceFee;

  const handleProceedToCheckout = () => {
    setIsProcessingCheckout(true);
    setCheckoutError(null);

    if (paymentMethod !== "wallet") {
      setCheckoutError("Only wallet payment is currently supported.");
      setIsProcessingCheckout(false);
      return;
    }

    if (!currentUser || currentUser.balance === null || currentUser.balance < total) {
      setCheckoutError("Insufficient wallet balance to complete this purchase.");
      setIsProcessingCheckout(false);
      return;
    }

    const orderId = `ORD-${uuidv4()}`;
    const description = cartItems.length > 0
      ? `Purchase of ${cartItems.length} item(s): ${cartItems.map(i => i.title).slice(0, 2).join(', ')}...`
      : "Cart Purchase";
    const encodedDescription = encodeURIComponent(description);

    const checkoutUrl = `/checkout/success?orderId=${orderId}&amount=${total.toFixed(2)}&description=${encodedDescription}`;

    console.log("Navigating to checkout:", checkoutUrl);
    router.push(checkoutUrl);
  };


  const canCheckoutWithWallet = currentUser && currentUser.balance !== null && currentUser.balance >= total;

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
                <Dialog onOpenChange={() => setCheckoutError(null)}>
                  <DialogTrigger asChild>
                    <Button className="w-full" disabled={cartItems.length === 0}>Proceed to Checkout</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Complete Your Purchase</DialogTitle>
                      <DialogDescription>Choose how you'd like to pay for your items.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className={`rounded-lg border p-4 ${paymentMethod === 'wallet' ? 'border-primary ring-1 ring-primary' : ''}`}>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id="wallet"
                            name="payment"
                            value="wallet"
                            className="h-4 w-4"
                            checked={paymentMethod === 'wallet'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                          />
                          <label htmlFor="wallet" className="font-medium flex-1 cursor-pointer">
                            Pay with Wallet Balance
                          </label>
                        </div>
                        <div className="mt-2 pl-6">
                          {loadingUser ? (
                            <p className="text-sm text-muted-foreground">Loading balance...</p>
                          ) : currentUser && currentUser.balance !== null ? (
                            <>
                              <p className="text-sm text-muted-foreground">Current balance: ${currentUser.balance.toFixed(2)}</p>
                              {!canCheckoutWithWallet && paymentMethod === 'wallet' && (
                                <p className="text-sm text-red-500 mt-1">
                                  Insufficient funds. Required: ${total.toFixed(2)}.
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-sm text-red-500 mt-1">Could not load balance.</p>
                          )}
                        </div>
                      </div>

                      <div className={`rounded-lg border p-4 ${paymentMethod === 'card' ? 'border-primary ring-1 ring-primary' : 'opacity-50'}`}>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id="card"
                            name="payment"
                            value="card"
                            className="h-4 w-4"
                            checked={paymentMethod === 'card'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            disabled
                          />
                          <label htmlFor="card" className={`font-medium flex-1 ${paymentMethod !== 'card' ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                            Pay with Credit/Debit Card (Coming Soon)
                          </label>
                        </div>
                        <div className="mt-2 pl-6">
                          <p className="text-sm text-muted-foreground">
                            Your saved cards will be available for selection.
                          </p>
                        </div>
                      </div>

                      <div className={`rounded-lg border p-4 ${paymentMethod === 'meetup' ? 'border-primary ring-1 ring-primary' : 'opacity-50'}`}>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id="meetup"
                            name="payment"
                            value="meetup"
                            className="h-4 w-4"
                            checked={paymentMethod === 'meetup'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            disabled
                          />
                          <label htmlFor="meetup" className={`font-medium flex-1 ${paymentMethod !== 'meetup' ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                            Pay at Meetup (Coming Soon)
                          </label>
                        </div>
                        <div className="mt-2 pl-6">
                          <p className="text-sm text-muted-foreground">
                            Pay with cash when you meet the seller on campus.
                          </p>
                        </div>
                      </div>

                      {checkoutError && (
                        <p className="text-sm text-red-600 flex items-center justify-center gap-2 pt-2">
                          <AlertCircle className="h-4 w-4" /> {checkoutError}
                        </p>
                      )}
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline" className="w-full sm:w-auto">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button
                        className="w-full sm:w-auto"
                        onClick={handleProceedToCheckout}
                        disabled={
                          isProcessingCheckout ||
                          loadingUser ||
                          (paymentMethod === 'wallet' && !canCheckoutWithWallet) ||
                          paymentMethod !== 'wallet'
                        }
                      >
                        {isProcessingCheckout ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isProcessingCheckout ? "Processing..." : "Complete Purchase"}
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
  );
}
