"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Check } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SellPage() {
  const router = useRouter()
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState("details")

  // Mock function to handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // In a real app, you would upload the file to a storage service
      // For this demo, we'll just create a placeholder URL
      const newImages = [...images]
      for (let i = 0; i < e.target.files.length; i++) {
        newImages.push("/placeholder.svg?height=200&width=200")
      }
      setImages(newImages)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)

      // Redirect after showing success message
      setTimeout(() => {
        router.push("/profile/listings")
      }, 2000)
    }, 1500)
  }

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto max-w-2xl">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Sell an Item</h1>
          <p className="text-muted-foreground">List your item for other students to see and purchase.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Item Details</TabsTrigger>
            <TabsTrigger value="pricing">Pricing & Delivery</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="details" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Item Information</CardTitle>
                  <CardDescription>Provide details about the item you're selling.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" placeholder="What are you selling?" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select required>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="books">Books & Textbooks</SelectItem>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="furniture">Furniture</SelectItem>
                        <SelectItem value="clothing">Clothing</SelectItem>
                        <SelectItem value="services">Services</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition</Label>
                    <Select required>
                      <SelectTrigger id="condition">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="like-new">Like New</SelectItem>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your item in detail. Include information about its features, condition, and why you're selling it."
                      rows={5}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Photos</Label>
                    <div className="grid grid-cols-3 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`Product image ${index + 1}`}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ))}
                      <label
                        htmlFor="image-upload"
                        className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-md border border-dashed bg-muted/25 hover:bg-muted/50"
                      >
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="mt-2 text-xs text-muted-foreground">Upload</span>
                        <Input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          multiple
                          className="sr-only"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      You can upload up to 5 images. The first image will be the cover.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" type="button" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={() => setActiveTab("pricing")}>
                    Next: Pricing & Delivery
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing & Delivery</CardTitle>
                  <CardDescription>Set your price and delivery options.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input id="price" type="number" placeholder="0.00" min="0" step="0.01" required />
                    <p className="text-xs text-muted-foreground">
                      Set a fair price based on the item's condition and market value.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="negotiable">Price Negotiable</Label>
                    <Select defaultValue="yes">
                      <SelectTrigger id="negotiable">
                        <SelectValue placeholder="Is the price negotiable?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes, I'm open to offers</SelectItem>
                        <SelectItem value="no">No, price is firm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment">Accepted Payment Methods</Label>
                    <Select defaultValue="all">
                      <SelectTrigger id="payment">
                        <SelectValue placeholder="Select payment methods" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Payment Methods</SelectItem>
                        <SelectItem value="wallet">Campus Marketplace Wallet Only</SelectItem>
                        <SelectItem value="cash">Cash Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Meet-up Location</Label>
                    <Input id="location" placeholder="Where on campus can you meet?" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="availability">Availability</Label>
                    <Textarea
                      id="availability"
                      placeholder="When are you available for meetups? (e.g., Weekdays after 3pm, Weekends anytime)"
                      rows={3}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" type="button" onClick={() => setActiveTab("details")}>
                    Back to Details
                  </Button>
                  <Button type="submit" disabled={isSubmitting || isSuccess}>
                    {isSubmitting ? (
                      "Submitting..."
                    ) : isSuccess ? (
                      <span className="flex items-center">
                        <Check className="mr-2 h-4 w-4" /> Listed Successfully
                      </span>
                    ) : (
                      "List Item for Sale"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </form>
        </Tabs>
      </div>
    </div>
  )
}

