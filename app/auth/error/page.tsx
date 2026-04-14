import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Gavel, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-secondary p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <Gavel className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-[family-name:var(--font-heading)] text-xl font-bold">Willbieten</span>
          </Link>
          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              {params?.error ? (
                <p className="mb-4 text-sm text-muted-foreground">
                  Error: {params.error}
                </p>
              ) : (
                <p className="mb-4 text-sm text-muted-foreground">
                  An unexpected error occurred during authentication.
                </p>
              )}
              <div className="flex flex-col gap-2">
                <Button className="w-full" asChild>
                  <Link href="/auth/login">Try again</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/">Go home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
