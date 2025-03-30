"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDown, ArrowUp, CreditCard, Wallet } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWalletService } from "@/components/wallet/transaction-service"
import { useAuth } from "@/providers/auth-provider"
import { formatCurrency } from "@/utils/format-currency"

export default function WalletPage() {
  const { user } = useAuth()
  const { walletState, addFunds, getWalletBalance, getPendingAmount, getTotalSpent } = useWalletService()

  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleTopUp = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return

    setIsLoading(true)

    try {
      const success = await addFunds(Number(amount))
      if (success) {
        setAmount("")
        setIsDialogOpen(false)
      } else {
        // Handle error
        console.error("Failed to add funds")
      }
    } catch (error) {
      console.error("Error adding funds:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">My Wallet</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(getWalletBalance())}</div>
            <p className="text-xs text-muted-foreground">Available for purchases</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <ArrowDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(getPendingAmount())}</div>
            <p className="text-xs text-muted-foreground">Funds being processed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <ArrowUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(getTotalSpent())}</div>
            <p className="text-xs text-muted-foreground">Lifetime purchases</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="topup" className="space-y-4">
        <TabsList>
          <TabsTrigger value="topup">Top Up</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
          <TabsTrigger value="payment">Payment Methods</TabsTrigger>
        </TabsList>

        <TabsContent value="topup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Funds to Your Wallet</CardTitle>
              <CardDescription>Top up your wallet to make purchases on Campus Marketplace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="flex items-center">
                  <span className="mr-2 text-muted-foreground">₹</span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <Button variant="outline" onClick={() => setAmount("500")}>
                  ₹500
                </Button>
                <Button variant="outline" onClick={() => setAmount("1000")}>
                  ₹1000
                </Button>
                <Button variant="outline" onClick={() => setAmount("2000")}>
                  ₹2000
                </Button>
                <Button variant="outline" onClick={() => setAmount("5000")}>
                  ₹5000
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="w-full"
                    disabled={!amount || isNaN(Number(amount)) || Number(amount) <= 0 || isLoading}
                  >
                    {isLoading ? "Processing..." : "Add Funds"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add ₹{amount} to your wallet</DialogTitle>
                    <DialogDescription>Select a payment method to add funds to your wallet.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="card">Payment Method</Label>
                      <Select defaultValue="card1">
                        <SelectTrigger id="card">
                          <SelectValue placeholder="Select a payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="card1">
                            <div className="flex items-center">
                              <CreditCard className="mr-2 h-4 w-4" />
                              Visa ending in 4242
                            </div>
                          </SelectItem>
                          <SelectItem value="card2">
                            <div className="flex items-center">
                              <CreditCard className="mr-2 h-4 w-4" />
                              Mastercard ending in 5555
                            </div>
                          </SelectItem>
                          <SelectItem value="new">Add new payment method</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="flex justify-between">
                        <span className="text-sm">Amount:</span>
                        <span className="font-medium">₹{amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Fee:</span>
                        <span className="font-medium">₹0.00</span>
                      </div>
                      <div className="mt-2 flex justify-between border-t pt-2">
                        <span className="font-medium">Total:</span>
                        <span className="font-bold">₹{amount}</span>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" className="w-full sm:w-auto" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button className="w-full sm:w-auto" onClick={handleTopUp} disabled={isLoading}>
                      {isLoading ? "Processing..." : "Confirm Payment"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View your recent wallet transactions.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {walletState.transactions.length > 0 ? (
                  walletState.transactions.map((transaction) => (
                    <div key={transaction.id} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`rounded-full p-2 ${getTransactionIconBackground(transaction.type)}`}>
                            {getTransactionIcon(transaction.type)}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(transaction.timestamp)}</p>
                          </div>
                        </div>
                        <p
                          className={`font-bold ${transaction.amount > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                        >
                          {transaction.amount > 0 ? "+" : ""}
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No transactions yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your payment methods for wallet top-ups.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Visa ending in 4242</p>
                      <p className="text-xs text-muted-foreground">Expires 12/25</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm">
                      Remove
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Mastercard ending in 5555</p>
                      <p className="text-xs text-muted-foreground">Expires 09/26</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm">
                      Remove
                    </Button>
                  </div>
                </div>

                <Button className="w-full">Add New Payment Method</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper functions for transaction icons
function getTransactionIcon(type: string) {
  switch (type) {
    case "topup":
      return <ArrowDown className="h-4 w-4 text-green-600 dark:text-green-400" />
    case "purchase":
      return <ArrowUp className="h-4 w-4 text-red-600 dark:text-red-400" />
    case "sale":
      return <span className="h-4 w-4 text-green-600 dark:text-green-400">₹</span>
    case "withdrawal":
      return <ArrowUp className="h-4 w-4 text-red-600 dark:text-red-400" />
    default:
      return <ArrowDown className="h-4 w-4 text-muted-foreground" />
  }
}

function getTransactionIconBackground(type: string) {
  switch (type) {
    case "topup":
      return "bg-green-100 dark:bg-green-900"
    case "purchase":
      return "bg-red-100 dark:bg-red-900"
    case "sale":
      return "bg-green-100 dark:bg-green-900"
    case "withdrawal":
      return "bg-red-100 dark:bg-red-900"
    default:
      return "bg-muted"
  }
}

