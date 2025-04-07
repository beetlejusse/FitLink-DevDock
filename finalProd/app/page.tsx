"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Dumbbell,
  LineChart,
  MessageCircle,
  BookOpen,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ConnectWallet from "@/components/connect-wallet";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

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

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <section className="relative flex items-center justify-center min-h-screen">
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-green-200 to-green-500 opacity-10" />
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-green-300 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-green-400 blur-3xl" />
        </div>

        <div className="container px-4 md:px-6 mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="space-y-8 max-w-3xl mx-auto"
          >
            <motion.div
              className="inline-block px-4 py-2 rounded-full bg-green-100 border border-green-200 text-green-800 font-medium shadow"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              Decentralized Fitness Platform
            </motion.div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-green-900 leading-tight">
              Transform Your <span className="text-green-600">Fitness Journey</span>
            </h1>

            <p className="text-xl md:text-2xl text-green-800 leading-relaxed">
              FitLink revolutionizes fitness with blockchain technology — track progress,
              connect with trainers, and hit your health goals like never before.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white shadow-xl transition-all">
                <Link href="/dashboard">
                  Start Your Journey <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <ConnectWallet />
            </div>
          </motion.div>
        </div>
      </section>
      <section className="py-20 bg-white">
        <div className="container px-4 md:px-6 mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 className="text-4xl font-bold text-green-800 mb-4">
              Why Choose FitLink?
            </motion.h2>
            <motion.p variants={fadeIn} className="text-lg text-green-700 max-w-2xl mx-auto">
              A powerful fitness ecosystem enhanced by Web3 and blockchain innovation.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              {
                icon: <Dumbbell className="h-6 w-6 text-green-600" />,
                title: "Workout Tracking",
                description: "Easily log and monitor workouts with smart progress charts.",
              },
              {
                icon: <BookOpen className="h-6 w-6 text-green-600" />,
                title: "Fitness Courses",
                description: "Explore premium trainer-led courses tailored for your goals.",
              },
              {
                icon: <MessageCircle className="h-6 w-6 text-green-600" />,
                title: "Community Chat",
                description: "Connect with peers and trainers to stay motivated.",
              },
              {
                icon: <LineChart className="h-6 w-6 text-green-600" />,
                title: "AI Insights",
                description: "Get personalized data-driven insights to improve results.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                whileHover={{ y: -6 }}
                className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-all border border-green-100 text-center"
              >
                <div className="h-14 w-14 mx-auto mb-6 flex items-center justify-center rounded-full bg-green-50">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-green-800">{feature.title}</h3>
                <p className="text-green-700 mt-2">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      <section className="bg-green-50 py-20">
        <div className="container px-4 md:px-6 mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-green-800 mb-12">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Ava M.",
                feedback:
                  "FitLink helped me stay accountable and connected. The decentralized aspect made it feel truly secure.",
              },
              {
                name: "Jason R.",
                feedback:
                  "The AI recommendations gave me new insights into my training. Love the course selection too!",
              },
              {
                name: "Priya S.",
                feedback:
                  "Such a motivating community. I feel part of something bigger and healthier every day!",
              },
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.03 }}
                className="bg-white p-6 rounded-2xl shadow border border-green-100"
              >
                <Quote className="text-green-400 mb-4" />
                <p className="text-green-700 italic mb-4">"{testimonial.feedback}"</p>
                <h4 className="text-green-800 font-semibold">— {testimonial.name}</h4>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-24 bg-gradient-to-br from-green-100 to-green-200">
        <div className="container px-4 md:px-6 mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white p-10 md:p-14 rounded-3xl shadow-xl border border-green-200"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-green-800 mb-4">
              Ready to Transform Your Fitness?
            </h2>
            <p className="text-xl text-green-700 mb-8">
              Join FitLink today and take control of your fitness destiny.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white shadow transition-all">
                <Link href="/dashboard">Get Started</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-green-600 text-green-600 hover:bg-green-50 hover:border-green-700 transition-all"
              >
                <Link href="/purchaseProgram">Explore Courses</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
