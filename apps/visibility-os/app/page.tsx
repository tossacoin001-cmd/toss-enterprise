"use client";

import { motion } from "framer-motion";
import { Eye, Zap, Shield, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Eye,
    title: "Real-time Visibility",
    description: "Monitor your entire enterprise infrastructure in real-time with comprehensive dashboards",
  },
  {
    icon: Zap,
    title: "Performance Insights",
    description: "Get actionable insights with advanced analytics and predictive monitoring",
  },
  {
    icon: Shield,
    title: "Security First",
    description: "Enterprise-grade security with compliance tracking and audit logs",
  },
  {
    icon: BarChart3,
    title: "Business Intelligence",
    description: "Transform raw data into strategic business decisions",
  },
];

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
              Visibility OS
            </h1>
            <p className="text-xl sm:text-2xl text-slate-300 mb-8">
              Enterprise Operating System for Complete Infrastructure Visibility
            </p>
            <button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-3 px-8 rounded-lg transition transform hover:scale-105">
              Get Started
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-slate-800/50">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-16">
            Powerful Features
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-700/50 backdrop-blur rounded-lg p-6 hover:bg-slate-700/80 transition"
                >
                  <Icon className="w-12 h-12 text-orange-500 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-300">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Status */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-slate-400 text-sm">
          Powered by Next.js, React, and Tailwind CSS
        </p>
      </section>
    </div>
  );
}
