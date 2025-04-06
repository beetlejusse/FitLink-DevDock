import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import ChatAssistant from "@/components/ChatComponnet"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "FitLink",
  description:
    "A decentralized Fitness Platform to track your progress, connect with trainers, and achieve your health goals.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" enableSystem disableTransitionOnChange>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
            <ChatAssistant />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

