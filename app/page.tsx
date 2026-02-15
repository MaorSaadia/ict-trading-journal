import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">ICT Trading Journal</h1>
        <p className="text-xl text-gray-600">
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
    </div>
  )
}