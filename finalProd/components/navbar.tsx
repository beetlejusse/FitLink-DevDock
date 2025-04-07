"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Home, BookOpen, MessageCircle, LayoutDashboard } from "lucide-react"
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
    { href: "/", label: "Home", icon: <Home className="h-4 w-4" /> },
    { href: "/purchaseProgram", label: "Courses", icon: <BookOpen className="h-4 w-4" /> },
    { href: "/chatWTrainer", label: "Chat", icon: <MessageCircle className="h-4 w-4" /> },
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  ]

  if (!mounted) return null

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled ? "bg-[#e8f9ef]/90 backdrop-blur-md border-b border-green-200 shadow-sm" : "bg-[#e8f9ef]"
        }`}
      >
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2 group">
                <motion.span 
                  className="font-bold text-xl text-[#0a7c3e]"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  FitLink
                </motion.span>
              </Link>
            </div>
            
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <motion.div
                  key={link.href}
                  className="relative px-3 py-2"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Link
                    href={link.href}
                    className={`flex items-center space-x-1 text-sm font-medium transition-colors hover:text-[#0a7c3e] ${
                      pathname === link.href ? "text-[#0a7c3e]" : "text-[#2d6a4f]/80"
                    }`}
                  >
                    <span className="hidden lg:block">{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                  {pathname === link.href && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0a7c3e] rounded-full"
                      layoutId="navbar-indicator"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.div>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <div className="hidden md:block">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    className="bg-[#0a7c3e] hover:bg-[#0a6a34] text-white rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
                  >
                    <Link href={"/purchaseProgram"}>
                    Purchase Courses
                    </Link>
                  </Button>
                </motion.div>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden text-[#0a7c3e]" 
                  onClick={toggleMenu} 
                  aria-label="Toggle Menu"
                >
                  {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
        
        <AnimatePresence>
          {isOpen && isMobile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-green-200 bg-[#e8f9ef]"
            >
              <div className="container px-4 py-4 space-y-1">
                {navLinks.map((link) => (
                  <motion.div
                    key={link.href}
                    whileHover={{ x: 5, backgroundColor: "rgba(10, 124, 62, 0.05)" }}
                    className="rounded-lg overflow-hidden"
                  >
                    <Link
                      href={link.href}
                      className={`flex items-center space-x-3 py-3 px-2 text-sm font-medium transition-colors hover:text-[#0a7c3e] ${
                        pathname === link.href ? "text-[#0a7c3e] font-semibold" : "text-[#2d6a4f]/80"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {link.icon}
                      <span>{link.label}</span>
                      {pathname === link.href && (
                        <motion.div
                          className="w-1 h-full bg-[#0a7c3e] absolute left-0"
                          layoutId="sidebar-indicator"
                        />
                      )}
                    </Link>
                  </motion.div>
                ))}
                <div className="pt-4">
                  <ConnectWallet />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}
