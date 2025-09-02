"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-extrabold">404</h1>
        <p className="text-muted-foreground">This page could not be found.</p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
