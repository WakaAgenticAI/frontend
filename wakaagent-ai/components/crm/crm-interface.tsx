"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  Plus,
  MoreHorizontal,
  Phone,
  Mail,
  MessageSquare,
  ShoppingCart,
  User,
  Star,
  Calendar,
  DollarSign,
} from "lucide-react"
import { CustomerProfile } from "./customer-profile"

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

const mockCustomers: Customer[] = [
  {
    id: "CU-001",
    name: "Adebayo Johnson",
    email: "adebayo@email.com",
    phone: "+234 801 234 5678",
    segment: "vip",
    lifetimeValue: 2450000,
    totalOrders: 23,
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
    joinDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    status: "active",
    location: "Lagos, Nigeria",
    tags: ["Premium", "Frequent Buyer"],
  },
  {
    id: "CU-002",
    name: "Fatima Abdullahi",
    email: "fatima@email.com",
    phone: "+234 802 345 6789",
    segment: "regular",
    lifetimeValue: 890000,
    totalOrders: 12,
    lastSeen: new Date(Date.now() - 24 * 60 * 60 * 1000),
    joinDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
    status: "active",
    location: "Abuja, Nigeria",
    tags: ["Electronics"],
  },
  {
    id: "CU-003",
    name: "Chinedu Okafor",
    email: "chinedu@email.com",
    phone: "+234 803 456 7890",
    segment: "new",
    lifetimeValue: 125000,
    totalOrders: 3,
    lastSeen: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    status: "active",
    location: "Port Harcourt, Nigeria",
    tags: ["New Customer"],
  },
  {
    id: "CU-004",
    name: "Amina Hassan",
    email: "amina@email.com",
    phone: "+234 804 567 8901",
    segment: "at_risk",
    lifetimeValue: 567000,
    totalOrders: 8,
    lastSeen: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    joinDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
    status: "inactive",
    location: "Kano, Nigeria",
    tags: ["At Risk", "Fashion"],
  },
  {
    id: "CU-005",
    name: "Emeka Nwankwo",
    email: "emeka@email.com",
    phone: "+234 805 678 9012",
    segment: "regular",
    lifetimeValue: 1200000,
    totalOrders: 15,
    lastSeen: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    joinDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
    status: "active",
    location: "Ibadan, Nigeria",
    tags: ["Tech Enthusiast"],
  },
  {
    id: "CU-006",
    name: "Kemi Adebayo",
    email: "kemi@email.com",
    phone: "+234 806 789 0123",
    segment: "vip",
    lifetimeValue: 3200000,
    totalOrders: 31,
    lastSeen: new Date(Date.now() - 6 * 60 * 60 * 1000),
    joinDate: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000),
    status: "active",
    location: "Lagos, Nigeria",
    tags: ["VIP", "Bulk Orders"],
  },
]

export function CRMInterface() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [segmentFilter, setSegmentFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const getSegmentBadge = (segment: Customer["segment"]) => {
    const segmentConfig = {
      vip: { variant: "default" as const, className: "bg-chart-2 text-chart-2-foreground", icon: Star },
      regular: { variant: "secondary" as const, className: "bg-chart-4/10 text-chart-4", icon: User },
      new: { variant: "outline" as const, className: "bg-chart-1/10 text-chart-1 border-chart-1", icon: Plus },
      at_risk: {
        variant: "destructive" as const,
        className: "bg-chart-5/10 text-chart-5 border-chart-5",
        icon: Calendar,
      },
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`
    const diffInMonths = Math.floor(diffInDays / 30)
    return `${diffInMonths}mo ago`
  }

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      customer.location.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesSegment = segmentFilter === "all" || customer.segment === segmentFilter
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter

    return matchesSearch && matchesSegment && matchesStatus
  })

  const handleQuickAction = (action: string, customer: Customer) => {
    console.log(`${action} action for customer:`, customer.name)
    // Here you would integrate with actual phone, email, chat, and order systems
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-sans text-foreground">Customer Relationship Management</h1>
          <p className="text-muted-foreground font-serif">Manage customer relationships and track interactions</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}>
            {viewMode === "grid" ? "List View" : "Grid View"}
          </Button>
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Customer</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-chart-1" />
              <div>
                <p className="text-2xl font-bold font-sans">{customers.length}</p>
                <p className="text-sm text-muted-foreground">Total Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-chart-2" />
              <div>
                <p className="text-2xl font-bold font-sans">{customers.filter((c) => c.segment === "vip").length}</p>
                <p className="text-sm text-muted-foreground">VIP Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-chart-4" />
              <div>
                <p className="text-2xl font-bold font-sans">
                  {formatCurrency(customers.reduce((sum, c) => sum + c.lifetimeValue, 0))}
                </p>
                <p className="text-sm text-muted-foreground">Total LTV</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-chart-5" />
              <div>
                <p className="text-2xl font-bold font-sans">
                  {customers.filter((c) => c.segment === "at_risk").length}
                </p>
                <p className="text-sm text-muted-foreground">At Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={segmentFilter} onValueChange={setSegmentFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Segment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Segments</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="at_risk">At Risk</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCustomers.map((customer) => (
                <Card
                  key={customer.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={customer.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {getInitials(customer.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium font-serif">{customer.name}</h3>
                          <p className="text-sm text-muted-foreground">{customer.email}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleQuickAction("call", customer)}>
                            <Phone className="h-4 w-4 mr-2" />
                            Call
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleQuickAction("email", customer)}>
                            <Mail className="h-4 w-4 mr-2" />
                            Email
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleQuickAction("chat", customer)}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Chat
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleQuickAction("order", customer)}>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Create Order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Segment</span>
                        {getSegmentBadge(customer.segment)}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Lifetime Value</span>
                        <span className="font-medium">{formatCurrency(customer.lifetimeValue)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Orders</span>
                        <span className="font-medium">{customer.totalOrders}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Last Seen</span>
                        <span className="text-sm">{getRelativeTime(customer.lastSeen)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Location</span>
                        <span className="text-sm">{customer.location}</span>
                      </div>

                      {customer.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-2">
                          {customer.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCustomers.map((customer) => (
                <Card
                  key={customer.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={customer.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {getInitials(customer.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium font-serif">{customer.name}</h3>
                          <p className="text-sm text-muted-foreground">{customer.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {getSegmentBadge(customer.segment)}
                        <span className="text-sm font-medium">{formatCurrency(customer.lifetimeValue)}</span>
                        <span className="text-sm text-muted-foreground">{customer.totalOrders} orders</span>
                        <span className="text-sm text-muted-foreground">{getRelativeTime(customer.lastSeen)}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleQuickAction("call", customer)}>
                              <Phone className="h-4 w-4 mr-2" />
                              Call
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleQuickAction("email", customer)}>
                              <Mail className="h-4 w-4 mr-2" />
                              Email
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleQuickAction("chat", customer)}>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Chat
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleQuickAction("order", customer)}>
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Create Order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Profile Modal */}
      {selectedCustomer && <CustomerProfile customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />}
    </div>
  )
}
