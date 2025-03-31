import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Laptop, Sofa, Shirt, Wrench, MoreHorizontal } from "lucide-react"

const categories = [
  {
    id: "books",
    name: "Books & Textbooks",
    description: "Textbooks, course materials, and leisure reading",
    icon: BookOpen,
    count: 245,
  },
  {
    id: "electronics",
    name: "Electronics",
    description: "Laptops, phones, calculators, and other devices",
    icon: Laptop,
    count: 187,
  },
  {
    id: "furniture",
    name: "Furniture",
    description: "Desks, chairs, lamps, and dorm essentials",
    icon: Sofa,
    count: 124,
  },
  {
    id: "clothing",
    name: "Clothing",
    description: "University apparel, casual wear, and accessories",
    icon: Shirt,
    count: 98,
  },
  {
    id: "services",
    name: "Services",
    description: "Tutoring, repairs, and other student services",
    icon: Wrench,
    count: 56,
  },
  {
    id: "other",
    name: "Other",
    description: "Miscellaneous items and unique offerings",
    icon: MoreHorizontal,
    count: 73,
  },
]

export default function CategoryList() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <Link key={category.id} href={`/dashboard/${category.id}`}>
          <Card className="h-full transition-colors hover:border-primary">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">{category.name}</CardTitle>
              <category.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-3">{category.description}</CardDescription>
              <p className="text-sm text-muted-foreground">{category.count} listings</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

