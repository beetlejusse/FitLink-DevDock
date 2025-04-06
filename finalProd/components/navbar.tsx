"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"
import ConnectWallet from "./connect-wallet"

export default function Navbar() {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMenu = () => setIsOpen(!isOpen)

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/marketplace", label: "Trainers" },
    { href: "/progress", label: "Progress" },
    { href: "/dashboard", label: "Dashboard" },
  ]

  if (!mounted) return null

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-200 ${
          scrolled ? "bg-[#e8f9ef]/90 backdrop-blur-md border-b border-green-200" : "bg-[#e8f9ef]"
        }`}
      >
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                </motion.div>
                <span className="font-bold text-xl text-[#0a7c3e]">FitLink</span>
              </Link>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-[#0a7c3e] ${
                    pathname === link.href ? "text-[#0a7c3e]" : "text-[#2d6a4f]/80"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <div className="hidden md:block">
                <Button 
                  className="bg-[#0a7c3e] hover:bg-[#0a6a34] text-white rounded-md px-4 py-2 text-sm font-medium"
                >
                  Start Your Journey
                </Button>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden text-[#0a7c3e]" 
                onClick={toggleMenu} 
                aria-label="Toggle Menu"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-green-200 bg-[#e8f9ef]"
          >
            <div className="container px-4 py-4 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block py-2 text-sm font-medium transition-colors hover:text-[#0a7c3e] ${
                    pathname === link.href ? "text-[#0a7c3e]" : "text-[#2d6a4f]/80"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
               <div className="pt-4">
                <ConnectWallet />
              </div>
            </div>
          </motion.div>
        )}
      </header>
    </>
  )
}
