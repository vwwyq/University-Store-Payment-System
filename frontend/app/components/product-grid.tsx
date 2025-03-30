import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

// Mock data for products
const products = [
  {
    id: "1",
    title: "Calculus Textbook",
    price: 45,
    category: "Books",
    condition: "Like New",
    image: "/placeholder.svg?height=300&width=300",
    seller: "Alex Johnson",
  },
  {
    id: "2",
    title: "Desk Lamp",
    price: 15,
    category: "Furniture",
    condition: "Good",
    image: "/placeholder.svg?height=300&width=300",
    seller: "Jamie Smith",
  },
  {
    id: "3",
    title: "Graphing Calculator",
    price: 50,
    category: "Electronics",
    condition: "Excellent",
    image: "/placeholder.svg?height=300&width=300",
    seller: "Taylor Wilson",
  },
  {
    id: "4",
    title: "Mini Fridge",
    price: 75,
    category: "Appliances",
    condition: "Good",
    image: "/placeholder.svg?height=300&width=300",
    seller: "Morgan Lee",
  },
  {
    id: "5",
    title: "Psychology 101 Textbook",
    price: 35,
    category: "Books",
    condition: "Good",
    image: "/placeholder.svg?height=300&width=300",
    seller: "Casey Brown",
  },
  {
    id: "6",
    title: "Bluetooth Speaker",
    price: 25,
    category: "Electronics",
    condition: "Like New",
    image: "/placeholder.svg?height=300&width=300",
    seller: "Riley Green",
  },
]

export default function ProductGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
      {products.map((product) => (
        <Link key={product.id} href={`/products/${product.id}`}>
          <div className="group relative overflow-hidden rounded-lg border bg-background transition-colors hover:border-primary">
            <div className="aspect-square overflow-hidden">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.title}
                width={300}
                height={300}
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <Badge className="mb-2">{product.category}</Badge>
              <h3 className="font-semibold truncate">{product.title}</h3>
              <div className="flex items-center justify-between mt-1">
                <p className="font-bold">${product.price}</p>
                <p className="text-sm text-muted-foreground">{product.condition}</p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Seller: {product.seller}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

