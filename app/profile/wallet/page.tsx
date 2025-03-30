"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDown, ArrowUp, CreditCard, DollarSign, Wallet } from "lucide-react"

export default function WalletPage() {
  const [balance, setBalance] = useState<number>(0)
  const [amount, setAmount] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [lifetimeSpent, setLifetimeSpent] = useState<number>(0)
  const [pending, setPending] = useState<number>(0)
  const [transactions, setTransactions] = useState<any[]>([])

  useEffect(() => {
    fetchWalletData();

    const socket = new WebSocket("ws://localhost:5000");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WebSocket Update:", data);

      if (data.type === "NEW_TRANSACTION") {
        setBalance(data.newBalance);
        setTransactions((prev) => [data, ...prev]); // Add new transaction
      }
    };

    return () => socket.close();
  }, []);

  const fetchWalletData = async () => {
    try {
      console.log("Fetching wallet data...");

      const response = await fetch(process.env.NEXT_PUBLIC_BALANCE_URL as string, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        console.error("Cookies not set, redirecting to login page...");
        window.location.href = "/login";
      }

      const data = await response.json();

      console.log("Fetched Wallet Data:", data);

      setBalance(Number(data.balance) || 0);
      setLifetimeSpent(Number(data.lifetimeSpent) || 0);
      setPending(Number(data.pending) || 0);
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
    }
  };

  const handleTopUp = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_TOPUP_URL as string, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Top-up failed: ${errorText}`);
      }

      const data = await response.json();
      console.log("Top-up API Response:", data);

      if (typeof data.newBalance !== "number" || isNaN(data.newBalance)) {
        console.error("Invalid balance received from API:", data);
        throw new Error("Invalid balance received");
      }

      setBalance(data.newBalance);
      setAmount(""); // Reset input field
    } catch (error) {
      console.error("Top-up error:", error);
    }
    setIsLoading(false);
  };

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
            <div className="text-2xl font-bold">
              ₹{balance ? balance.toFixed(2) : "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">Available for purchases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <ArrowDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{pending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Funds being processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <ArrowUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{lifetimeSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Lifetime purchases</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="topup" className="space-y-4">
        <TabsList>
          <TabsTrigger value="topup">Top Up</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="topup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Funds to Your Wallet</CardTitle>
              <CardDescription>Top up your wallet to make purchases.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="flex items-center">
                  <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" disabled={!amount || isLoading} onClick={handleTopUp}>
                {isLoading ? "Processing..." : "Add Funds"}
              </Button>
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
              {transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((tx, index) => {
                    const isTopUp =
                      tx.transaction_type === "receive" ||
                      tx.transaction_type === "topup" ||
                      (tx.amount && parseFloat(tx.amount) > 0);

                    return (
                      <div key={index} className="rounded-lg border p-4 flex justify-between items-center">
                        <div>
                          <p className="font-medium">
                            {isTopUp ? "TOP-UP" : tx.transaction_type?.toUpperCase() || "PAYMENT"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(tx.created_at || tx.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <p className={`font-bold ${isTopUp ? "text-green-600" : "text-red-600"}`}>
                          {isTopUp ? `+₹${Math.abs(parseFloat(tx.amount)).toFixed(2)}` : `-₹${Math.abs(parseFloat(tx.amount)).toFixed(2)}`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center py-6 text-muted-foreground">No transactions found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
