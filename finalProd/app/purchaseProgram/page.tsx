"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractABI } from "@/lib/contract-abi";
import { contractAddress } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, RefreshCw, AlertCircle, Dumbbell, Clock, User } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";

const address = contractAddress;

interface Listing {
  id: number;
  seller: string;
  title: string;
  description: string;
  deployedProjectUrl: string;
  githubRepoLink: string;
  price: string;
  isActive: boolean;
}

const FitnessPrograms = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const router = useRouter();

  const fetchListings = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const contract = new ethers.Contract(address, contractABI, provider);

      const listingCounter = await contract.listingCounter();

      const allListings: Listing[] = [];
      for (let i = 1; i <= listingCounter; i++) {
        const listing = await contract.listings(i);

        if (listing.isActive) {
          allListings.push({
            id: Number(listing.id),
            seller: listing.seller,
            title: listing.title,
            description: listing.description,
            deployedProjectUrl: listing.deployedProjectUrl,
            githubRepoLink: listing.githubRepoLink,
            price: ethers.formatEther(listing.price),
            isActive: listing.isActive,
          });
        }
      }
      setListings(allListings);
    } catch (error) {
      console.error("Error fetching programs:", error);
      setError(
        "Failed to fetch fitness programs. Please make sure your wallet is connected and try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchListings(true);
  };

  const handlePurchase = async (listingId: number, priceInEth: string) => {
    try {
      if (!(window as any).ethereum) {
        throw new Error(
          "MetaMask not found! Please install MetaMask and try again."
        );
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      await provider.send("eth_requestAccounts", []); 
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(address, contractABI, signer);

      const priceInWei = ethers.parseEther(priceInEth);

      const txResponse = await contract.purchaseCode(listingId, {
        value: priceInWei,
      });
      await txResponse.wait();

      setNotification({
        type: "success",
        message: "Purchase successful! Redirecting to dashboard...",
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch (err) {
      console.error("Error during purchase:", err);
      let errorMessage =
        err instanceof Error
          ? err.message
          : "An unknown error occurred. Please try again.";

      setNotification({ type: "error", message: errorMessage });
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const getProgramDuration = (id: number) => {
    const durations = ["4 weeks", "8 weeks", "12 weeks", "6 weeks"];
    return durations[id % durations.length];
  };

  const getProgramLevel = (id: number) => {
    const levels = ["Beginner", "Intermediate", "Advanced", "All Levels"];
    return levels[id % levels.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8f9ef] to-white py-12 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-[#0a7c3e] mb-2">
              Premium Fitness Programs
            </h1>
            <p className="text-[#2d6a4f] text-lg max-w-2xl">
              Transform your body and mind with expert-designed training programs
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={loading || refreshing}
            className="mt-4 md:mt-0 border-[#0a7c3e] text-[#0a7c3e] hover:bg-[#e8f9ef] hover:text-[#0a7c3e] rounded-full px-6"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh Programs"}
          </Button>
        </div>

        {notification && (
          <Alert
            variant={notification.type === "success" ? "default" : "destructive"}
            className="mb-8 border-l-4 border-l-[#0a7c3e] bg-[#e8f9ef] rounded-lg shadow-md"
          >
            <AlertCircle className="h-5 w-5 text-[#0a7c3e]" />
            <AlertTitle className="text-[#0a7c3e] font-semibold text-lg">
              {notification.type === "success" ? "Success" : "Error"}
            </AlertTitle>
            <AlertDescription className="text-[#2d6a4f] text-base">{notification.message}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-8 border-l-4 border-l-red-500 bg-red-50 rounded-lg shadow-md">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="text-lg">Error</AlertTitle>
            <AlertDescription className="text-base">{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden border-none rounded-2xl shadow-lg">
                <div className="h-48 bg-gradient-to-r from-[#0a7c3e]/20 to-[#2d6a4f]/20 flex items-center justify-center">
                  <Skeleton className="h-16 w-16 rounded-full bg-[#e8f9ef]" />
                </div>
                <CardHeader className="pb-2 bg-white">
                  <Skeleton className="h-7 w-3/4 mb-2 bg-[#e8f9ef]" />
                  <Skeleton className="h-5 w-1/2 bg-[#e8f9ef]" />
                </CardHeader>
                <CardContent className="bg-white">
                  <Skeleton className="h-4 w-full mb-2 bg-[#e8f9ef]" />
                  <Skeleton className="h-4 w-full mb-2 bg-[#e8f9ef]" />
                  <Skeleton className="h-4 w-2/3 bg-[#e8f9ef]" />
                </CardContent>
                <CardFooter className="flex justify-between bg-white pt-0">
                  <Skeleton className="h-12 w-full bg-[#e8f9ef] rounded-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-md border border-[#0a7c3e]/10">
            <div className="inline-flex rounded-full bg-[#e8f9ef] p-6 mb-4">
              <Dumbbell className="h-12 w-12 text-[#0a7c3e]" />
            </div>
            <h3 className="text-2xl font-bold text-[#0a7c3e] mb-2">
              No fitness programs available
            </h3>
            <p className="text-[#2d6a4f] text-lg max-w-md mx-auto">
              Check back later or refresh to see new programs from our trainers
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden flex flex-col border-none rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="h-48 bg-gradient-to-r from-[#0a7c3e]/20 to-[#2d6a4f]/20 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-6">
                      <Dumbbell className="h-12 w-12 text-[#0a7c3e]" />
                    </div>
                  </div>
                  <Badge variant="secondary" className="absolute top-4 right-4 bg-[#0a7c3e] text-white font-bold px-4 py-1.5 rounded-full text-sm shadow-md">
                    {listing.price} ETH
                  </Badge>
                </div>

                <CardHeader className="pb-2 bg-white">
                  <CardTitle className="text-2xl font-bold text-[#0a7c3e]">{listing.title}</CardTitle>
                  <div className="flex items-center text-[#2d6a4f]">
                    <User className="h-3.5 w-3.5 mr-1" />
                    <CardDescription className="text-[#2d6a4f]">
                      By {truncateAddress(listing.seller)}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="bg-white pt-0">
                  <p className="text-[#2d6a4f] text-base line-clamp-3 mb-4">
                    {listing.description}
                  </p>
                  
                  <div className="flex justify-between text-sm text-[#2d6a4f]/80 mt-2 border-t border-[#e8f9ef] pt-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1.5" />
                      <span>{getProgramDuration(listing.id)}</span>
                    </div>
                    <div className="flex items-center">
                      <Badge variant="outline" className="font-normal border-[#0a7c3e]/30 text-[#0a7c3e]">
                        {getProgramLevel(listing.id)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3 pt-2 pb-6 bg-white">
                  <Button 
                    asChild 
                    variant="outline" 
                    className="w-full border-[#0a7c3e] text-[#0a7c3e] hover:bg-[#e8f9ef] hover:text-[#0a7c3e] rounded-full h-11"
                  >
                    <a
                      href={`${
                        listing.deployedProjectUrl.startsWith("http")
                          ? listing.deployedProjectUrl
                          : `https://${listing.deployedProjectUrl}`
                      }`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Preview Program
                    </a>
                  </Button>

                  <Button
                    onClick={() => handlePurchase(listing.id, listing.price)}
                    className="w-full bg-[#0a7c3e] hover:bg-[#086a34] text-white rounded-full h-11 font-bold"
                  >
                    START YOUR FITNESS JOURNEY
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FitnessPrograms;
