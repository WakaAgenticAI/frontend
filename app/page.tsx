"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div
      className="min-h-screen w-full relative flex items-center justify-center"
      style={{
        backgroundImage:
          "url('https://5.imimg.com/data5/SELLER/Default/2022/12/GN/WC/MR/8675179/inventory-management-software-500x500.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <header className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center space-x-2 text-white">
          <Image src="/wakaagent-logo.png" alt="WakaAgent AI Logo" width={32} height={32} className="h-8 w-8" />
          <span className="font-bold text-lg">WakaAgent AI</span>
        </Link>
        <div className="space-x-2">
          <Link href="/dashboard">
            <Button variant="secondary" size="sm">Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="relative z-10 px-6 text-center text-white max-w-4xl">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
          AI-powered Distribution Management System
        </h1>
        <p className="mt-4 text-base sm:text-lg lg:text-xl text-white/90">
          Real-time insights, intelligent automation, and a unified dashboard for orders, CRM, inventory, finance, and support.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          <Link href="/dashboard">
            <Button size="lg" className="shadow-lg">Enter Dashboard</Button>
          </Link>
          <Link href="/chat">
            <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
              Try Chat Assistant
            </Button>
          </Link>
        </div>
      </main>

      <footer className="absolute bottom-0 inset-x-0 p-4 text-center text-white/70 text-xs">
        © {new Date().getFullYear()} WakaAgent AI. All rights reserved.
      </footer>
    </div>
  )
}
