import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
// import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ICT Trading Journal - AI-Powered Trading Analysis",
  description: "Master ICT trading with AI-powered analysis. Track trades, manage prop firm challenges, and get instant feedback on Market Structure, FVG, and Order Blocks.",
  keywords: ["ICT trading", "trading journal", "prop firm tracker", "AI trading analysis", "market structure", "fair value gap", "order blocks"],
  authors: [{ name: "ICT Trading Journal" }],
  openGraph: {
    title: "ICT Trading Journal - AI-Powered Trading Analysis",
    description: "Master ICT trading with AI-powered analysis",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ICT Trading Journal",
    description: "Master ICT trading with AI-powered analysis",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          {/* <Toaster /> */}
        </ThemeProvider>
      </body>
    </html>
  )
}