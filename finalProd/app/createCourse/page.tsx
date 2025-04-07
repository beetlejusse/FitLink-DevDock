"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ethers } from "ethers"
import { Upload, AlertCircle, Dumbbell, Clock, Target, DollarSign, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { contractABI } from "@/lib/contract-abi"
import { contractAddress } from "@/lib/utils"

const CONTRACT_ADDRESS = contractAddress
const IMGBB_API_KEY = "9df98e0b413b9e091f82c4adf8b68d5a"

export default function CreateProgramPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    courseLinkUrl: "",
    price: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImageToImgBB = async (file: File) => {
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
      })
      
      const data = await response.json()
      
      if (data.success) {
        setFormData(prev => ({ ...prev, imageUrl: data.data.url }))
        return data.data.url
      } else {
        throw new Error(data.error?.message || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      throw new Error('Failed to upload image. Please try again.')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.title.trim()) return setError("Program title is required")
    if (!formData.description.trim()) return setError("Program description is required")
    if (!formData.courseLinkUrl.trim()) return setError("Program materials link is required")
    if (!formData.price.trim()) return setError("Program price is required")
    if (!imageFile && !formData.imageUrl) return setError("Program image is required")

    try {
      const priceInEth = Number.parseFloat(formData.price)
      if (isNaN(priceInEth) || priceInEth <= 0) {
        return setError("Price must be a positive number")
      }

      setSubmitting(true)

      let imageUrl = formData.imageUrl
      if (imageFile && !imageUrl) {
        imageUrl = await uploadImageToImgBB(imageFile)
      }

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
        imageUrl,
        formData.courseLinkUrl,
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
                  className="border-[#0a7c3e]/20 focus:border-[#0a7c3e] focus:ring-[#0a7c3e] rounded-xl text-black"
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
                  className="border-[#0a7c3e]/20 focus:border-[#0a7c3e] focus:ring-[#0a7c3e] rounded-xl text-black"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image" className="text-[#0a7c3e] font-semibold">Program Image</Label>
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="border-[#0a7c3e]/20 focus:border-[#0a7c3e] focus:ring-[#0a7c3e] rounded-xl text-black"
                />
                <p className="text-sm text-[#2d6a4f]">Upload an image showcasing your fitness program.</p>
                {imagePreview && (
                  <div className="mt-2 relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-48 rounded-xl object-contain border border-[#0a7c3e]/20" 
                    />
                  </div>
                )}
                {uploadingImage && (
                  <div className="flex items-center text-sm text-[#2d6a4f]">
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Uploading image...
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="courseLinkUrl" className="text-[#0a7c3e] font-semibold">Program Materials Link</Label>
                <Input
                  id="courseLinkUrl"
                  name="courseLinkUrl"
                  placeholder="https://example.com/program-materials"
                  value={formData.courseLinkUrl}
                  onChange={handleChange}
                  required
                  className="border-[#0a7c3e]/20 focus:border-[#0a7c3e] focus:ring-[#0a7c3e] rounded-xl text-black"
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
                  placeholder="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  className="border-[#0a7c3e]/20 focus:border-[#0a7c3e] focus:ring-[#0a7c3e] rounded-xl text-black"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#0a7c3e] hover:bg-[#086a34] text-white rounded-xl py-6 text-lg font-semibold transition-colors duration-300" 
                disabled={submitting || uploadingImage}
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
