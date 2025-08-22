"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import {
  Search,
  Plus,
  MoreHorizontal,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Brain,
  ShoppingCart,
  Eye,
  BarChart3,
  Zap,
  Printer,
} from "lucide-react"
import { ForecastPanel } from "./forecast-panel"
import { ProductDetail } from "./product-detail"
import { PurchaseOrderWizard } from "./purchase-order-wizard"

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

const mockProducts: Product[] = [
  {
    id: "P-001",
    name: "iPhone 15 Pro",
    sku: "IPH-15-PRO",
    category: "Electronics",
    onHand: 45,
    reserved: 12,
    available: 33,
    reorderPoint: 20,
    reorderQuantity: 50,
    unitCost: 380000,
    sellingPrice: 450000,
    supplier: "Apple Distribution",
    lastRestocked: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    forecast: {
      demand7Days: 18,
      demand30Days: 72,
      stockoutRisk: "medium",
      daysUntilStockout: 12,
      mape: 8.5,
      trend: "up",
    },
  },
  {
    id: "P-002",
    name: "Samsung Galaxy S24",
    sku: "SAM-S24",
    category: "Electronics",
    onHand: 8,
    reserved: 3,
    available: 5,
    reorderPoint: 15,
    reorderQuantity: 40,
    unitCost: 320000,
    sellingPrice: 380000,
    supplier: "Samsung Nigeria",
    lastRestocked: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    forecast: {
      demand7Days: 25,
      demand30Days: 95,
      stockoutRisk: "critical",
      daysUntilStockout: 2,
      mape: 12.3,
      trend: "up",
    },
  },
  {
    id: "P-003",
    name: "MacBook Air M3",
    sku: "MBA-M3",
    category: "Electronics",
    onHand: 23,
    reserved: 5,
    available: 18,
    reorderPoint: 10,
    reorderQuantity: 25,
    unitCost: 550000,
    sellingPrice: 650000,
    supplier: "Apple Distribution",
    lastRestocked: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    forecast: {
      demand7Days: 8,
      demand30Days: 28,
      stockoutRisk: "low",
      daysUntilStockout: 18,
      mape: 6.2,
      trend: "stable",
    },
  },
  {
    id: "P-004",
    name: "AirPods Pro",
    sku: "APP-PRO",
    category: "Electronics",
    onHand: 67,
    reserved: 22,
    available: 45,
    reorderPoint: 30,
    reorderQuantity: 100,
    unitCost: 75000,
    sellingPrice: 89000,
    supplier: "Apple Distribution",
    lastRestocked: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    forecast: {
      demand7Days: 35,
      demand30Days: 140,
      stockoutRisk: "low",
      daysUntilStockout: 45,
      mape: 4.8,
      trend: "up",
    },
  },
  {
    id: "P-005",
    name: "Sony WH-1000XM5",
    sku: "SONY-WH5",
    category: "Electronics",
    onHand: 2,
    reserved: 1,
    available: 1,
    reorderPoint: 8,
    reorderQuantity: 20,
    unitCost: 120000,
    sellingPrice: 145000,
    supplier: "Sony Nigeria",
    lastRestocked: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    forecast: {
      demand7Days: 12,
      demand30Days: 48,
      stockoutRisk: "critical",
      daysUntilStockout: 1,
      mape: 15.7,
      trend: "up",
    },
  },
]

export function InventoryInterface() {
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showForecastPanel, setShowForecastPanel] = useState(false)
  const [showPOWizard, setShowPOWizard] = useState(false)
  const [selectedProductForPO, setSelectedProductForPO] = useState<Product | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [stockFilter, setStockFilter] = useState<string>("all")
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    category: "Electronics",
    onHand: 0,
    unitCost: 0,
    sellingPrice: 0,
    supplier: "",
    reorderPoint: 5,
    reorderQuantity: 10,
  })
  const { toast } = useToast()

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
        return <TrendingUp className="h-3 w-3 text-chart-4" />
      case "down":
        return <TrendingDown className="h-3 w-3 text-chart-5" />
      default:
        return <BarChart3 className="h-3 w-3 text-muted-foreground" />
    }
  }

  const getStockStatus = (product: Product) => {
    if (product.available <= 0) return { status: "out_of_stock", color: "text-destructive" }
    if (product.available <= product.reorderPoint) return { status: "low_stock", color: "text-chart-5" }
    if (product.available <= product.reorderPoint * 1.5) return { status: "medium_stock", color: "text-chart-2" }
    return { status: "in_stock", color: "text-chart-4" }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter

    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "low" && product.available <= product.reorderPoint) ||
      (stockFilter === "out" && product.available <= 0) ||
      (stockFilter === "in" && product.available > product.reorderPoint)

    return matchesSearch && matchesCategory && matchesStock
  })

  const criticalProducts = products.filter((p) => p.forecast.stockoutRisk === "critical" || p.available <= 0)
  const lowStockProducts = products.filter((p) => p.available <= p.reorderPoint && p.available > 0)

  const handleCreatePO = (product: Product) => {
    setSelectedProductForPO(product)
    setShowPOWizard(true)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-sans text-foreground">Inventory & AI Forecasting</h1>
          <p className="text-muted-foreground font-serif">Manage stock levels with AI-powered demand predictions</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={() => setShowForecastPanel(true)}>
            <Brain className="h-4 w-4 mr-2" />
            AI Insights
          </Button>
          <Button className="flex items-center space-x-2" onClick={() => setShowAddProduct(true)}>
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {(criticalProducts.length > 0 || lowStockProducts.length > 0) && (
        <div className="space-y-3">
          {criticalProducts.length > 0 && (
            <Alert className="border-destructive bg-destructive/5">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription className="flex items-center justify-between">
                <span>
                  <strong>{criticalProducts.length} products</strong> are critically low or out of stock and need
                  immediate attention.
                </span>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setStockFilter("out")
                    if (typeof window !== "undefined") {
                      const el = document.getElementById("inventory-table")
                      el?.scrollIntoView({ behavior: "smooth", block: "start" })
                    }
                  }}
                >
                  View Critical Items
                </Button>
              </AlertDescription>
            </Alert>
          )}
          {lowStockProducts.length > 0 && (
            <Alert className="border-chart-2 bg-chart-2/5">
              <Package className="h-4 w-4 text-chart-2" />
              <AlertDescription className="flex items-center justify-between">
                <span>
                  <strong>{lowStockProducts.length} products</strong> are below reorder point and should be restocked
                  soon.
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-chart-2 text-chart-2 bg-transparent"
                  onClick={() => {
                    if (lowStockProducts.length > 0) {
                      handleCreatePO(lowStockProducts[0])
                      toast({ title: "Bulk PO", description: "Opening PO for first low-stock item." })
                    } else {
                      toast({ title: "No low-stock items", description: "Nothing to include in PO.", variant: "destructive" })
                    }
                  }}
                >
                  Create Bulk PO
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-chart-1" />
              <div>
                <p className="text-2xl font-bold font-sans">{products.length}</p>
                <p className="text-sm text-muted-foreground">Total Products</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-chart-5" />
              <div>
                <p className="text-2xl font-bold font-sans">{criticalProducts.length}</p>
                <p className="text-sm text-muted-foreground">Critical Stock</p>
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
                  {formatCurrency(products.reduce((sum, p) => sum + p.onHand * p.unitCost, 0))}
                </p>
                <p className="text-sm text-muted-foreground">Inventory Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-chart-3" />
              <div>
                <p className="text-2xl font-bold font-sans">
                  {(products.reduce((sum, p) => sum + p.forecast.mape, 0) / products.length).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">Avg Forecast Accuracy</p>
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
                placeholder="Search products, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Clothing">Clothing</SelectItem>
                <SelectItem value="Home">Home & Garden</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="in">In Stock</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="out">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div id="inventory-table" className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>On Hand</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Reorder Point</TableHead>
                  <TableHead>7-Day Forecast</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Stockout</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product)
                  return (
                    <TableRow key={product.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <p className="font-medium font-serif">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{product.sku}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className={stockStatus.color}>{product.onHand}</span>
                          {product.reserved > 0 && (
                            <Badge variant="outline" className="text-xs">
                              -{product.reserved} reserved
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${stockStatus.color}`}>{product.available}</span>
                      </TableCell>
                      <TableCell>{product.reorderPoint}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{product.forecast.demand7Days}</span>
                          {getTrendIcon(product.forecast.trend)}
                          <Badge variant="outline" className="text-xs">
                            {product.forecast.mape}% MAPE
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{getRiskBadge(product.forecast.stockoutRisk)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className={product.forecast.daysUntilStockout <= 7 ? "text-chart-5" : ""}>
                            {product.forecast.daysUntilStockout} days
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedProduct(product)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCreatePO(product)}>
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Create PO
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Zap className="h-4 w-4 mr-2" />
                              Adjust Reorder Point
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {showForecastPanel && <ForecastPanel products={products} onClose={() => setShowForecastPanel(false)} />}
      {selectedProduct && <ProductDetail product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
      {showPOWizard && selectedProductForPO && (
        <PurchaseOrderWizard
          product={selectedProductForPO}
          onClose={() => {
            setShowPOWizard(false)
            setSelectedProductForPO(null)
          }}
          onPOCreated={() => {
            setShowPOWizard(false)
            setSelectedProductForPO(null)
          }}
        />
      )}

      {/* Add Product Modal */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Product</DialogTitle>
            <DialogDescription>Create a new product</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Product name"
              value={newProduct.name}
              onChange={(e) => setNewProduct((s) => ({ ...s, name: e.target.value }))}
            />
            <Input
              placeholder="SKU"
              value={newProduct.sku}
              onChange={(e) => setNewProduct((s) => ({ ...s, sku: e.target.value }))}
            />
            <div className="flex gap-3">
              <Select
                value={newProduct.category}
                onValueChange={(v) => setNewProduct((s) => ({ ...s, category: v }))}
              >
                <SelectTrigger className="w-1/2">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Clothing">Clothing</SelectItem>
                  <SelectItem value="Home">Home & Garden</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Supplier"
                value={newProduct.supplier}
                onChange={(e) => setNewProduct((s) => ({ ...s, supplier: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                placeholder="On Hand"
                value={newProduct.onHand}
                onChange={(e) => setNewProduct((s) => ({ ...s, onHand: Number(e.target.value || 0) }))}
              />
              <Input
                type="number"
                placeholder="Reorder Point"
                value={newProduct.reorderPoint}
                onChange={(e) => setNewProduct((s) => ({ ...s, reorderPoint: Number(e.target.value || 0) }))}
              />
              <Input
                type="number"
                placeholder="Reorder Qty"
                value={newProduct.reorderQuantity}
                onChange={(e) => setNewProduct((s) => ({ ...s, reorderQuantity: Number(e.target.value || 0) }))}
              />
              <Input
                type="number"
                placeholder="Unit Cost"
                value={newProduct.unitCost}
                onChange={(e) => setNewProduct((s) => ({ ...s, unitCost: Number(e.target.value || 0) }))}
              />
              <Input
                type="number"
                placeholder="Selling Price"
                value={newProduct.sellingPrice}
                onChange={(e) => setNewProduct((s) => ({ ...s, sellingPrice: Number(e.target.value || 0) }))}
              />
            </div>
            <Button
              className="w-full"
              disabled={!newProduct.name || !newProduct.sku}
              onClick={() => {
                const now = new Date()
                const created: Product = {
                  id: `P-${String(products.length + 1).padStart(3, "0")}`,
                  name: newProduct.name,
                  sku: newProduct.sku,
                  category: newProduct.category,
                  onHand: newProduct.onHand,
                  reserved: 0,
                  available: newProduct.onHand,
                  reorderPoint: newProduct.reorderPoint,
                  reorderQuantity: newProduct.reorderQuantity,
                  unitCost: newProduct.unitCost,
                  sellingPrice: newProduct.sellingPrice,
                  supplier: newProduct.supplier,
                  lastRestocked: now,
                  forecast: {
                    demand7Days: 0,
                    demand30Days: 0,
                    stockoutRisk: "low",
                    daysUntilStockout: 999,
                    mape: 0,
                    trend: "stable",
                  },
                }
                setProducts((prev) => [created, ...prev])
                setShowAddProduct(false)
                setNewProduct({
                  name: "",
                  sku: "",
                  category: "Electronics",
                  onHand: 0,
                  unitCost: 0,
                  sellingPrice: 0,
                  supplier: "",
                  reorderPoint: 5,
                  reorderQuantity: 10,
                })
                toast({ title: "Product added", description: `${created.name} created locally.` })
                // Best-effort backend persistence (will be ignored if unauthorized or API base not set)
                try {
                  const apiBase = process.env.NEXT_PUBLIC_API_BASE
                  if (apiBase) {
                    const bearer =
                      (typeof window !== "undefined" && window.localStorage.getItem("access_token")) ||
                      process.env.NEXT_PUBLIC_DEMO_BEARER ||
                      ""
                    const headers: Record<string, string> = { "Content-Type": "application/json" }
                    if (bearer) headers["Authorization"] = `Bearer ${bearer}`
                    fetch(`${apiBase}/products`, {
                      method: "POST",
                      headers,
                      body: JSON.stringify({
                        sku: created.sku,
                        name: created.name,
                        unit: "unit",
                        price_ngn: created.sellingPrice,
                        tax_rate: 0,
                      }),
                    }).catch(() => {})
                  }
                } catch (_) {}
              }}
            >
              Save Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
