"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, Eye, CheckCircle, RefreshCw, AlertTriangle, Truck, Package, Printer } from "lucide-react"
import { OrderWizard } from "./order-wizard"
import { OrderDetail } from "./order-detail"

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

const mockOrders: Order[] = [
  {
    id: "ORD-12847",
    customer: { name: "Adebayo Johnson", email: "adebayo@email.com", id: "CU-001" },
    status: "fraud_hold",
    total: 450000,
    items: 3,
    channel: "online",
    date: new Date(Date.now() - 2 * 60 * 60 * 1000),
    riskScore: 85,
    paymentStatus: "pending",
  },
  {
    id: "ORD-12846",
    customer: { name: "Fatima Abdullahi", email: "fatima@email.com", id: "CU-002" },
    status: "shipped",
    total: 125000,
    items: 2,
    channel: "chat",
    date: new Date(Date.now() - 4 * 60 * 60 * 1000),
    trackingNumber: "TRK-789456",
    paymentStatus: "paid",
  },
  {
    id: "ORD-12845",
    customer: { name: "Chinedu Okafor", email: "chinedu@email.com", id: "CU-003" },
    status: "delivered",
    total: 89000,
    items: 1,
    channel: "phone",
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    trackingNumber: "TRK-789455",
    paymentStatus: "paid",
  },
  {
    id: "ORD-12844",
    customer: { name: "Amina Hassan", email: "amina@email.com", id: "CU-004" },
    status: "processing",
    total: 234000,
    items: 4,
    channel: "online",
    date: new Date(Date.now() - 6 * 60 * 60 * 1000),
    paymentStatus: "paid",
  },
  {
    id: "ORD-12843",
    customer: { name: "Emeka Nwankwo", email: "emeka@email.com", id: "CU-005" },
    status: "confirmed",
    total: 67000,
    items: 2,
    channel: "api",
    date: new Date(Date.now() - 1 * 60 * 60 * 1000),
    paymentStatus: "paid",
  },
]

export function OrdersInterface() {
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderWizard, setShowOrderWizard] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [channelFilter, setChannelFilter] = useState<string>("all")

  const getStatusBadge = (status: Order["status"]) => {
    const statusConfig = {
      pending: { variant: "outline" as const, color: "text-muted-foreground", icon: Package },
      confirmed: { variant: "secondary" as const, color: "text-chart-3", icon: CheckCircle },
      processing: { variant: "default" as const, color: "text-chart-1", icon: RefreshCw },
      shipped: { variant: "default" as const, color: "text-chart-4", icon: Truck },
      delivered: { variant: "default" as const, color: "text-chart-4", icon: CheckCircle },
      cancelled: { variant: "destructive" as const, color: "text-destructive", icon: AlertTriangle },
      fraud_hold: { variant: "destructive" as const, color: "text-chart-5", icon: AlertTriangle },
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
        <Icon className="h-3 w-3" />
        <span className="capitalize">{status.replace("_", " ")}</span>
      </Badge>
    )
  }

  const getChannelBadge = (channel: Order["channel"]) => {
    const channelColors = {
      online: "bg-chart-1/10 text-chart-1",
      phone: "bg-chart-2/10 text-chart-2",
      chat: "bg-chart-4/10 text-chart-4",
      api: "bg-chart-3/10 text-chart-3",
    }

    return (
      <Badge variant="outline" className={channelColors[channel]}>
        {channel.toUpperCase()}
      </Badge>
    )
  }

  const handleStatusChange = (orderId: string, newStatus: Order["status"]) => {
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    const matchesChannel = channelFilter === "all" || order.channel === channelFilter

    return matchesSearch && matchesStatus && matchesChannel
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-sans text-foreground">Orders</h1>
          <p className="text-muted-foreground font-serif">Manage and track all customer orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.print()} className="flex items-center space-x-2">
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </Button>
          <Button onClick={() => setShowOrderWizard(true)} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Create Order</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders, customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="fraud_hold">Fraud Hold</SelectItem>
              </SelectContent>
            </Select>
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="chat">Chat</SelectItem>
                <SelectItem value="api">API</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-mono font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium font-serif">{order.customer.name}</p>
                        <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{getChannelBadge(order.channel)}</TableCell>
                    <TableCell>{order.items} items</TableCell>
                    <TableCell className="font-medium">{formatCurrency(order.total)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {order.date.toLocaleDateString()}{" "}
                      {order.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </TableCell>
                    <TableCell>
                      {order.riskScore && (
                        <Badge
                          variant={
                            order.riskScore > 70 ? "destructive" : order.riskScore > 40 ? "outline" : "secondary"
                          }
                        >
                          {order.riskScore}%
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {order.status === "confirmed" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(order.id, "processing")}>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Mark Processing
                            </DropdownMenuItem>
                          )}
                          {order.status === "processing" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(order.id, "shipped")}>
                              <Truck className="h-4 w-4 mr-2" />
                              Mark Shipped
                            </DropdownMenuItem>
                          )}
                          {order.status === "shipped" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(order.id, "delivered")}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark Delivered
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, "cancelled")}>
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Cancel Order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Wizard Modal */}
      {showOrderWizard && (
        <OrderWizard
          onClose={() => setShowOrderWizard(false)}
          onOrderCreated={(newOrder) => {
            setOrders((prev) => [newOrder, ...prev])
            setShowOrderWizard(false)
          }}
        />
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetail order={selectedOrder} onClose={() => setSelectedOrder(null)} onStatusChange={handleStatusChange} />
      )}
    </div>
  )
}
