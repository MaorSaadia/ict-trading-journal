'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Menu, Home, BookOpen, BarChart3, Target } from 'lucide-react'

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/journal', label: 'Journal', icon: BookOpen },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/prop-firms', label: 'Prop Firms', icon: Target },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-2 mt-6">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className="w-full justify-start gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}