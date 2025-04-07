"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ethers } from "ethers"
import { Edit, ExternalLink, ShoppingBag, AlertCircle, Dumbbell, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { contractABI } from "@/lib/contract-abi"

const CONTRACT_ADDRESS = "0x0E5DB44DD0468f2e9262E46FC7B293081081f357"

interface Listing {
  id: number
  seller: string
  title: string
  description: string
  imageUrl: string
  courseLinkUrl?: string
  price: string
  isActive: boolean
  hasAccess?: boolean
}

export default function DashboardPage() {
  const [account, setAccount] = useState<string | null>(null)
  const [myListings, setMyListings] = useState<Listing[]>([])
  const [purchasedListings, setPurchasedListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)

  useEffect(() => {
    const initializeProvider = async () => {
      try {
        const { ethereum } = window as any
        if (!ethereum) {
          setError("Please install MetaMask to view your dashboard")
          setLoading(false)
          return
        }

        const accounts = await ethereum.request({ method: "eth_accounts" })
        if (accounts.length === 0) {
          setError("Please connect your wallet to view your dashboard")
          setLoading(false)
          return
        }

        setAccount(accounts[0])
        const provider = new ethers.BrowserProvider(ethereum)
        const signer = await provider.getSigner()
        const OpenCode = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer)
        setContract(OpenCode)
        fetchListings(OpenCode, accounts[0])
      } catch (error) {
        console.error("Error initializing provider:", error)
        setLoading(false)
      }
    }

    initializeProvider()
  }, [])

  const fetchListings = async (contractInstance: ethers.Contract, userAddress: string) => {
    try {
      const listingIds = await contractInstance.getAllListingIds()
      const listingPromises = listingIds.map(async (id: bigint) => {
        const listing = await contractInstance.getListingDetails(id)
        const hasAccess = await contractInstance.hasAccess(id, userAddress)
        let courseLinkUrl: string | undefined
        if (hasAccess) {
          courseLinkUrl = await contractInstance.getCourseLinkUrl(id)
        }

        return {
          id: Number(listing[0]),
          seller: listing[1],
          title: listing[2],
          description: listing[3],
          imageUrl: listing[4],
          courseLinkUrl,
          price: ethers.formatEther(listing[5]),
          isActive: listing[6],
          hasAccess,
        }
      })

      const fetchedListings = await Promise.all(listingPromises)
      setMyListings(fetchedListings.filter((listing) => listing.seller.toLowerCase() === userAddress.toLowerCase()))
      setPurchasedListings(fetchedListings.filter(
        (listing) => listing.seller.toLowerCase() !== userAddress.toLowerCase() && listing.hasAccess,
      ))
      setLoading(false)
    } catch (error) {
      console.error("Error fetching listings:", error)
      setLoading(false)
    }
  }

  const toggleListingStatus = async (listingId: number, currentStatus: boolean) => {
    if (!contract) return
    try {
      const tx = await contract.updateListing(listingId, !currentStatus, 0)
      await tx.wait()
      setMyListings((prev) =>
        prev.map((listing) => (listing.id === listingId ? { ...listing, isActive: !currentStatus } : listing)),
      )
    } catch (error) {
      console.error("Error toggling listing status:", error)
    }
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#e8f9ef] to-white py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <Skeleton className="h-10 w-1/3 mb-8 bg-[#0a7c3e]/20" />
          <Skeleton className="h-12 w-64 mb-6 bg-[#0a7c3e]/20" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="overflow-hidden border-none rounded-xl shadow-sm bg-black">
                <div className="p-2">
                  <Skeleton className="h-40 w-full bg-gray-800 rounded-lg" />
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
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#e8f9ef] to-white py-12 px-4">
        <div className="container mx-auto max-w-md text-center">
          <Alert variant="destructive" className="mb-6 border-red-300 bg-red-50 rounded-xl">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="text-lg">Error</AlertTitle>
            <AlertDescription className="text-base">{error}</AlertDescription>
          </Alert>
          <Button asChild className="bg-[#0a7c3e] hover:bg-[#086a34] text-white rounded-full px-8 py-6 text-base font-medium">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8f9ef] to-white py-12 px-4">
      <motion.div initial="hidden" animate="visible" variants={fadeIn} className="container mx-auto max-w-5xl">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-[#0a7c3e]">My Fitness Dashboard</h1>
          <p className="text-[#2d6a4f]">Track your fitness programs and manage your trainer content.</p>
        </div>

        <Tabs defaultValue="my-listings" className="mb-8">
          <TabsList className="bg-[#e8f9ef] p-1 rounded-full border border-[#0a7c3e]/20 mb-6">
            <TabsTrigger value="my-listings" className="rounded-full data-[state=active]:bg-[#0a7c3e] data-[state=active]:text-white px-6 py-2">
              <Dumbbell className="h-4 w-4 mr-2" />My Programs
            </TabsTrigger>
            <TabsTrigger value="purchased" className="rounded-full data-[state=active]:bg-[#0a7c3e] data-[state=active]:text-white px-6 py-2">
              <Activity className="h-4 w-4 mr-2" />Purchased Plans
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-listings">
            {myListings.length > 0 ? (
              <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myListings.map((listing) => (
                  <motion.div key={listing.id} variants={fadeIn} transition={{ duration: 0.5 }}>
                    <Card className="overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-shadow border-none bg-black">
                      <div className="p-2">
                        {listing.imageUrl ? (
                          <div className="w-full h-40 overflow-hidden rounded-lg">
                            <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-full h-40 bg-gradient-to-r from-gray-800 to-gray-900 flex items-center justify-center rounded-lg">
                            <Dumbbell className="h-14 w-14 text-white/80" />
                          </div>
                        )}
                      </div>
                      <CardHeader className="pb-1 bg-black pt-3 px-5">
                        <CardTitle className="text-xl text-white font-bold line-clamp-1">{listing.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={listing.isActive ? "bg-[#0a7c3e] text-white" : "bg-gray-600 text-white"}>
                            {listing.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <span className="text-gray-300">{listing.price} ETH</span>
                        </div>
                      </CardHeader>
                      <CardContent className="py-3 bg-black px-5">
                        <p className="text-gray-300 text-base line-clamp-2">{listing.description}</p>
                        {listing.courseLinkUrl && (
                          <Button asChild variant="outline" size="sm" className="mt-3 gap-1 border-[#0a7c3e] text-[#0a7c3e] hover:bg-[#0a7c3e]/10 rounded-full">
                            <a href={listing.courseLinkUrl.startsWith('http') ? listing.courseLinkUrl : `https://${listing.courseLinkUrl}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-1" />Program Materials
                            </a>
                          </Button>
                        )}
                      </CardContent>
                      <CardFooter className="bg-black pt-2 pb-4 px-5 flex justify-between">
                        <Button variant={listing.isActive ? "destructive" : "default"} size="sm" onClick={() => toggleListingStatus(listing.id, listing.isActive)}
                          className={listing.isActive ? "bg-red-500 hover:bg-red-600 text-white rounded-full" : "bg-[#0a7c3e] hover:bg-[#086a34] text-white rounded-full"}>
                          {listing.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button asChild variant="outline" size="sm" className="gap-1 border-[#0a7c3e] text-[#0a7c3e] hover:bg-[#0a7c3e]/10 rounded-full">
                          <Link href={`/edit-listing/${listing.id}`}><Edit className="h-3 w-3 mr-1" />Edit</Link>
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
                <p className="text-gray-300 mb-6">You haven't created any fitness programs yet.</p>
                <Button asChild className="bg-[#0a7c3e] hover:bg-[#086a34] text-white rounded-full px-6">
                  <Link href="/createCourse">Create a Program</Link>
                </Button>
              </div>
            )}
            {myListings.length <= 1 && myListings.length > 0 && (
              <div className="text-center mt-8">
                <Button asChild className="bg-[#0a7c3e] hover:bg-[#086a34] text-white rounded-full px-6 py-2 font-medium">
                  <Link href="/createCourse"><Dumbbell className="h-4 w-4 mr-2" />Create Another Program</Link>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="purchased">
            {purchasedListings.length > 0 ? (
              <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {purchasedListings.map((listing) => (
                  <motion.div key={listing.id} variants={fadeIn} transition={{ duration: 0.5 }}>
                    <Card className="overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-shadow border-none bg-black">
                      <div className="p-2">
                        {listing.imageUrl ? (
                          <div className="w-full h-40 overflow-hidden rounded-lg">
                            <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-full h-40 bg-gradient-to-r from-gray-800 to-gray-900 flex items-center justify-center rounded-lg">
                            <Dumbbell className="h-14 w-14 text-white/80" />
                          </div>
                        )}
                      </div>
                      <CardHeader className="pb-1 bg-black pt-3 px-5">
                        <CardTitle className="text-xl text-white font-bold line-clamp-1">{listing.title}</CardTitle>
                        <CardDescription className="text-gray-300">Purchased for {listing.price} ETH</CardDescription>
                      </CardHeader>
                      <CardContent className="py-3 bg-black px-5">
                        <p className="text-gray-300 text-base line-clamp-2">{listing.description}</p>
                        {listing.courseLinkUrl && (
                          <Button asChild variant="outline" size="sm" className="mt-3 gap-1 border-[#0a7c3e] text-[#0a7c3e] hover:bg-[#0a7c3e]/10 rounded-full">
                            <a href={listing.courseLinkUrl.startsWith('http') ? listing.courseLinkUrl : `https://${listing.courseLinkUrl}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-1" />Access Program
                            </a>
                          </Button>
                        )}
                      </CardContent>
                      <CardFooter className="bg-black pt-2 pb-4 px-5">
                        <Button asChild variant="outline" size="sm" className="w-full border-[#0a7c3e] text-[#0a7c3e] hover:bg-[#0a7c3e]/10 rounded-full">
                          <Link href={`/purchaseProgram/${listing.id}`}>View Program Details</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-16 bg-black rounded-xl shadow-sm text-white">
                <div className="inline-flex rounded-full bg-gray-800 p-6 mb-4">
                  <Activity className="h-8 w-8 text-[#0a7c3e]" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">No Purchases Found</h3>
                <p className="text-gray-300 mb-6">You haven't purchased any fitness programs yet.</p>
                <Button asChild className="bg-[#0a7c3e] hover:bg-[#086a34] text-white rounded-full px-6">
                  <Link href="/purchaseProgram">Browse Fitness Programs</Link>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
