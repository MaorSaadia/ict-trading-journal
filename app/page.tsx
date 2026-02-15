import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header with theme toggle */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">ICT Trading Journal</h2>
          <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-24">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold">ICT Trading Journal</h1>
          <p className="text-xl text-muted-foreground">
            AI-powered trading journal with ICT concepts
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button>Login</Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline">Sign Up</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}