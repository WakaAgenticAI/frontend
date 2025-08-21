"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, Plus, Minus, ShoppingCart, User, Package, CreditCard } from "lucide-react"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
}

interface Product {
  id: string
  name: string
  price: number
  stock: number
  sku: string
}

interface OrderItem {
  product: Product
  quantity: number
}

interface OrderWizardProps {
  onClose: () => void
  onOrderCreated: (order: any) => void
}

const mockCustomers: Customer[] = [
  { id: "CU-001", name: "Adebayo Johnson", email: "adebayo@email.com", phone: "+234 801 234 5678" },
  { id: "CU-002", name: "Fatima Abdullahi", email: "fatima@email.com", phone: "+234 802 345 6789" },
  { id: "CU-003", name: "Chinedu Okafor", email: "chinedu@email.com", phone: "+234 803 456 7890" },
]

const mockProducts: Product[] = [
  { id: "P-001", name: "iPhone 15 Pro", price: 450000, stock: 45, sku: "IPH-15-PRO" },
  { id: "P-002", name: "Samsung Galaxy S24", price: 380000, stock: 8, sku: "SAM-S24" },
  { id: "P-003", name: "MacBook Air M3", price: 650000, stock: 23, sku: "MBA-M3" },
  { id: "P-004", name: "AirPods Pro", price: 89000, stock: 67, sku: "APP-PRO" },
]

export function OrderWizard({ onClose, onOrderCreated }: OrderWizardProps) {
  const [step, setStep] = useState(1)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [customerSearch, setCustomerSearch] = useState("")
  const [productSearch, setProductSearch] = useState("")

  const filteredCustomers = mockCustomers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      customer.email.toLowerCase().includes(customerSearch.toLowerCase()),
  )

  const filteredProducts = mockProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      product.sku.toLowerCase().includes(productSearch.toLowerCase()),
  )

  const addProduct = (product: Product) => {
    const existingItem = orderItems.find((item) => item.product.id === product.id)
    if (existingItem) {
      setOrderItems((prev) =>
        prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item,
        ),
      )
    } else {
      setOrderItems((prev) => [...prev, { product, quantity: 1 }])
    }
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setOrderItems((prev) => prev.filter((item) => item.product.id !== productId))
    } else {
      setOrderItems((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, quantity: Math.min(quantity, item.product.stock) } : item,
        ),
      )
    }
  }

  const getTotalAmount = () => {
    return orderItems.reduce((total, item) => total + item.product.price * item.quantity, 0)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleCreateOrder = () => {
    const newOrder = {
      id: `ORD-${Math.floor(Math.random() * 10000) + 12848}`,
      customer: selectedCustomer!,
      status: "pending" as const,
      total: getTotalAmount(),
      items: orderItems.length,
      channel: "online" as const,
      date: new Date(),
      paymentStatus: "pending" as const,
    }
    onOrderCreated(newOrder)
  }

  const canProceedToStep2 = selectedCustomer !== null
  const canProceedToStep3 = orderItems.length > 0
  const canCreateOrder = selectedCustomer && orderItems.length > 0

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Create New Order</span>
          </DialogTitle>
          <DialogDescription>Follow the steps to create a new order for your customer</DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center space-x-4 mb-6">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {stepNumber === 1 && <User className="h-4 w-4" />}
                {stepNumber === 2 && <Package className="h-4 w-4" />}
                {stepNumber === 3 && <CreditCard className="h-4 w-4" />}
              </div>
              <span className={`text-sm ${step >= stepNumber ? "text-foreground" : "text-muted-foreground"}`}>
                {stepNumber === 1 && "Customer"}
                {stepNumber === 2 && "Products"}
                {stepNumber === 3 && "Summary"}
              </span>
              {stepNumber < 3 && <div className="w-8 h-px bg-border" />}
            </div>
          ))}
        </div>

        {/* Step 1: Customer Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="customer-search">Search Customer</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="customer-search"
                  placeholder="Search by name or email..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
              {filteredCustomers.map((customer) => (
                <Card
                  key={customer.id}
                  className={`cursor-pointer transition-colors ${
                    selectedCustomer?.id === customer.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium font-serif">{customer.name}</h4>
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                        <p className="text-sm text-muted-foreground">{customer.phone}</p>
                      </div>
                      {selectedCustomer?.id === customer.id && <Badge variant="default">Selected</Badge>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Product Selection */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="product-search">Search Products</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="product-search"
                  placeholder="Search by name or SKU..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Available Products */}
              <div>
                <h3 className="font-medium mb-3">Available Products</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium font-serif">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="font-medium">{formatCurrency(product.price)}</span>
                            <Badge
                              variant={product.stock > 10 ? "secondary" : product.stock > 0 ? "outline" : "destructive"}
                            >
                              {product.stock} in stock
                            </Badge>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => addProduct(product)} disabled={product.stock === 0}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Selected Items */}
              <div>
                <h3 className="font-medium mb-3">Order Items ({orderItems.length})</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {orderItems.map((item) => (
                    <Card key={item.product.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium font-serif">{item.product.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(item.product.price)} × {item.quantity} ={" "}
                            {formatCurrency(item.product.price * item.quantity)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {orderItems.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">No items selected yet</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Order Summary */}
        {step === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Customer Info */}
                <div>
                  <h4 className="font-medium mb-2">Customer</h4>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="font-medium font-serif">{selectedCustomer?.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedCustomer?.email}</p>
                    <p className="text-sm text-muted-foreground">{selectedCustomer?.phone}</p>
                  </div>
                </div>

                <Separator />

                {/* Order Items */}
                <div>
                  <h4 className="font-medium mb-2">Items ({orderItems.length})</h4>
                  <div className="space-y-2">
                    {orderItems.map((item) => (
                      <div key={item.product.id} className="flex justify-between items-center py-2">
                        <div>
                          <p className="font-medium font-serif">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(item.product.price)} × {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">{formatCurrency(item.product.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(getTotalAmount())}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Previous
              </Button>
            )}
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {step < 3 ? (
              <Button onClick={() => setStep(step + 1)} disabled={step === 1 ? !canProceedToStep2 : !canProceedToStep3}>
                Next
              </Button>
            ) : (
              <Button onClick={handleCreateOrder} disabled={!canCreateOrder}>
                Create Order
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
