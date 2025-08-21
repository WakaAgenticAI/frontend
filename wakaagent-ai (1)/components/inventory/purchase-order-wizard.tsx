"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Package, Calendar, DollarSign } from "lucide-react"

interface Product {
  id: string
  name: string
  sku: string
  reorderQuantity: number
  unitCost: number
  supplier: string
  forecast: {
    demand30Days: number
    daysUntilStockout: number
  }
}

interface PurchaseOrderWizardProps {
  product: Product
  onClose: () => void
  onPOCreated: () => void
}

export function PurchaseOrderWizard({ product, onClose, onPOCreated }: PurchaseOrderWizardProps) {
  const [quantity, setQuantity] = useState(product.reorderQuantity)
  const [urgency, setUrgency] = useState<"standard" | "expedited" | "emergency">("standard")
  const [notes, setNotes] = useState("")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getTotalCost = () => quantity * product.unitCost

  const getDeliveryTime = () => {
    switch (urgency) {
      case "emergency":
        return "1-2 days"
      case "expedited":
        return "3-5 days"
      default:
        return "7-14 days"
    }
  }

  const getUrgencyMultiplier = () => {
    switch (urgency) {
      case "emergency":
        return 1.5
      case "expedited":
        return 1.2
      default:
        return 1.0
    }
  }

  const handleCreatePO = () => {
    // Here you would integrate with actual PO creation system
    console.log("Creating PO:", {
      product: product.id,
      quantity,
      urgency,
      totalCost: getTotalCost() * getUrgencyMultiplier(),
      notes,
    })
    onPOCreated()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Create Purchase Order</span>
          </DialogTitle>
          <DialogDescription>Generate a purchase order for {product.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Product Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Product</p>
                  <p className="font-medium font-serif">{product.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">SKU</p>
                  <p className="font-medium font-mono">{product.sku}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Supplier</p>
                  <p className="font-medium">{product.supplier}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Unit Cost</p>
                  <p className="font-medium">{formatCurrency(product.unitCost)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="quantity">Quantity to Order</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 0)}
                  min="1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Recommended: {product.reorderQuantity} units (based on 30-day demand: {product.forecast.demand30Days})
                </p>
              </div>

              <div>
                <Label>Urgency Level</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <Button
                    variant={urgency === "standard" ? "default" : "outline"}
                    onClick={() => setUrgency("standard")}
                    className="text-sm"
                  >
                    Standard
                    <br />
                    <span className="text-xs opacity-70">7-14 days</span>
                  </Button>
                  <Button
                    variant={urgency === "expedited" ? "default" : "outline"}
                    onClick={() => setUrgency("expedited")}
                    className="text-sm"
                  >
                    Expedited
                    <br />
                    <span className="text-xs opacity-70">3-5 days (+20%)</span>
                  </Button>
                  <Button
                    variant={urgency === "emergency" ? "default" : "outline"}
                    onClick={() => setUrgency("emergency")}
                    className="text-sm"
                  >
                    Emergency
                    <br />
                    <span className="text-xs opacity-70">1-2 days (+50%)</span>
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  placeholder="Special instructions or requirements..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Order Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Quantity</span>
                <span className="font-medium">{quantity} units</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Unit Cost</span>
                <span className="font-medium">{formatCurrency(product.unitCost)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(getTotalCost())}</span>
              </div>
              {urgency !== "standard" && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {urgency === "emergency" ? "Emergency" : "Expedited"} Fee
                  </span>
                  <span className="font-medium text-chart-2">
                    {formatCurrency(getTotalCost() * (getUrgencyMultiplier() - 1))}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(getTotalCost() * getUrgencyMultiplier())}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Expected Delivery</span>
                <span>{getDeliveryTime()}</span>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="border-chart-3/20 bg-chart-3/5">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-chart-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-chart-3">AI Recommendation</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on current stock levels ({product.forecast.daysUntilStockout} days until stockout) and demand
                    trends, this order quantity will provide approximately{" "}
                    {Math.round((quantity / product.forecast.demand30Days) * 30)} days of inventory coverage.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreatePO} disabled={quantity <= 0}>
            Create Purchase Order
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
