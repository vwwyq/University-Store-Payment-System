"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { Edit, MessageSquare, Package, Star } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"
import { formatCurrency } from "@/utils/format-currency"

export default function ProfilePage() {
  const { user } = useAuth()

  // If no user is found, this would be handled by the middleware
  // But we'll add a fallback just in case
  if (!user) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>User Not Found</CardTitle>
            <CardDescription>Please log in to view your profile</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <Link href="/login">Log In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get user initials for avatar fallback
  const getInitials = () => {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
        <Button variant="outline" size="sm" asChild>
          <Link href="/profile/settings">
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_3fr]">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.profileImage || "/placeholder.svg"} alt="Profile picture" />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="space-y-1 text-center">
                <h3 className="text-xl font-bold">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-muted-foreground">{user.major || "No major specified"}</p>
                <div className="flex items-center justify-center">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">(4.2)</span>
                </div>
              </div>
              <div className="w-full space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email:</span>
                  <span className="text-sm font-medium">{user.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">University:</span>
                  <span className="text-sm font-medium">{user.university}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Wallet Balance:</span>
                  <span className="text-sm font-medium">{formatCurrency(user.wallet?.balance || 0)}</span>
                </div>
              </div>
              <div className="flex w-full gap-2">
                <Button className="flex-1" asChild>
                  <Link href="/profile/wallet">Wallet</Link>
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <Link href="/profile/messages">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Tabs defaultValue="listings" className="space-y-4">
            <TabsList>
              <TabsTrigger value="listings">My Listings</TabsTrigger>
              <TabsTrigger value="purchases">Purchases</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="listings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>My Active Listings</CardTitle>
                  <CardDescription>Manage your current items for sale</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Listing Item */}
                    <div className="flex items-center gap-4 rounded-lg border p-4">
                      <div className="h-16 w-16 rounded-md bg-muted">
                        <img src="/placeholder.svg" alt="Product" className="h-full w-full object-cover rounded-md" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">Calculus Textbook</h4>
                          <Badge>Books</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Listed 2 days ago</p>
                        <p className="font-medium">{formatCurrency(3500)}</p>
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

                    {/* Listing Item */}
                    <div className="flex items-center gap-4 rounded-lg border p-4">
                      <div className="h-16 w-16 rounded-md bg-muted">
                        <img src="/placeholder.svg" alt="Product" className="h-full w-full object-cover rounded-md" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">Desk Lamp</h4>
                          <Badge>Furniture</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Listed 5 days ago</p>
                        <p className="font-medium">{formatCurrency(1200)}</p>
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

                    <div className="flex justify-center">
                      <Button asChild>
                        <Link href="/sell">
                          <Package className="mr-2 h-4 w-4" />
                          List New Item
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="purchases" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>My Purchases</CardTitle>
                  <CardDescription>Items you've bought from other students</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Purchase Item */}
                    <div className="flex items-center gap-4 rounded-lg border p-4">
                      <div className="h-16 w-16 rounded-md bg-muted">
                        <img src="/placeholder.svg" alt="Product" className="h-full w-full object-cover rounded-md" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">Bluetooth Speaker</h4>
                          <Badge>Electronics</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Purchased 1 week ago</p>
                        <p className="font-medium">{formatCurrency(1800)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Contact Seller
                        </Button>
                        <Button size="sm">Leave Review</Button>
                      </div>
                    </div>

                    {/* Purchase Item */}
                    <div className="flex items-center gap-4 rounded-lg border p-4">
                      <div className="h-16 w-16 rounded-md bg-muted">
                        <img src="/placeholder.svg" alt="Product" className="h-full w-full object-cover rounded-md" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">Psychology 101 Textbook</h4>
                          <Badge>Books</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Purchased 3 weeks ago</p>
                        <p className="font-medium">{formatCurrency(2800)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Contact Seller
                        </Button>
                        <Button size="sm">Leave Review</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Reviews</CardTitle>
                  <CardDescription>What other students are saying about you</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Review Item */}
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>MR</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">Maria Rodriguez</p>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 fill-primary text-primary" />
                            <Star className="h-3 w-3 fill-primary text-primary" />
                            <Star className="h-3 w-3 fill-primary text-primary" />
                            <Star className="h-3 w-3 fill-primary text-primary" />
                            <Star className="h-3 w-3 fill-primary text-primary" />
                          </div>
                        </div>
                        <p className="ml-auto text-xs text-muted-foreground">2 weeks ago</p>
                      </div>
                      <p className="mt-2 text-sm">
                        Great seller! The textbook was in perfect condition as described. Quick to respond and easy to
                        meet up with.
                      </p>
                    </div>

                    {/* Review Item */}
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>JW</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">James Wilson</p>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 fill-primary text-primary" />
                            <Star className="h-3 w-3 fill-primary text-primary" />
                            <Star className="h-3 w-3 fill-primary text-primary" />
                            <Star className="h-3 w-3 text-muted-foreground" />
                            <Star className="h-3 w-3 text-muted-foreground" />
                          </div>
                        </div>
                        <p className="ml-auto text-xs text-muted-foreground">1 month ago</p>
                      </div>
                      <p className="mt-2 text-sm">
                        The desk lamp works well, but it had a few more scratches than I expected. Still a good deal for
                        the price.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

