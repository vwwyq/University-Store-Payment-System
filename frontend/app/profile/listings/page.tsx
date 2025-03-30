import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Package, Trash2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data for listings
const activeListings = [
  {
    id: "1",
    title: "Calculus Textbook",
    price: 45,
    category: "Books",
    condition: "Like New",
    image: "/placeholder.svg",
    postedDate: "2 days ago",
    views: 24,
    saves: 3,
  },
  {
    id: "2",
    title: "Desk Lamp",
    price: 15,
    category: "Furniture",
    condition: "Good",
    image: "/placeholder.svg",
    postedDate: "5 days ago",
    views: 18,
    saves: 1,
  },
]

const soldListings = [
  {
    id: "3",
    title: "Psychology 101 Textbook",
    price: 35,
    category: "Books",
    condition: "Good",
    image: "/placeholder.svg",
    soldDate: "2 weeks ago",
    buyer: "Maria Rodriguez",
  },
  {
    id: "4",
    title: "Bluetooth Speaker",
    price: 25,
    category: "Electronics",
    condition: "Like New",
    image: "/placeholder.svg",
    soldDate: "1 month ago",
    buyer: "James Wilson",
  },
]

export default function ListingsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/profile" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h2 className="text-3xl font-bold tracking-tight">My Listings</h2>
          </div>
          <p className="text-muted-foreground">Manage your active listings and view your sold items</p>
        </div>
        <Button asChild>
          <Link href="/sell">
            <Package className="mr-2 h-4 w-4" />
            List New Item
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Listings</TabsTrigger>
          <TabsTrigger value="sold">Sold Items</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeListings.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeListings.map((listing) => (
                <Card key={listing.id} className="overflow-hidden">
                  <div className="aspect-video relative">
                    <img
                      src={listing.image || "/placeholder.svg"}
                      alt={listing.title}
                      className="object-cover w-full h-full"
                    />
                    <Badge className="absolute top-2 left-2">{listing.category}</Badge>
                  </div>
                  <CardHeader className="p-4 pb-0">
                    <CardTitle className="text-xl">{listing.title}</CardTitle>
                    <CardDescription>
                      <div className="flex justify-between items-center">
                        <span>${listing.price}</span>
                        <span>{listing.condition}</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex justify-between text-sm text-muted-foreground mb-4">
                      <span>Posted {listing.postedDate}</span>
                      <span>
                        {listing.views} views • {listing.saves} saves
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/sell?edit=${listing.id}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </Button>
                      <Button variant="destructive" size="sm" className="flex-1">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <CardContent>
                <h3 className="text-lg font-medium mb-2">No active listings</h3>
                <p className="text-muted-foreground mb-4">You don't have any active listings at the moment.</p>
                <Button asChild>
                  <Link href="/sell">List an Item</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sold" className="space-y-4">
          {soldListings.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {soldListings.map((listing) => (
                <Card key={listing.id} className="overflow-hidden">
                  <div className="aspect-video relative">
                    <img
                      src={listing.image || "/placeholder.svg"}
                      alt={listing.title}
                      className="object-cover w-full h-full opacity-80"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                      <Badge variant="secondary" className="text-lg py-1 px-3">
                        SOLD
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="p-4 pb-0">
                    <CardTitle className="text-xl">{listing.title}</CardTitle>
                    <CardDescription>
                      <div className="flex justify-between items-center">
                        <span>${listing.price}</span>
                        <span>{listing.condition}</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex justify-between text-sm text-muted-foreground mb-4">
                      <span>Sold {listing.soldDate}</span>
                      <span>Buyer: {listing.buyer}</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href={`/sell?relist=${listing.id}`}>List Similar Item</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <CardContent>
                <h3 className="text-lg font-medium mb-2">No sold items</h3>
                <p className="text-muted-foreground mb-4">You haven't sold any items yet.</p>
                <Button asChild>
                  <Link href="/sell">List an Item</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4">
          <Card className="p-8 text-center">
            <CardContent>
              <h3 className="text-lg font-medium mb-2">No draft listings</h3>
              <p className="text-muted-foreground mb-4">You don't have any draft listings at the moment.</p>
              <Button asChild>
                <Link href="/sell">Create a Listing</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

