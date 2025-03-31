"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, ShoppingBag, Loader2, AlertCircle } from "lucide-react";

async function makePaymentRequest(paymentDetails: { amount: number; recipientId: number; orderId: string; }) {
  const { amount, recipientId, orderId } = paymentDetails;

  const apiUrl = process.env.NEXT_PUBLIC_PAYMENT_URL || "http://localhost:5000/wallet/pay";
  try {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount,
        recipientId: recipientId,
        orderId: orderId,
      }),
      credentials: "include",
    };

    console.log(`Sending payment request to ${apiUrl}:`, {
      amount,
      recipientId,
      orderId,
    });

    const response = await fetch(apiUrl, requestOptions);
    let responseData;

    try {
      responseData = await response.json();
    } catch (jsonError) {
      const textResponse = await response.text();
      console.error("Payment API returned non-JSON response:", {
        status: response.status, statusText: response.statusText, body: textResponse,
      });
      return {
        success: false,
        message: `Server returned non-JSON response (Status: ${response.status})`,
        status: response.status, rawResponse: textResponse
      };
    }

    if (!response.ok) {
      console.error(`Payment API Error: ${response.status} ${response.statusText}`, responseData);
      return {
        success: false,
        message: responseData?.message || `HTTP error ${response.status}`,
        status: response.status,
      };
    }

    if (responseData.success) {
      console.log("Payment API response:", responseData);
      return {
        success: true,
        message: responseData.message || "Payment successful",
        details: responseData.details || {},
        status: response.status,
      };
    } else {
      console.warn("Payment API call returned OK status but indicated failure:", responseData);
      return {
        success: false,
        message: responseData.message || "API indicated failure without specific message.",
        status: response.status,
      };
    }

  } catch (error) {
    console.error("Network or Fetch error during payment:", error);
    return {
      success: false,
      message: `Network request failed: Could not connect to payment service. ${(error as Error).message}`,
    };
  }
}

interface UserType {
  id: number;
  uid: string;
  balance: number | null;
}

function CheckoutConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();


  const orderId = searchParams.get("orderId") || "";
  const amount = parseFloat(searchParams.get("amount") || "0");

  const itemDescription = searchParams.get("description") ? decodeURIComponent(searchParams.get("description")!) : "Your items";

  const recipientId = 12;

  const [loading, setLoading] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const validateCheckout = async () => {
      setPageLoading(true);
      setError(null);


      if (!orderId || orderId.trim() === "") {
        setError("Missing transaction order ID.");
        setPageLoading(false);
        return;
      }
      if (isNaN(amount) || amount <= 0) {
        setError("Invalid payment amount specified.");
        setPageLoading(false);
        return;
      }

      try {
        const userRes = await fetch("http://localhost:5000/api/user", { credentials: "include" });
        if (!userRes.ok) {
          let errorBody = 'Could not read error body';
          try { errorBody = await userRes.text(); } catch (e) { }
          console.error("API User fetch failed:", { status: userRes.status, statusText: userRes.statusText, body: errorBody });
          throw new Error(`Authentication check failed: ${userRes.status}`);
        }
        const userData: UserType = await userRes.json();

        if (userData.id && typeof userData.id === 'number') {
          setUserId(userData.id);
          if (userData.id === recipientId) { setError("You cannot pay yourself."); }
        } else {
          console.warn("User ID not found or not a number in /api/user response:", userData);
          throw new Error("User not authenticated or invalid user data.");
        }
      } catch (err) {
        console.error("Failed to fetch user ID:", err);
        setError((err as Error).message || "Authentication failed. Please log in.");
      } finally {
        setPageLoading(false);
      }
    };
    validateCheckout();
  }, [orderId, amount, recipientId]);

  const handlePayment = async () => {
    if (!userId) { setError("User information is missing. Please refresh or log in again."); return; }
    if (userId === recipientId) { setError("You cannot pay yourself."); return; }

    if (amount <= 0 || !orderId) {
      setError("Invalid payment details (amount or order ID).");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const paymentDetails = {
        amount: amount,
        recipientId: recipientId,
        orderId: orderId,
      };

      const result = await makePaymentRequest(paymentDetails);

      if (result.success) {
        console.log("Payment successful:", result.message, "Details:", result.details);

        router.push("/profile/wallet");
      } else {

        throw new Error(result.message || `Payment failed (Status: ${result.status || 'unknown'})`);
      }
    } catch (err) {
      console.error("Payment processing error:", err);
      setError((err as Error).message || "An unexpected error occurred during payment.");
    } finally {
      setLoading(false);
    }
  };


  if (pageLoading) {
    return (
      <div className="flex flex-col items-center justify-center pt-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading payment details...</p>
      </div>
    );
  }

  const initialValidationError = error && (!userId || userId === recipientId || amount <= 0 || !orderId);
  if (initialValidationError && pageLoading === false) {
    return (
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[500px] pt-10">
        <Card className="text-center border-destructive">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-16 w-16 text-destructive" />
            </div>
            <CardTitle className="text-2xl text-destructive">Payment Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive-foreground">{error}</p>
            {/* Updated Login Link */}
            {(error?.includes("authenticated") || error?.includes("Authentication")) ? (
              <Button asChild variant="link" className="mt-2">
                <Link href={`/login?redirect=${encodeURIComponent(`/checkout?orderId=${orderId}&amount=${amount}&description=${encodeURIComponent(itemDescription)}`)}`}>
                  Please log in
                </Link>
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">Please check the payment details or contact support.</p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard">Go Back to Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }


  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[500px]">
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Confirm Your Payment</CardTitle>
          <CardDescription>Review the payment details before proceeding.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4 text-left">
            <div className="space-y-2">
              <div className="flex justify-between">
                {/* Display Order ID */}
                <span className="text-sm text-muted-foreground">Order ID:</span>
                <span className="font-medium break-all">{orderId}</span> {/* Added break-all for long IDs */}
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Recipient ID:</span>
                <span className="font-medium">{recipientId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Amount:</span>
                <span className="font-medium">${amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Description:</span>
                <span className="font-medium">{itemDescription}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Payment Method:</span>
                <span className="font-medium">Wallet Balance</span>
              </div>
            </div>
          </div>

          {error && !initialValidationError && (
            <p className="text-sm text-red-600 flex items-center justify-center gap-2 pt-2">
              <AlertCircle className="h-4 w-4" /> {error}
            </p>
          )}

          <div className="space-y-2 text-left pt-4">
            <h3 className="font-medium">Next Steps:</h3>
            <p className="text-sm text-muted-foreground">
              Click "Pay Now" to complete the payment using your wallet balance.
              Funds will be transferred to the recipient upon successful payment.
            </p>
            <p className="text-sm text-muted-foreground">
              After payment, you can coordinate with the recipient via messages.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button
            onClick={handlePayment}

            disabled={loading || pageLoading || !userId || userId === recipientId || amount <= 0 || !orderId || !!initialValidationError}
            className="w-full"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? "Processing..." : `Pay $${amount.toFixed(2)} Now`}
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/dashboard">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Cancel and Return to Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function CheckoutConfirmationPage() {
  return (
    <div className="container flex min-h-screen w-screen flex-col items-center justify-center py-12">
      <Suspense fallback={<InitialLoading />}>
        <CheckoutConfirmationContent />
      </Suspense>
    </div>
  );
}

function InitialLoading() {
  return (
    <div className="flex flex-col items-center justify-center pt-20">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Loading Checkout...</p>
    </div>
  );
}
