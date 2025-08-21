"use client"

import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Package, Truck, AlertTriangle } from "lucide-react"

interface Order {
  id: string
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "fraud_hold"
  date: Date
  trackingNumber?: string
}

interface OrderTimelineProps {
  order: Order
}

export function OrderTimeline({ order }: OrderTimelineProps) {
  const timelineSteps = [
    {
      id: "created",
      title: "Order Created",
      description: "Order was placed by customer",
      icon: Package,
      status: "completed",
      timestamp: order.date,
    },
    {
      id: "confirmed",
      title: "Order Confirmed",
      description: "Payment verified and order confirmed",
      icon: CheckCircle,
      status: order.status === "pending" ? "pending" : "completed",
      timestamp: new Date(order.date.getTime() + 30 * 60 * 1000), // 30 minutes later
    },
    {
      id: "processing",
      title: "Processing",
      description: "Order is being prepared for shipment",
      icon: Clock,
      status: ["pending", "confirmed"].includes(order.status)
        ? "pending"
        : order.status === "processing"
          ? "current"
          : "completed",
      timestamp: new Date(order.date.getTime() + 2 * 60 * 60 * 1000), // 2 hours later
    },
    {
      id: "shipped",
      title: "Shipped",
      description: order.trackingNumber ? `Tracking: ${order.trackingNumber}` : "Order has been shipped",
      icon: Truck,
      status: ["pending", "confirmed", "processing"].includes(order.status)
        ? "pending"
        : order.status === "shipped"
          ? "current"
          : "completed",
      timestamp: new Date(order.date.getTime() + 24 * 60 * 60 * 1000), // 1 day later
    },
    {
      id: "delivered",
      title: "Delivered",
      description: "Order delivered to customer",
      icon: CheckCircle,
      status: order.status === "delivered" ? "completed" : "pending",
      timestamp: new Date(order.date.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days later
    },
  ]

  // Handle special statuses
  if (order.status === "cancelled" || order.status === "fraud_hold") {
    timelineSteps.push({
      id: order.status,
      title: order.status === "cancelled" ? "Order Cancelled" : "Fraud Hold",
      description: order.status === "cancelled" ? "Order was cancelled" : "Order flagged for fraud review",
      icon: AlertTriangle,
      status: "completed",
      timestamp: new Date(),
    })
  }

  const getStepColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-chart-4 bg-chart-4/10 border-chart-4"
      case "current":
        return "text-chart-1 bg-chart-1/10 border-chart-1"
      case "pending":
        return "text-muted-foreground bg-muted border-border"
      default:
        return "text-muted-foreground bg-muted border-border"
    }
  }

  return (
    <div className="space-y-4">
      {timelineSteps.map((step, index) => {
        const Icon = step.icon
        const isLast = index === timelineSteps.length - 1

        return (
          <div key={step.id} className="flex items-start space-x-4">
            <div className="relative">
              <div
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${getStepColor(step.status)}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              {!isLast && <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-px h-8 bg-border" />}
            </div>
            <div className="flex-1 min-w-0 pb-8">
              <div className="flex items-center justify-between">
                <h4 className="font-medium font-serif">{step.title}</h4>
                <Badge variant="outline" className={step.status === "completed" ? "border-chart-4 text-chart-4" : ""}>
                  {step.status === "completed" ? "Completed" : step.status === "current" ? "In Progress" : "Pending"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
              {step.status !== "pending" && (
                <p className="text-xs text-muted-foreground mt-2">
                  {step.timestamp.toLocaleDateString()} at {step.timestamp.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
