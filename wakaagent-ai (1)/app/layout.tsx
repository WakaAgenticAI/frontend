import type React from "react"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { Manrope } from "next/font/google"
import "./globals.css"

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
})

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
})

export const metadata: Metadata = {
  title: "WakaAgent AI - Distribution Management System",
  description: "AI-powered distribution management system with real-time insights",
  generator: "v0.app",
  icons: {
    icon: "/wakaagent-logo.png",
    shortcut: "/wakaagent-logo.png",
    apple: "/wakaagent-logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${manrope.variable} antialiased`}>
      <body className="bg-background text-foreground">{children}</body>
    </html>
  )
}
