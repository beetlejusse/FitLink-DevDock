"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Dumbbell, LineChart, MessageCircle, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConnectWallet from "@/components/connect-wallet";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  if (!mounted) return null;
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="space-y-6"
            >
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-green-800">
                Transform Your Fitness Journey with <span className="text-green-600">FitLink</span>
              </h1>
              <p className="text-xl text-green-700 max-w-[600px]">
                A decentralized fitness platform to track your progress, connect with trainers, and achieve your health goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                  <Link href="/dashboard">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <ConnectWallet />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative lg:h-[500px] flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-200 to-green-300 rounded-3xl blur-3xl opacity-50" />
              <div className="relative z-10 bg-white/80 backdrop-blur-sm border border-green-200 rounded-xl p-6 w-full max-w-lg shadow-xl">
                <img src="/fitness-dashboard-mockup.png" alt="FitLink Dashboard" className="w-full h-auto rounded-lg shadow-md" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-green-100/50">
        <div className="container px-4 md:px-6 mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2
              variants={fadeIn}
              className="text-3xl md:text-4xl font-bold mb-4 text-green-800"
            >
              Why Choose FitLink?
            </motion.h2>
            <motion.p
              variants={fadeIn}
              className="text-xl text-green-700 max-w-[800px] mx-auto"
            >
              A comprehensive fitness ecosystem powered by blockchain technology.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
          >
            <motion.div
              variants={fadeIn}
              className="bg-white rounded-xl p-6 shadow-sm border border-green-200"
            >
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <Dumbbell className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-green-800">Workout Tracking</h3>
              <p className="text-green-700">
                Log your workouts and track your progress with our intuitive dashboard.
              </p>
            </motion.div>

            <motion.div
              variants={fadeIn}
              className="bg-white rounded-xl p-6 shadow-sm border border-green-200"
            >
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-green-800">Fitness Courses</h3>
              <p className="text-green-700">
                Access and purchase premium fitness courses from top trainers.
              </p>
            </motion.div>

            <motion.div
              variants={fadeIn}
              className="bg-white rounded-xl p-6 shadow-sm border border-green-200"
            >
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-green-800">Community Chat</h3>
              <p className="text-green-700">
                Connect with like-minded fitness enthusiasts and share your journey.
              </p>
            </motion.div>

            <motion.div
              variants={fadeIn}
              className="bg-white rounded-xl p-6 shadow-sm border border-green-200"
            >
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <LineChart className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-green-800">AI-Powered Insights</h3>
              <p className="text-green-700">
                Get personalized recommendations and insights based on your fitness data.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container px-4 md:px-6 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-green-200 via-green-100 to-green-50 rounded-3xl p-8 md:p-12 shadow-lg border border-green-300"
          >
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-green-800">
                Ready to Transform Your Fitness?
              </h2>
              <p className="text-xl text-green-700 mb-8">
                Join FitLink today and start your journey towards a healthier, stronger you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                  <Link href="/signup">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-green-600 text-green-600 hover:bg-green-50">
                  <Link href="/courses">Explore Courses</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
