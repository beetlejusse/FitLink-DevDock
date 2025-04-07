"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ethers } from "ethers"
import { ExternalLink, Link as LinkIcon, AlertCircle, Check, Dumbbell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { contractABI } from "@/lib/contract-abi"
import { contractAddress } from "@/lib/utils"

const address = contractAddress 

type Listing = {
  id: number
  seller: string
  title: string
  description: string
  imageUrl: string
  price: string
  isActive: boolean
  courseLinkUrl?: string
}

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [purchased, setPurchased] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [account, setAccount] = useState<string | null>(null)

  useEffect(() => {
    const initializeProvider = async () => {
      try {
        const { ethereum } = window as any
        if (ethereum) {
          const ethersProvider = new ethers.BrowserProvider(ethereum)

          const accounts = await ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            setAccount(accounts[0])
          }

          const signer = await ethersProvider.getSigner()
          const OpenCode = new ethers.Contract(address, contractABI, signer)
          setContract(OpenCode)

          fetchListing(OpenCode)
          checkIfPurchased(OpenCode, accounts[0])
        } else {
          // If no ethereum object, use a read-only provider
          const readOnlyProvider = new ethers.JsonRpcProvider("https://ethereum-goerli.publicnode.com")

          const OpenCode = new ethers.Contract(address, contractABI, readOnlyProvider)
          setContract(OpenCode)

          fetchListing(OpenCode)
        }
      } catch (error) {
        console.error("Error initializing provider:", error)
        setLoading(false)
        // For demo purposes, show mock data if contract interaction fails
        setMockListing()
      }
    }

    initializeProvider()
  }, [params.id])

  const fetchListing = async (contractInstance: ethers.Contract) => {
    try {
      const listingData = await contractInstance.getListingDetails(params.id)

      setListing({
        id: Number(listingData[0]),
        seller: listingData[1],
        title: listingData[2],
        description: listingData[3],
        imageUrl: listingData[4],
        price: ethers.formatEther(listingData[5]),
        isActive: listingData[6],
      })

      setLoading(false)
    } catch (error) {
      console.error("Error fetching listing:", error)
      setLoading(false)
      // For demo purposes, show mock data if contract interaction fails
      setMockListing()
    }
  }

  const checkIfPurchased = async (contractInstance: ethers.Contract, userAddress: string) => {
    if (!userAddress) return

    try {
      const hasAccess = await contractInstance.hasAccess(params.id, userAddress)
      setPurchased(hasAccess)

      if (hasAccess) {
        const courseLink = await contractInstance.getCourseLinkUrl(params.id)
        setListing((prev) => (prev ? { ...prev, courseLinkUrl: courseLink } : null))
      }
    } catch (error) {
      console.error("Error checking purchase status:", error)
    }
  }

  const setMockListing = () => {
    setListing({
      id: Number(params.id),
      seller: "0x1234567890123456789012345678901234567890",
      title: "12-Week Body Transformation",
      description:
        "Transform your body with this comprehensive 12-week fitness program. Includes progressive workouts, nutrition guidance, and weekly check-ins to keep you on track toward your fitness goals.",
      imageUrl: "https://i.ibb.co/XkKBcqm/fitness-program.jpg",
      price: "0.5",
      isActive: true,
      courseLinkUrl: purchased ? "https://example.com/courses/body-transformation" : undefined,
    })
  }

  const purchaseCode = async () => {
    if (!contract || !listing) return

    try {
      setPurchasing(true)
      setError(null)

      const { ethereum } = window as any
      if (!ethereum) {
        setError("Please install MetaMask to make purchases")
        setPurchasing(false)
        return
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" })
      setAccount(accounts[0])

      const tx = await contract.purchaseCode(listing.id, {
        value: ethers.parseEther(listing.price),
      })

      await tx.wait()

      setPurchased(true)
      const courseLink = await contract.getCourseLinkUrl(listing.id)
      setListing((prev) => (prev ? { ...prev, courseLinkUrl: courseLink } : null))

      setPurchasing(false)
    } catch (error: any) {
      console.error("Error purchasing program:", error)
      setError(error.message || "Error purchasing program. Please try again.")
      setPurchasing(false)
    }
  }

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } },
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#e8f9ef] to-white py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <Skeleton className="h-10 w-3/4 mb-4 bg-[#0a7c3e]/20" />
          <Skeleton className="h-6 w-1/4 mb-8 bg-[#0a7c3e]/20" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Skeleton className="h-48 w-full mb-6 rounded-xl bg-[#0a7c3e]/20" />
              <Skeleton className="h-4 w-full mb-2 bg-[#0a7c3e]/20" />
              <Skeleton className="h-4 w-5/6 mb-2 bg-[#0a7c3e]/20" />
              <Skeleton className="h-4 w-4/6 mb-8 bg-[#0a7c3e]/20" />

              <Skeleton className="h-4 w-full mb-2 bg-[#0a7c3e]/20" />
              <Skeleton className="h-4 w-5/6 mb-2 bg-[#0a7c3e]/20" />
              <Skeleton className="h-4 w-4/6 mb-2 bg-[#0a7c3e]/20" />
              <Skeleton className="h-4 w-3/6 mb-8 bg-[#0a7c3e]/20" />
            </div>

            <div>
              <Skeleton className="h-40 w-full mb-4 rounded-xl bg-[#0a7c3e]/20" />
              <Skeleton className="h-10 w-full rounded-full bg-[#0a7c3e]/20" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#e8f9ef] to-white py-12 px-4 text-center">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-4 text-[#0a7c3e]">Program Not Found</h1>
          <p className="text-[#2d6a4f] mb-8">The fitness program you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push("/purchaseProgram")} className="bg-[#0a7c3e] hover:bg-[#086a34] text-white rounded-full">
            Back to Programs
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8f9ef] to-white py-12 px-4">
      <motion.div initial="hidden" animate="visible" variants={fadeIn} className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-[#0a7c3e]">{listing.title}</h1>
          <div className="flex items-center text-[#2d6a4f]">
            <Badge className="mr-4 bg-[#0a7c3e] text-white">
              {listing.price} ETH
            </Badge>
            <span>
              By {listing.seller.substring(0, 6)}...{listing.seller.substring(listing.seller.length - 4)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {/* Display program image */}
            {listing.imageUrl && (
              <div className="w-full overflow-hidden rounded-xl mb-6 border border-[#0a7c3e]/20">
                <img 
                  src={listing.imageUrl} 
                  alt={listing.title} 
                  className="w-full object-cover"
                />
              </div>
            )}
            
            <div className="prose max-w-none mb-8 text-[#2d6a4f]">
              <h3 className="text-xl font-semibold text-[#0a7c3e] flex items-center">
                <Dumbbell className="h-5 w-5 mr-2" />
                Program Description
              </h3>
              <p>{listing.description}</p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200 text-red-800 rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {purchased && (
              <Alert className="mb-6 bg-[#e8f9ef] border-[#0a7c3e] text-[#0a7c3e] rounded-xl">
                <Check className="h-4 w-4 text-[#0a7c3e]" />
                <AlertTitle>Purchase Successful</AlertTitle>
                <AlertDescription className="text-[#2d6a4f]">
                  You now have access to this fitness program. You can access the program materials below.
                </AlertDescription>
              </Alert>
            )}

            {purchased && listing.courseLinkUrl && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-[#0a7c3e]">Program Access</h3>
                <Button 
                  asChild 
                  variant="outline" 
                  className="gap-2 border-[#0a7c3e] text-[#0a7c3e] hover:bg-[#e8f9ef] rounded-full"
                >
                  <a 
                    href={listing.courseLinkUrl.startsWith('http') ? listing.courseLinkUrl : `https://${listing.courseLinkUrl}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <LinkIcon className="h-4 w-4" />
                    Access Program Materials
                  </a>
                </Button>
              </div>
            )}
          </div>

          <div>
            <Card className="rounded-xl shadow-sm overflow-hidden border-none bg-black">
              <CardContent className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2 text-[#0a7c3e]">Price</h3>
                  <p className="text-2xl font-bold text-[#0a7c3e]">{listing.price} ETH</p>
                </div>

                {!purchased ? (
                  <Button 
                    className="w-full bg-[#0a7c3e] hover:bg-[#086a34] text-white rounded-full" 
                    onClick={purchaseCode} 
                    disabled={purchasing || !account}
                  >
                    {purchasing ? "Processing..." : "Purchase Program"}
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 rounded-full" 
                    disabled
                  >
                    Already Purchased
                  </Button>
                )}

                {!account && (
                  <p className="text-sm text-gray-400 mt-2 text-center">
                    Connect your wallet to make a purchase
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
