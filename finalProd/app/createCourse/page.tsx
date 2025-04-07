"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ethers } from "ethers"
import { Upload, AlertCircle, Dumbbell, Clock, Target, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { contractABI } from "@/lib/contract-abi"

const CONTRACT_ADDRESS = "0x79f54161F4C7eD0A99b87F1be9E0835C18bcf9CF"

export default function CreateProgramPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deployedProjectUrl: "",
    githubRepoLink: "",
    price: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.title.trim()) return setError("Program title is required")
    if (!formData.description.trim()) return setError("Program description is required")
    if (!formData.githubRepoLink.trim()) return setError("Program materials link is required")
    if (!formData.price.trim()) return setError("Program price is required")

    try {
      const priceInEth = Number.parseFloat(formData.price)
      if (isNaN(priceInEth) || priceInEth <= 0) {
        return setError("Price must be a positive number")
      }

      setSubmitting(true)

      const { ethereum } = window as any
      if (!ethereum) {
        setError("Please install MetaMask to create a program")
        setSubmitting(false)
        return
      }

      await ethereum.request({ method: "eth_requestAccounts" })
      const provider = new ethers.BrowserProvider(ethereum)
      const signer = await provider.getSigner()

      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer)

      const tx = await contract.createListing(
        formData.title,
        formData.description,
        formData.deployedProjectUrl,
        formData.githubRepoLink,
        ethers.parseEther(formData.price),
      )

      await tx.wait()

      setSuccess(true)
      setSubmitting(false)
      setTimeout(() => {
        router.push("/purchaseProgram")
      }, 2000)
    } catch (error: any) {
      console.error("Error creating program:", error)
      setError(error.message || "Error creating program. Please try again.")
      setSubmitting(false)
    }
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8f9ef] to-white py-12 px-4">
      <motion.div initial="hidden" animate="visible" variants={fadeIn} className="container mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3 text-[#0a7c3e]">Create a Fitness Program</h1>
          <p className="text-[#2d6a4f] text-lg">Share your expertise and help others achieve their fitness goals.</p>
        </div>

        <Card className="bg-white shadow-lg rounded-2xl overflow-hidden border-[#0a7c3e]/20">
          <CardHeader className="bg-[#f5fbf8] border-b border-[#0a7c3e]/10 p-6">
            <CardTitle className="text-2xl font-semibold text-[#0a7c3e] flex items-center">
              <Dumbbell className="w-6 h-6 mr-2" />
              Program Details
            </CardTitle>
            <CardDescription className="text-[#2d6a4f]">
              Provide information about your fitness program.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {error && (
              <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200 text-red-800 rounded-xl">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle className="font-semibold">Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 bg-green-50 border-green-200 text-green-800 rounded-xl">
                <AlertCircle className="h-5 w-5 text-green-500" />
                <AlertTitle className="font-semibold">Success</AlertTitle>
                <AlertDescription>
                  Your fitness program has been created successfully! Redirecting to marketplace...
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[#0a7c3e] font-semibold">Program Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="E.g., 12-Week Body Transformation"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="border-[#0a7c3e]/20 focus:border-[#0a7c3e] focus:ring-[#0a7c3e] rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-[#0a7c3e] font-semibold">Program Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your fitness program in detail..."
                  rows={5}
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="border-[#0a7c3e]/20 focus:border-[#0a7c3e] focus:ring-[#0a7c3e] rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deployedProjectUrl" className="text-[#0a7c3e] font-semibold">Program Preview URL (Optional)</Label>
                <Input
                  id="deployedProjectUrl"
                  name="deployedProjectUrl"
                  placeholder="https://your-program-preview.com"
                  value={formData.deployedProjectUrl}
                  onChange={handleChange}
                  className="border-[#0a7c3e]/20 focus:border-[#0a7c3e] focus:ring-[#0a7c3e] rounded-xl"
                />
                <p className="text-sm text-[#2d6a4f]">Provide a link where users can preview your program.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="githubRepoLink" className="text-[#0a7c3e] font-semibold">Program Materials Link</Label>
                <Input
                  id="githubRepoLink"
                  name="githubRepoLink"
                  placeholder="https://example.com/program-materials"
                  value={formData.githubRepoLink}
                  onChange={handleChange}
                  required
                  className="border-[#0a7c3e]/20 focus:border-[#0a7c3e] focus:ring-[#0a7c3e] rounded-xl"
                />
                <p className="text-sm text-[#2d6a4f]">
                  This will only be visible to users who purchase your program.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="text-[#0a7c3e] font-semibold">Program Price (ETH)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.1"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  className="border-[#0a7c3e]/20 focus:border-[#0a7c3e] focus:ring-[#0a7c3e] rounded-xl"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#0a7c3e] hover:bg-[#086a34] text-white rounded-xl py-6 text-lg font-semibold transition-colors duration-300" 
                disabled={submitting}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Upload className="h-5 w-5 animate-spin" />
                    Creating Program...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Target className="h-5 w-5" />
                    Launch Your Fitness Program
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
