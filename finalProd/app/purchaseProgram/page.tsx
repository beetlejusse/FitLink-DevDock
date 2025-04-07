"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ethers } from "ethers"
import { Dumbbell, Clock, Target, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { contractABI } from "@/lib/contract-abi"
import { contractAddress } from "@/lib/utils"
import { useRouter } from "next/navigation"

const address = contractAddress

interface Listing {
  id: number
  seller: string
  title: string
  description: string
  imageUrl: string         // Changed from deployedProjectUrl
  courseLinkUrl?: string   // Changed from githubRepoLink
  price: string
  isActive: boolean
}

export default function PurchaseProgramPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    try {
      setLoading(true)
      setError(null)

      const { ethereum } = window as any
      let provider

      if (ethereum) {
        provider = new ethers.BrowserProvider(ethereum)
      } else {
        // Fallback to read-only provider
        provider = new ethers.JsonRpcProvider("https://ethereum-goerli.publicnode.com")
      }

      const contract = new ethers.Contract(address, contractABI, provider)
      const listingIds = await contract.getAllListingIds()

      const listingPromises = listingIds.map(async (id: bigint) => {
        const listing = await contract.getListingDetails(id)
        return {
          id: Number(listing[0]),
          seller: listing[1],
          title: listing[2],
          description: listing[3],
          imageUrl: listing[4],        // Changed from deployedProjectUrl
          price: ethers.formatEther(listing[5]),
          isActive: listing[6],
        }
      })

      const fetchedListings = await Promise.all(listingPromises)
      setListings(fetchedListings.filter(listing => listing.isActive))
      setLoading(false)
    } catch (error) {
      console.error("Error fetching listings:", error)
      setError("Failed to load programs. Please try again.")
      setLoading(false)
    }
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8f9ef] to-white py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-[#0a7c3e]">Fitness Programs</h1>
            <p className="text-[#2d6a4f] text-lg">Discover expert-crafted fitness programs to reach your goals</p>
          </div>
          <Button 
            variant="outline" 
            onClick={fetchListings} 
            disabled={loading}
            className="border-[#0a7c3e] text-[#0a7c3e] hover:bg-[#e8f9ef] rounded-full"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-8 bg-red-50 border-red-200 text-red-800 rounded-xl">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="font-semibold">Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden rounded-xl shadow-sm bg-black border-none">
                <div className="p-2">
                  <Skeleton className="w-full h-40 bg-gray-800 rounded-lg" />
                </div>
                <CardHeader className="pb-2 bg-black pt-3 px-5">
                  <Skeleton className="h-6 w-3/4 mb-2 bg-gray-800" />
                  <Skeleton className="h-4 w-1/4 bg-gray-800" />
                </CardHeader>
                <CardContent className="py-2 bg-black px-5">
                  <Skeleton className="h-4 w-full mb-2 bg-gray-800" />
                </CardContent>
                <CardFooter className="bg-black pt-2 pb-4 px-5">
                  <Skeleton className="h-10 w-full bg-gray-800" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {listings.map((listing) => (
              <motion.div key={listing.id} variants={fadeIn}>
                <Card className="overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-shadow border-none bg-black">
                  {/* Display program image with padding */}
                  <div className="p-2">
                    {listing.imageUrl ? (
                      <div className="w-full h-40 overflow-hidden rounded-lg">
                        <img 
                          src={listing.imageUrl} 
                          alt={listing.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-40 bg-gradient-to-r from-gray-800 to-gray-900 flex items-center justify-center rounded-lg">
                        <Dumbbell className="h-14 w-14 text-white/80" />
                      </div>
                    )}
                  </div>
                  
                  <CardHeader className="pb-1 bg-black pt-3 px-5">
                    <CardTitle className="text-xl text-white font-bold line-clamp-1">{listing.title}</CardTitle>
                    <div className="flex items-center flex-wrap gap-2 text-gray-300 mt-2">
                      <Badge className="bg-[#0a7c3e] text-white">{listing.price} ETH</Badge>
                      <div className="flex items-center text-sm">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        <span>4 weeks</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Target className="h-3.5 w-3.5 mr-1" />
                        <span>All levels</span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="py-3 bg-black px-5">
                    <p className="text-gray-300 text-base line-clamp-2">{listing.description}</p>
                  </CardContent>
                  
                  <CardFooter className="bg-black pt-2 pb-4 px-5">
                    <Button 
                      className="w-full bg-[#0a7c3e] hover:bg-[#086a34] text-white rounded-full py-2 h-10 text-base"
                      onClick={() => router.push(`/purchaseProgram/${listing.id}`)}
                    >
                      View Program
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16 bg-black rounded-xl shadow-sm text-white">
            <div className="inline-flex rounded-full bg-gray-800 p-6 mb-4">
              <Dumbbell className="h-8 w-8 text-[#0a7c3e]" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">No Programs Found</h3>
            <p className="text-gray-300 mb-6">Check back later or refresh to see new programs</p>
            <Button 
              onClick={fetchListings}
              className="bg-[#0a7c3e] hover:bg-[#086a34] text-white rounded-full px-6"
            >
              Refresh Programs
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
