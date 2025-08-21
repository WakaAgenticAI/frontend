"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Package,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ShoppingCart,
  AlertTriangle,
  Calendar,
  DollarSign,
} from "lucide-react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

interface Product {
  id: string
  name: string
  sku: string
  category: string
  onHand: number
  reserved: number
  available: number
  reorderPoint: number
  reorderQuantity: number
  unitCost: number
  sellingPrice: number
  supplier: string
  lastRestocked: Date
  forecast: {
    demand7Days: number
    demand30Days: number
    stockoutRisk: "low" | "medium" | "high" | "critical"
    daysUntilStockout: number
    mape: number
    trend: "up" | "down" | "stable"
  }
}

interface ProductDetailProps {
  product: Product
  onClose: () => void
}

const mockHistoricalData = [
  { week: "Week 1", demand: 12, stock: 67 },
  { week: "Week 2", demand: 15, stock: 55 },
  { week: "Week 3", demand: 18, stock: 40 },
  { week: "Week 4", demand: 22, stock: 23 },
  { week: "Week 5", demand: 25, stock: 8 },
  { week: "Week 6", demand: 20, stock: 45 },
  { week: "Week 7", demand: 18, stock: 67 },
]

export function ProductDetail({ product, onClose }: ProductDetailProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getRiskBadge = (risk: Product["forecast"]["stockoutRisk"]) => {
    const riskConfig = {
      low: { variant: "secondary" as const, className: "bg-chart-4/10 text-chart-4" },
      medium: { variant: "outline" as const, className: "border-chart-2 text-chart-2" },
      high: { variant: "destructive" as const, className: "bg-chart-5/10 text-chart-5 border-chart-5" },
      critical: { variant: "destructive" as const, className: "bg-destructive text-destructive-foreground" },
    }

    const config = riskConfig[risk]
    return (
      <Badge variant={config.variant} className={config.className}>
        {risk.toUpperCase()}
      </Badge>
    )
  }

  const getTrendIcon = (trend: Product["forecast"]["trend"]) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-chart-4" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-chart-5" />
      default:
        return <BarChart3 className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStockStatus = () => {
    if (product.available <= 0) return { status: "Out of Stock", color: "text-destructive" }
    if (product.available <= product.reorderPoint) return { status: "Low Stock", color: "text-chart-5" }
    if (product.available <= product.reorderPoint * 1.5) return { status: "Medium Stock", color: "text-chart-2" }
    return { status: "In Stock", color: "text-chart-4" }
  }

  const stockStatus = getStockStatus()

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>{product.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              {getRiskBadge(product.forecast.stockoutRisk)}
              <Badge variant="outline" className={stockStatus.color}>
                {stockStatus.status}
              </Badge>
            </div>
          </DialogTitle>
          <DialogDescription>
            SKU: {product.sku} • Category: {product.category}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stock Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Stock Levels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold font-sans">{product.onHand}</p>
                    <p className="text-sm text-muted-foreground">On Hand</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold font-sans text-chart-5">{product.reserved}</p>
                    <p className="text-sm text-muted-foreground">Reserved</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className={`text-2xl font-bold font-sans ${stockStatus.color}`}>{product.available}</p>
                    <p className="text-sm text-muted-foreground">Available</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold font-sans">{product.reorderPoint}</p>
                    <p className="text-sm text-muted-foreground">Reorder Point</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Demand Forecast Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Demand & Stock History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockHistoricalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line type="monotone" dataKey="demand" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Demand" />
                    <Line type="monotone" dataKey="stock" stroke="hsl(var(--chart-4))" strokeWidth={2} name="Stock" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Forecast Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-chart-3" />
                  <span>AI Forecast Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 border border-border rounded-lg">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <span className="text-lg font-bold font-sans">{product.forecast.demand7Days}</span>
                      {getTrendIcon(product.forecast.trend)}
                    </div>
                    <p className="text-sm text-muted-foreground">7-Day Demand</p>
                  </div>
                  <div className="text-center p-3 border border-border rounded-lg">
                    <p className="text-lg font-bold font-sans">{product.forecast.demand30Days}</p>
                    <p className="text-sm text-muted-foreground">30-Day Demand</p>
                  </div>
                  <div className="text-center p-3 border border-border rounded-lg">
                    <p className="text-lg font-bold font-sans">{product.forecast.mape}%</p>
                    <p className="text-sm text-muted-foreground">MAPE Accuracy</p>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium font-serif">Stockout Prediction</h4>
                      <p className="text-sm text-muted-foreground">
                        Based on current demand trends and available stock
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold font-sans ${product.forecast.daysUntilStockout <= 7 ? "text-chart-5" : ""}`}
                      >
                        {product.forecast.daysUntilStockout} days
                      </p>
                      <p className="text-sm text-muted-foreground">Until stockout</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Product Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Supplier</p>
                  <p className="font-medium font-serif">{product.supplier}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Restocked</p>
                  <p className="font-medium">{product.lastRestocked.toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reorder Quantity</p>
                  <p className="font-medium">{product.reorderQuantity} units</p>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Pricing</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Unit Cost</span>
                  <span className="font-medium">{formatCurrency(product.unitCost)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Selling Price</span>
                  <span className="font-medium">{formatCurrency(product.sellingPrice)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Margin</span>
                  <span className="font-medium text-chart-4">
                    {(((product.sellingPrice - product.unitCost) / product.sellingPrice) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Inventory Value</span>
                  <span className="font-medium">{formatCurrency(product.onHand * product.unitCost)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full flex items-center space-x-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span>Create Purchase Order</span>
                </Button>
                <Button variant="outline" className="w-full flex items-center space-x-2 bg-transparent">
                  <Package className="h-4 w-4" />
                  <span>Adjust Stock Levels</span>
                </Button>
                <Button variant="outline" className="w-full flex items-center space-x-2 bg-transparent">
                  <Calendar className="h-4 w-4" />
                  <span>Set Reorder Point</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
