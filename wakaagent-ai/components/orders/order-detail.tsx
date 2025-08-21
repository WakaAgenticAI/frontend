"use client"

import { Label } from "@/components/ui/label"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Truck, CreditCard, User, AlertTriangle, RefreshCw, Phone, Mail } from "lucide-react"
import { OrderTimeline } from "./order-timeline"

interface Order {
  id: string
  customer: {
    name: string
    email: string
    id: string
  }
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "fraud_hold"
  total: number
  items: number
  channel: "online" | "phone" | "chat" | "api"
  date: Date
  riskScore?: number
  trackingNumber?: string
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
}

interface OrderDetailProps {
  order: Order
  onClose: () => void
  onStatusChange: (orderId: string, newStatus: Order["status"]) => void
}

const mockOrderItems = [
  { id: "1", name: "iPhone 15 Pro", sku: "IPH-15-PRO", quantity: 1, price: 450000 },
  { id: "2", name: "AirPods Pro", sku: "APP-PRO", quantity: 2, price: 89000 },
]

const mockShippingAddress = {
  street: "123 Victoria Island Road",
  city: "Lagos",
  state: "Lagos State",
  country: "Nigeria",
  postalCode: "101001",
}

export function OrderDetail({ order, onClose, onStatusChange }: OrderDetailProps) {
  const [selectedStatus, setSelectedStatus] = useState(order.status)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: Order["status"]) => {
    const colors = {
      pending: "text-muted-foreground",
      confirmed: "text-chart-3",
      processing: "text-chart-1",
      shipped: "text-chart-4",
      delivered: "text-chart-4",
      cancelled: "text-destructive",
      fraud_hold: "text-chart-5",
    }
    return colors[status]
  }

  const handleStatusUpdate = () => {
    if (selectedStatus !== order.status) {
      onStatusChange(order.id, selectedStatus)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Order {order.id}</span>
            </div>
            <div className="flex items-center space-x-2">
              {order.riskScore && order.riskScore > 70 && (
                <Badge variant="destructive" className="flex items-center space-x-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span>High Risk ({order.riskScore}%)</span>
                </Badge>
              )}
              <Badge variant="outline" className={getStatusColor(order.status)}>
                {order.status.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
          </DialogTitle>
          <DialogDescription>
            Created on {order.date.toLocaleDateString()} at {order.date.toLocaleTimeString()}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderTimeline order={order} />
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockOrderItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-3 border-b border-border last:border-b-0"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium font-serif">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                        <p className="text-sm text-muted-foreground">{formatCurrency(item.price)} each</p>
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            {order.trackingNumber && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Truck className="h-5 w-5" />
                    <span>Shipping Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Tracking Number</Label>
                      <p className="font-mono text-sm bg-muted p-2 rounded">{order.trackingNumber}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Shipping Address</Label>
                      <div className="text-sm text-muted-foreground">
                        <p>{mockShippingAddress.street}</p>
                        <p>
                          {mockShippingAddress.city}, {mockShippingAddress.state}
                        </p>
                        <p>
                          {mockShippingAddress.country} {mockShippingAddress.postalCode}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Management */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Update Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="fraud_hold">Fraud Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleStatusUpdate} disabled={selectedStatus === order.status} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Update Status
                </Button>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Customer</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium font-serif">{order.customer.name}</p>
                  <p className="text-sm text-muted-foreground">ID: {order.customer.id}</p>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{order.customer.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>+234 801 234 5678</span>
                </div>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  View Customer Profile
                </Button>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Payment</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Status</span>
                  <Badge
                    variant={
                      order.paymentStatus === "paid"
                        ? "default"
                        : order.paymentStatus === "failed"
                          ? "destructive"
                          : "outline"
                    }
                  >
                    {order.paymentStatus.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Method</span>
                  <span className="text-sm">Card ending in 4242</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Amount</span>
                  <span className="text-sm font-medium">{formatCurrency(order.total)}</span>
                </div>
                {order.paymentStatus === "pending" && (
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Process Payment
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
