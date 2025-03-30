import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, ArrowLeft } from "lucide-react"

// Mock product data - in a real app, you would fetch this from an API
const product = {
  id: "1",
  title: "Calculus Textbook",
  price: 3500,
  description:
    "Calculus: Early Transcendentals, 8th Edition. In excellent condition with minimal highlighting. Perfect for MATH 101 and 102 courses.",
  category: "Books",
  condition: "Like New",
  image: "/placeholder.svg?height=500&width=500",
  seller: {
    id: "user1",
    name: "Alex Johnson",
    rating: 4.8,
    joinedDate: "September 2023",
  },
  location: "University Library",
  postedDate: "2 days ago",
}

export default function ProductPage({ params }) {
  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <Link href="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to listings
      </Link>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
        <div className="rounded-lg overflow-hidden border bg-background">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.title}
            width={500}
            height={500}
            className="w-full object-cover"
          />
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <Badge>{product.category}</Badge>
              <span className="text-sm text-muted-foreground">Posted {product.postedDate}</span>
            </div>
            <h1 className="mt-2 text-3xl font-bold">{product.title}</h1>
            <p className="mt-2 text-2xl font-bold">₹{product.price}</p>
            <div className="mt-2 flex items-center">
              <span className="mr-2 text-sm font-medium">Condition:</span>
              <span className="text-sm text-muted-foreground">{product.condition}</span>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Description</h2>
            <p className="mt-2 text-muted-foreground">{product.description}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Meet-up Location</h2>
            <p className="mt-2 text-muted-foreground">{product.location}</p>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-semibold text-primary">{product.seller.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-semibold">{product.seller.name}</p>
                  <p className="text-sm text-muted-foreground">Member since {product.seller.joinedDate}</p>
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <Button className="flex-1" asChild>
                  <Link href={`/cart?add=${product.id}`}>Buy Now</Link>
                </Button>
                <Button variant="outline" className="flex items-center" asChild>
                  <Link href={`/profile/messages?seller=${product.seller.id}`}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Message
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

