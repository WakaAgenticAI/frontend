"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  ShoppingCart,
  MessageSquare,
  HeadphonesIcon,
  Star,
  Volume2,
  Clock,
  Package,
} from "lucide-react"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  segment: "vip" | "regular" | "new" | "at_risk"
  lifetimeValue: number
  totalOrders: number
  lastSeen: Date
  joinDate: Date
  status: "active" | "inactive"
  location: string
  tags: string[]
}

interface CustomerProfileProps {
  customer: Customer
  onClose: () => void
}

const mockPurchases = [
  {
    id: "ORD-12847",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    total: 450000,
    status: "delivered",
    items: ["iPhone 15 Pro", "AirPods Pro"],
  },
  {
    id: "ORD-12832",
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    total: 125000,
    status: "delivered",
    items: ["MacBook Air M3 Case"],
  },
  {
    id: "ORD-12801",
    date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    total: 89000,
    status: "delivered",
    items: ["Samsung Galaxy Buds"],
  },
]

const mockChatHistory = [
  {
    id: "1",
    date: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: "voice" as const,
    duration: "2:34",
    summary: "Inquiry about iPhone 15 Pro availability and pricing",
    resolved: true,
  },
  {
    id: "2",
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    type: "text" as const,
    summary: "Asked about delivery status for order ORD-12847",
    resolved: true,
  },
  {
    id: "3",
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    type: "voice" as const,
    duration: "1:45",
    summary: "Product comparison between iPhone and Samsung Galaxy",
    resolved: true,
  },
]

const mockTickets = [
  {
    id: "TKT-001",
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    subject: "Defective AirPods Pro replacement request",
    status: "resolved",
    priority: "medium",
    assignee: "Support Team",
  },
  {
    id: "TKT-002",
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    subject: "Delivery delay complaint",
    status: "resolved",
    priority: "high",
    assignee: "Customer Success",
  },
]

export function CustomerProfile({ customer, onClose }: CustomerProfileProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getSegmentBadge = (segment: Customer["segment"]) => {
    const segmentConfig = {
      vip: { variant: "default" as const, className: "bg-chart-2 text-chart-2-foreground", icon: Star },
      regular: { variant: "secondary" as const, className: "bg-chart-4/10 text-chart-4", icon: User },
      new: { variant: "outline" as const, className: "bg-chart-1/10 text-chart-1 border-chart-1", icon: User },
      at_risk: { variant: "destructive" as const, className: "bg-chart-5/10 text-chart-5 border-chart-5", icon: User },
    }

    const config = segmentConfig[segment]
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className={`${config.className} flex items-center space-x-1`}>
        <Icon className="h-3 w-3" />
        <span className="capitalize">{segment.replace("_", " ")}</span>
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      delivered: { variant: "default" as const, className: "bg-chart-4/10 text-chart-4" },
      resolved: { variant: "default" as const, className: "bg-chart-4/10 text-chart-4" },
      pending: { variant: "outline" as const, className: "text-muted-foreground" },
      high: { variant: "destructive" as const },
      medium: { variant: "outline" as const, className: "border-chart-2 text-chart-2" },
      low: { variant: "secondary" as const },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || { variant: "outline" as const, className: "" }

    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={customer.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials(customer.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-sans">{customer.name}</span>
                {getSegmentBadge(customer.segment)}
              </div>
              <p className="text-sm text-muted-foreground font-serif">Customer ID: {customer.id}</p>
            </div>
          </DialogTitle>
          <DialogDescription>Complete customer profile and interaction history</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="purchases">Purchases</TabsTrigger>
            <TabsTrigger value="chats">Chats</TabsTrigger>
            <TabsTrigger value="tickets">Support</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Contact Information */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Contact Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{customer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{customer.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">{customer.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Customer Since</p>
                        <p className="font-medium">{customer.joinDate.toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {customer.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button size="sm" className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>Call</span>
                    </Button>
                    <Button size="sm" variant="outline" className="flex items-center space-x-2 bg-transparent">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </Button>
                    <Button size="sm" variant="outline" className="flex items-center space-x-2 bg-transparent">
                      <MessageSquare className="h-4 w-4" />
                      <span>Chat</span>
                    </Button>
                    <Button size="sm" variant="outline" className="flex items-center space-x-2 bg-transparent">
                      <ShoppingCart className="h-4 w-4" />
                      <span>Create Order</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Stats */}
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-chart-2" />
                      <div>
                        <p className="text-2xl font-bold font-sans">{formatCurrency(customer.lifetimeValue)}</p>
                        <p className="text-sm text-muted-foreground">Lifetime Value</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <ShoppingCart className="h-5 w-5 text-chart-1" />
                      <div>
                        <p className="text-2xl font-bold font-sans">{customer.totalOrders}</p>
                        <p className="text-sm text-muted-foreground">Total Orders</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-chart-4" />
                      <div>
                        <p className="text-lg font-bold font-sans">
                          {Math.floor((Date.now() - customer.lastSeen.getTime()) / (1000 * 60 * 60))}h ago
                        </p>
                        <p className="text-sm text-muted-foreground">Last Seen</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="purchases" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Purchase History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPurchases.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell className="font-mono">{purchase.id}</TableCell>
                        <TableCell>{purchase.date.toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {purchase.items.map((item, index) => (
                              <p key={index} className="text-sm">
                                {item}
                              </p>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(purchase.total)}</TableCell>
                        <TableCell>{getStatusBadge(purchase.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chats" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Chat History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockChatHistory.map((chat) => (
                    <div key={chat.id} className="flex items-start space-x-4 p-4 border border-border rounded-lg">
                      <div className="flex-shrink-0">
                        {chat.type === "voice" ? (
                          <div className="w-10 h-10 bg-chart-1/10 rounded-full flex items-center justify-center">
                            <Volume2 className="h-5 w-5 text-chart-1" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-chart-4/10 rounded-full flex items-center justify-center">
                            <MessageSquare className="h-5 w-5 text-chart-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {chat.type === "voice" ? "Voice" : "Text"}
                            </Badge>
                            {chat.type === "voice" && (
                              <span className="text-xs text-muted-foreground">{chat.duration}</span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {chat.date.toLocaleDateString()} {chat.date.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm font-serif">{chat.summary}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          {getStatusBadge(chat.resolved ? "resolved" : "pending")}
                          {chat.type === "voice" && (
                            <Button size="sm" variant="outline" className="h-6 text-xs bg-transparent">
                              <Volume2 className="h-3 w-3 mr-1" />
                              Play
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <HeadphonesIcon className="h-5 w-5" />
                  <span>Support Tickets</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assignee</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockTickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-mono">{ticket.id}</TableCell>
                        <TableCell>{ticket.date.toLocaleDateString()}</TableCell>
                        <TableCell className="max-w-xs">
                          <p className="truncate font-serif">{ticket.subject}</p>
                        </TableCell>
                        <TableCell>{getStatusBadge(ticket.priority)}</TableCell>
                        <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                        <TableCell className="text-sm">{ticket.assignee}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
