/*"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingBag } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate signup process
    setTimeout(() => {
      setIsLoading(false)
      // In a real app, you would create the user account
      router.push("/dashboard")
    }, 1500)
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="flex justify-center">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">Sign up to start buying and selling on campus</p>
        </div>
        <Card>
          <form onSubmit={handleSignup}>
            <CardHeader>
              <CardTitle className="text-xl">Sign Up</CardTitle>
              <CardDescription>Join the Campus Marketplace community</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">University Email</Label>
                <Input id="email" type="email" placeholder="your.email@university.edu" required />
                <p className="text-xs text-muted-foreground">Must be a valid university email address</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="university">University</Label>
                <Select required>
                  <SelectTrigger id="university">
                    <SelectValue placeholder="Select your university" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="university1">University of Example</SelectItem>
                    <SelectItem value="university2">State University</SelectItem>
                    <SelectItem value="university3">Tech Institute</SelectItem>
                    <SelectItem value="university4">Liberal Arts College</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required />
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters with a number and special character
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" required />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Log in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

*/

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase"; // Import initialized Firebase auth
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingBag } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const googleProvider = new GoogleAuthProvider();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    university: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (formData.password.length < 8 || !/\d/.test(formData.password) || !/[!@#$%^&*]/.test(formData.password)) {
      setError("Password must be at least 8 characters, include a number, and a special character.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);

      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      const token = await user.getIdToken();

      console.log("Signup url: ", process.env.NEXT_PUBLIC_SIGNUP_URL);
      await fetch(process.env.NEXT_PUBLIC_SIGNUP_URL as string, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          university: formData.university,
          token: token,
        }),
      });

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  ;

  const handleGoogleSignup = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="flex justify-center">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">Sign up to start buying and selling on campus</p>
        </div>
        <Card>
          <form onSubmit={handleSignup}>
            <CardHeader>
              <CardTitle className="text-xl">Sign Up</CardTitle>
              <CardDescription>Join the Campus Marketplace community</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" required onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" required onChange={handleChange} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">University Email</Label>
                <Input id="email" type="email" placeholder="your.email@university.edu" required onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="university">University</Label>
                <Select required onValueChange={(value) => setFormData({ ...formData, university: value })}>
                  <SelectTrigger id="university">
                    <SelectValue placeholder="Select your university" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="university1">University of Example</SelectItem>
                    <SelectItem value="university2">State University</SelectItem>
                    <SelectItem value="university3">Tech Institute</SelectItem>
                    <SelectItem value="university4">Liberal Arts College</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" required onChange={handleChange} />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
              <Button className="w-full bg-red-500 hover:bg-red-600" onClick={handleGoogleSignup}>
                Sign up with Google
              </Button>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Already have an account? <Link href="/login" className="text-primary hover:underline">Log in</Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
