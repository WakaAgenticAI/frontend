"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  Truck,
  Activity,
} from "lucide-react"
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { useEffect, useState } from "react"

const salesTrendData = [
  { name: "Mon", sales: 2400, orders: 45 },
  { name: "Tue", sales: 1398, orders: 32 },
  { name: "Wed", sales: 9800, orders: 78 },
  { name: "Thu", sales: 3908, orders: 56 },
  { name: "Fri", sales: 4800, orders: 89 },
  { name: "Sat", sales: 3800, orders: 67 },
  { name: "Sun", sales: 4300, orders: 72 },
]

const inventoryHealthData = [
  { name: "Electronics", inStock: 245, lowStock: 12, outOfStock: 3 },
  { name: "Clothing", inStock: 189, lowStock: 8, outOfStock: 1 },
  { name: "Home & Garden", inStock: 156, lowStock: 15, outOfStock: 5 },
  { name: "Sports", inStock: 98, lowStock: 6, outOfStock: 2 },
  { name: "Books", inStock: 234, lowStock: 4, outOfStock: 0 },
]

const forecastData = [
  { product: "iPhone 15 Pro", current: 45, forecast: 12, risk: "High" },
  { product: "Samsung Galaxy S24", current: 8, forecast: 25, risk: "Critical" },
  { product: "MacBook Air M3", current: 23, forecast: 18, risk: "Medium" },
  { product: "AirPods Pro", current: 67, forecast: 45, risk: "Low" },
]

const kpiData = [
  {
    title: "Orders Today",
    value: "127",
    change: "+12%",
    trend: "up",
    icon: ShoppingCart,
    color: "text-chart-1",
    sparkline: [45, 52, 48, 61, 67, 73, 89, 127],
  },
  {
    title: "Deliveries",
    value: "89",
    change: "+8%",
    trend: "up",
    icon: Truck,
    color: "text-chart-4",
    sparkline: [34, 41, 38, 45, 52, 58, 67, 89],
  },
  {
    title: "Sales Today",
    value: "₦2.4M",
    change: "+15%",
    trend: "up",
    icon: DollarSign,
    color: "text-chart-2",
    sparkline: [1.8, 2.1, 1.9, 2.3, 2.6, 2.8, 3.1, 2.4],
  },
  {
    title: "Cashflow",
    value: "₦890K",
    change: "-3%",
    trend: "down",
    icon: TrendingUp,
    color: "text-chart-3",
    sparkline: [920, 945, 912, 889, 901, 887, 894, 890],
  },
  {
    title: "Fraud Alerts",
    value: "3",
    change: "New",
    trend: "alert",
    icon: AlertTriangle,
    color: "text-chart-5",
    sparkline: [0, 1, 0, 2, 1, 0, 1, 3],
  },
  {
    title: "Stock Alerts",
    value: "12",
    change: "Reorder",
    trend: "alert",
    icon: Package,
    color: "text-chart-2",
    sparkline: [8, 9, 11, 10, 13, 11, 14, 12],
  },
]

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  return (
    <div className="flex items-end space-x-0.5 h-8 w-16">
      {data.map((value, index) => {
        const height = ((value - min) / range) * 100
        return (
          <div
            key={index}
            className={`w-1 bg-current opacity-60 ${color}`}
            style={{ height: `${Math.max(height, 10)}%` }}
          />
        )
      })}
    </div>
  )
}

function Dashboard() {
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [isRealTime, setIsRealTime] = useState(true)

  useEffect(() => {
    if (!isRealTime) return

    const interval = setInterval(() => {
      setLastUpdate(new Date())
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [isRealTime])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold font-sans text-foreground">Dashboard</h1>
          <p className="text-muted-foreground font-serif">Welcome back! Here's what's happening with your business.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4 text-chart-4" />
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
          <Badge variant="outline" className="bg-accent/10 text-accent-foreground border-accent">
            Real-time updates
          </Badge>
          <Link href="/">
            <Button size="sm" variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.title} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-serif text-muted-foreground">{kpi.title}</CardTitle>
                <Icon className={`h-5 w-5 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-bold font-sans text-foreground">{kpi.value}</div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      {kpi.trend === "up" && <TrendingUp className="h-3 w-3 text-chart-4" />}
                      {kpi.trend === "down" && <TrendingDown className="h-3 w-3 text-chart-5" />}
                      {kpi.trend === "alert" && <AlertTriangle className="h-3 w-3 text-chart-2" />}
                      <span
                        className={
                          kpi.trend === "up" ? "text-chart-4" : kpi.trend === "down" ? "text-chart-5" : "text-chart-2"
                        }
                      >
                        {kpi.change}
                      </span>
                    </div>
                  </div>
                  <Sparkline data={kpi.sparkline} color={kpi.color} />
                </div>
              </CardContent>
              {kpi.trend === "alert" && <div className="absolute top-0 right-0 w-2 h-full bg-accent"></div>}
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-sans flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-chart-1" />
              <span>Sales Trend</span>
            </CardTitle>
            <CardDescription>7-day sales performance with order volume</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesTrendData}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="hsl(var(--chart-1))"
                  fillOpacity={1}
                  fill="url(#salesGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Inventory Health */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-sans flex items-center space-x-2">
              <Package className="h-5 w-5 text-chart-4" />
              <span>Inventory Health</span>
            </CardTitle>
            <CardDescription>Stock levels by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inventoryHealthData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="inStock" fill="hsl(var(--chart-4))" radius={[0, 4, 4, 0]} />
                <Bar dataKey="lowStock" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                <Bar dataKey="outOfStock" fill="hsl(var(--chart-5))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-sans flex items-center space-x-2">
                <Activity className="h-5 w-5 text-chart-3" />
                <span>AI Forecast Insights</span>
              </CardTitle>
              <CardDescription>Predicted stockouts and demand forecasting</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All Forecasts
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {forecastData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium font-serif">{item.product}</h4>
                  <p className="text-sm text-muted-foreground">Current: {item.current} units</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">Forecast: {item.forecast} days</p>
                    <p className="text-xs text-muted-foreground">Until stockout</p>
                  </div>
                  <Badge
                    variant={
                      item.risk === "Critical"
                        ? "destructive"
                        : item.risk === "High"
                          ? "outline"
                          : item.risk === "Medium"
                            ? "secondary"
                            : "default"
                    }
                    className={
                      item.risk === "Critical"
                        ? "border-chart-5 text-chart-5"
                        : item.risk === "High"
                          ? "border-chart-2 text-chart-2"
                          : ""
                    }
                  >
                    {item.risk}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Create PO
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alert Center */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-chart-5">
          <CardHeader>
            <CardTitle className="text-lg font-sans flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-chart-5" />
              <span>Fraud Alerts</span>
            </CardTitle>
            <CardDescription>Recent suspicious activities requiring attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg">
              <div>
                <p className="font-medium font-serif">High-risk transaction detected</p>
                <p className="text-sm text-muted-foreground">Order #12847 - ₦450,000</p>
              </div>
              <Badge variant="destructive">High</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg">
              <div>
                <p className="font-medium font-serif">Unusual payment pattern</p>
                <p className="text-sm text-muted-foreground">Customer ID: CU-9876</p>
              </div>
              <Badge variant="outline" className="border-chart-5 text-chart-5">
                Medium
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-2">
          <CardHeader>
            <CardTitle className="text-lg font-sans flex items-center space-x-2">
              <Package className="h-5 w-5 text-chart-2" />
              <span>Inventory Alerts</span>
            </CardTitle>
            <CardDescription>Products requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-accent/5 rounded-lg">
              <div>
                <p className="font-medium font-serif">Low stock warning</p>
                <p className="text-sm text-muted-foreground">Samsung Galaxy S24 - 5 units left</p>
              </div>
              <Badge className="bg-accent text-accent-foreground">Reorder</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-accent/5 rounded-lg">
              <div>
                <p className="font-medium font-serif">Forecast alert</p>
                <p className="text-sm text-muted-foreground">iPhone 15 Pro - High demand predicted</p>
              </div>
              <Badge className="bg-accent text-accent-foreground">Stock up</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
