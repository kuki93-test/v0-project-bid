import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import {
  Laptop,
  Shirt,
  Gem,
  Palette,
  Armchair,
  Car,
  BookOpen,
  Dumbbell,
  Music,
  Baby,
  Wrench,
  MoreHorizontal,
} from "lucide-react"

const iconMap: Record<string, React.ReactNode> = {
  electronics: <Laptop className="h-6 w-6" />,
  fashion: <Shirt className="h-6 w-6" />,
  collectibles: <Gem className="h-6 w-6" />,
  art: <Palette className="h-6 w-6" />,
  "home-garden": <Armchair className="h-6 w-6" />,
  automotive: <Car className="h-6 w-6" />,
  "books-media": <BookOpen className="h-6 w-6" />,
  "sports-outdoors": <Dumbbell className="h-6 w-6" />,
  "music-instruments": <Music className="h-6 w-6" />,
  "baby-kids": <Baby className="h-6 w-6" />,
  "tools-equipment": <Wrench className="h-6 w-6" />,
  other: <MoreHorizontal className="h-6 w-6" />,
}

export async function CategoryGrid() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name")

  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-foreground">
            Browse by Category
          </h2>
          <p className="mt-2 text-muted-foreground">
            Find exactly what you are looking for
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categories?.map((category) => (
            <Link
              key={category.id}
              href={`/listings?category=${category.slug}`}
              className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                {iconMap[category.slug] || <MoreHorizontal className="h-6 w-6" />}
              </div>
              <span className="text-center text-sm font-medium text-foreground">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
