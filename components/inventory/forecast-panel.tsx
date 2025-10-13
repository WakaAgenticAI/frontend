"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Package, BarChart3 } from "lucide-react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

interface Product {
  id: string
  name: string
  sku: string
  onHand: number
  available: number
  reorderPoint: number
  forecast: {
    demand7Days: number
    demand30Days: number
    stockoutRisk: "low" | "medium" | "high" | "critical"
    daysUntilStockout: number
    mape: number
    trend: "up" | "down" | "stable"
  }
}

interface ForecastPanelProps {
  products: Product[]
  onClose: () => void
}

const mockForecastData = [
  { day: "Day 1", demand: 12, stock: 45 },
  { day: "Day 2", demand: 15, stock: 33 },
  { day: "Day 3", demand: 18, stock: 18 },
  { day: "Day 4", demand: 22, stock: 8 },
  { day: "Day 5", demand: 25, stock: 3 },
  { day: "Day 6", demand: 20, stock: 0 },
  { day: "Day 7", demand: 18, stock: 0 },
]

const mockDemandTrends = [
  { product: "iPhone 15 Pro", current: 18, predicted: 25, change: 38.9 },
  { product: "Samsung Galaxy S24", current: 25, predicted: 32, change: 28.0 },
  { product: "MacBook Air M3", current: 8, predicted: 6, change: -25.0 },
  { product: "AirPods Pro", current: 35, predicted: 42, change: 20.0 },
]

export function ForecastPanel({ products, onClose }: ForecastPanelProps) {
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

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-chart-4" />
    if (change < 0) return <TrendingDown className="h-4 w-4 text-chart-5" />
    return <BarChart3 className="h-4 w-4 text-muted-foreground" />
  }

  const criticalProducts = products.filter((p) => p.forecast.stockoutRisk === "critical")
  const highRiskProducts = products.filter((p) => p.forecast.stockoutRisk === "high")

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-chart-3" />
            <span>AI Forecast Insights</span>
          </DialogTitle>
          <DialogDescription>Advanced demand forecasting and inventory optimization recommendations</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-chart-5" />
                    <div>
                      <p className="text-2xl font-bold font-sans">{criticalProducts.length}</p>
                      <p className="text-sm text-muted-foreground">Critical Risk</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-chart-2" />
                    <div>
                      <p className="text-2xl font-bold font-sans">{highRiskProducts.length}</p>
                      <p className="text-sm text-muted-foreground">High Risk</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-chart-4" />
                    <div>
                      <p className="text-2xl font-bold font-sans">
                        {(products.reduce((sum, p) => sum + p.forecast.mape, 0) / products.length).toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground">Avg MAPE</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-chart-1" />
                    <div>
                      <p className="text-2xl font-bold font-sans">
                        {Math.round(
                          products.reduce((sum, p) => sum + p.forecast.daysUntilStockout, 0) / products.length,
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">Avg Days to Stockout</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Forecast Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>7-Day Demand vs Stock Projection</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockForecastData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="demand"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      name="Predicted Demand"
                    />
                    <Line
                      type="monotone"
                      dataKey="stock"
                      stroke="hsl(var(--chart-4))"
                      strokeWidth={2}
                      name="Available Stock"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            {/* Demand Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Demand Trend Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockDemandTrends.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium font-serif">{item.product}</h4>
                        <p className="text-sm text-muted-foreground">
                          Current: {item.current} units/week → Predicted: {item.predicted} units/week
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            {getTrendIcon(item.change)}
                            <span
                              className={`font-medium ${
                                item.change > 0
                                  ? "text-chart-4"
                                  : item.change < 0
                                    ? "text-chart-5"
                                    : "text-muted-foreground"
                              }`}
                            >
                              {item.change > 0 ? "+" : ""}
                              {item.change.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle>Stockout Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {products
                    .filter((p) => p.forecast.stockoutRisk === "critical" || p.forecast.stockoutRisk === "high")
                    .map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 border border-border rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium font-serif">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {product.available} units available • {product.forecast.daysUntilStockout} days until
                            stockout
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getRiskBadge(product.forecast.stockoutRisk)}
                          <Badge variant="outline" className="text-xs">
                            {product.forecast.mape}% MAPE
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            {/* AI Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-chart-3" />
                  <span>AI-Powered Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-chart-5/5 border border-chart-5/20 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-chart-5 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-chart-5">Immediate Action Required</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Samsung Galaxy S24 and Sony WH-1000XM5 will stock out within 2 days. Create emergency purchase
                          orders immediately.
                        </p>
                        <Button size="sm" className="mt-2" variant="destructive">
                          Create Emergency PO
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-chart-2/5 border border-chart-2/20 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Package className="h-5 w-5 text-chart-2 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-chart-2">Reorder Point Optimization</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Based on demand trends, consider increasing reorder points for iPhone 15 Pro (20 → 25) and
                          AirPods Pro (30 → 40).
                        </p>
                        <Button
                          size="sm"
                          className="mt-2 bg-transparent"
                          variant="outline"
                          className="border-chart-2 text-chart-2"
                        >
                          Apply Suggestions
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-chart-4/5 border border-chart-4/20 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <TrendingUp className="h-5 w-5 text-chart-4 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-chart-4">Seasonal Adjustment</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Electronics demand typically increases by 25% in the next month. Consider bulk ordering for
                          high-velocity items.
                        </p>
                        <Button
                          size="sm"
                          className="mt-2 bg-transparent"
                          variant="outline"
                          className="border-chart-4 text-chart-4"
                        >
                          View Seasonal Plan
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
