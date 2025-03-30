import { Input } from "@/components/ui/input"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { BookOpen, Laptop, Sofa, Shirt, Wrench, MoreHorizontal, Filter } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

// Mock data for products
const allProducts = [
  {
    id: "1",
    title: "Calculus Textbook",
    price: 45,
    category: "books",
    condition: "Like New",
    image: "/placeholder.svg?height=300&width=300",
    seller: "Alex Johnson",
    postedDate: "2 days ago",
  },
  {
    id: "2",
    title: "Desk Lamp",
    price: 15,
    category: "furniture",
    condition: "Good",
    image: "/placeholder.svg?height=300&width=300",
    seller: "Jamie Smith",
    postedDate: "5 days ago",
  },
  {
    id: "3",
    title: "Graphing Calculator",
    price: 50,
    category: "electronics",
    condition: "Excellent",
    image: "/placeholder.svg?height=300&width=300",
    seller: "Taylor Wilson",
    postedDate: "1 week ago",
  },
  {
    id: "4",
    title: "Mini Fridge",
    price: 75,
    category: "appliances",
    condition: "Good",
    image: "/placeholder.svg?height=300&width=300",
    seller: "Morgan Lee",
    postedDate: "3 days ago",
  },
  {
    id: "5",
    title: "Psychology 101 Textbook",
    price: 35,
    category: "books",
    condition: "Good",
    image: "/placeholder.svg?height=300&width=300",
    seller: "Casey Brown",
    postedDate: "1 day ago",
  },
  {
    id: "6",
    title: "Bluetooth Speaker",
    price: 25,
    category: "electronics",
    condition: "Like New",
    image: "/placeholder.svg?height=300&width=300",
    seller: "Riley Green",
    postedDate: "4 days ago",
  },
  {
    id: "7",
    title: "University Hoodie",
    price: 20,
    category: "clothing",
    condition: "Excellent",
    image: "/placeholder.svg?height=300&width=300",
    seller: "Jordan Taylor",
    postedDate: "1 week ago",
  },
  {
    id: "8",
    title: "Computer Science Notes",
    price: 15,
    category: "books",
    condition: "Good",
    image: "/placeholder.svg?height=300&width=300",
    seller: "Alex Johnson",
    postedDate: "3 days ago",
  },
  {
    id: "9",
    title: "Dorm Chair",
    price: 30,
    category: "furniture",
    condition: "Fair",
    image: "/placeholder.svg?height=300&width=300",
    seller: "Jamie Smith",
    postedDate: "6 days ago",
  },
  {
    id: "10",
    title: "Laptop Stand",
    price: 18,
    category: "electronics",
    condition: "Excellent",
    image: "/placeholder.svg?height=300&width=300",
    seller: "Taylor Wilson",
    postedDate: "2 days ago",
  },
  {
    id: "11",
    title: "Math Tutoring Services",
    price: 25,
    category: "services",
    condition: "N/A",
    image: "/placeholder.svg?height=300&width=300",
    seller: "Morgan Lee",
    postedDate: "1 day ago",
    description: "1 hour of tutoring for Calculus I, II, or III",
  },
  {
    id: "12",
    title: "Winter Jacket",
    price: 40,
    category: "clothing",
    condition: "Like New",
    image: "/placeholder.svg?height=300&width=300",
    seller: "Casey Brown",
    postedDate: "5 days ago",
  },
]

// Category metadata
const categories = {
  books: {
    name: "Books & Textbooks",
    icon: BookOpen,
    description: "Textbooks, course materials, and leisure reading",
  },
  electronics: {
    name: "Electronics",
    icon: Laptop,
    description: "Laptops, phones, calculators, and other devices",
  },
  furniture: {
    name: "Furniture",
    icon: Sofa,
    description: "Desks, chairs, lamps, and dorm essentials",
  },
  clothing: {
    name: "Clothing",
    icon: Shirt,
    description: "University apparel, casual wear, and accessories",
  },
  services: {
    name: "Services",
    icon: Wrench,
    description: "Tutoring, repairs, and other student services",
  },
  other: {
    name: "Other",
    icon: MoreHorizontal,
    description: "Miscellaneous items and unique offerings",
  },
}

// Condition options for filtering
const conditions = ["New", "Like New", "Excellent", "Good", "Fair", "Poor"]

export default function CategoryPage({ params }: { params: { category: string } }) {
  const { category } = params

  // Check if category exists
  if (!Object.keys(categories).includes(category)) {
    notFound()
  }

  // Get category metadata
  const categoryInfo = categories[category as keyof typeof categories]

  // Filter products by category
  const filteredProducts = allProducts.filter((product) => product.category === category)

  // Get the icon component
  const CategoryIcon = categoryInfo.icon

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CategoryIcon className="h-6 w-6" />
          <h2 className="text-3xl font-bold tracking-tight">{categoryInfo.name}</h2>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/sell">Sell in this Category</Link>
        </Button>
      </div>

      <p className="text-muted-foreground">{categoryInfo.description}</p>

      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-medium">Price Range</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label htmlFor="min-price" className="text-sm text-muted-foreground">
                    Min
                  </label>
                  <Input id="min-price" type="number" placeholder="$0" />
                </div>
                <div className="space-y-1">
                  <label htmlFor="max-price" className="text-sm text-muted-foreground">
                    Max
                  </label>
                  <Input id="max-price" type="number" placeholder="$100" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Condition</h3>
              <div className="space-y-2">
                {conditions.map((condition) => (
                  <div key={condition} className="flex items-center space-x-2">
                    <Checkbox id={`condition-${condition.toLowerCase()}`} />
                    <label
                      htmlFor={`condition-${condition.toLowerCase()}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {condition}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Posted Within</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="posted-today" />
                  <label
                    htmlFor="posted-today"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Today
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="posted-week" />
                  <label
                    htmlFor="posted-week"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Last 7 days
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="posted-month" />
                  <label
                    htmlFor="posted-month"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Last 30 days
                  </label>
                </div>
              </div>
            </div>

            <Button className="w-full">Apply Filters</Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">{filteredProducts.length} items found</p>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">Sort by:</p>
              <select className="text-sm border rounded p-1">
                <option>Newest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
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
                      <Badge className="mb-2">{categories[product.category as keyof typeof categories].name}</Badge>
                      <h3 className="font-semibold truncate">{product.title}</h3>
                      <div className="flex items-center justify-between mt-1">
                        <p className="font-bold">${product.price}</p>
                        <p className="text-sm text-muted-foreground">{product.condition}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm text-muted-foreground">Seller: {product.seller}</p>
                        <p className="text-xs text-muted-foreground">{product.postedDate}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <CardContent>
                <h3 className="text-lg font-medium mb-2">No items found</h3>
                <p className="text-muted-foreground mb-4">There are no items in this category yet.</p>
                <Button asChild>
                  <Link href="/sell">Sell an Item</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

