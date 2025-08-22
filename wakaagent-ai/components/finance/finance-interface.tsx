"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, DollarSign, CreditCard, AlertTriangle, Shield, Search, Download, Eye, Ban } from "lucide-react"

const revenueData = [
  { month: "Jan", revenue: 45000, expenses: 32000, profit: 13000 },
  { month: "Feb", revenue: 52000, expenses: 35000, profit: 17000 },
  { month: "Mar", revenue: 48000, expenses: 33000, profit: 15000 },
  { month: "Apr", revenue: 61000, expenses: 38000, profit: 23000 },
  { month: "May", revenue: 55000, expenses: 36000, profit: 19000 },
  { month: "Jun", revenue: 67000, expenses: 41000, profit: 26000 },
]

const fraudAlerts = [
  { id: 1, type: "High Risk Transaction", amount: "$2,450", customer: "John Smith", riskScore: 85, status: "pending" },
  { id: 2, type: "Unusual Pattern", amount: "$890", customer: "Sarah Johnson", riskScore: 72, status: "investigating" },
  { id: 3, type: "Velocity Check Failed", amount: "$3,200", customer: "Mike Wilson", riskScore: 91, status: "blocked" },
]

const transactions = [
  {
    id: "TXN001",
    customer: "Alice Brown",
    amount: 1250,
    type: "Payment",
    status: "completed",
    riskScore: 15,
    timestamp: "2024-01-15 14:30",
  },
  {
    id: "TXN002",
    customer: "Bob Davis",
    amount: 2450,
    type: "Refund",
    status: "pending",
    riskScore: 85,
    timestamp: "2024-01-15 14:25",
  },
  {
    id: "TXN003",
    customer: "Carol White",
    amount: 890,
    type: "Payment",
    status: "completed",
    riskScore: 25,
    timestamp: "2024-01-15 14:20",
  },
  {
    id: "TXN004",
    customer: "David Lee",
    amount: 3200,
    type: "Payment",
    status: "flagged",
    riskScore: 91,
    timestamp: "2024-01-15 14:15",
  },
]

const paymentMethods = [
  { name: "Credit Card", value: 65, color: "#6366f1" },
  { name: "Bank Transfer", value: 25, color: "#8b5cf6" },
  { name: "Digital Wallet", value: 10, color: "#06b6d4" },
]

function FinanceInterface() {
  const [selectedPeriod, setSelectedPeriod] = useState("30d")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  
  const toCSVWithHeaders = (headers: string[], rows: any[]) => {
    if (!rows || rows.length === 0) return ""
    const escape = (val: any) => {
      const v = val === undefined || val === null ? "" : String(val)
      if (/[",\n]/.test(v)) return '"' + v.replace(/"/g, '""') + '"'
      return v
    }
    const lines = [headers.join(","), ...rows.map((r) => headers.map((h) => escape((r as any)[h])).join(","))]
    return lines.join("\n")
  }

  const download = (filename: string, content: string, type = "text/csv;charset=utf-8;") => {
    // Prepend UTF-8 BOM for Excel compatibility
    const blob = new Blob(['\ufeff' + content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const getRiskBadgeColor = (score: number) => {
    if (score >= 80) return "bg-red-500/10 text-red-600 border-red-200"
    if (score >= 50) return "bg-yellow-500/10 text-yellow-600 border-yellow-200"
    return "bg-green-500/10 text-green-600 border-green-200"
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-600 border-green-200"
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-200"
      case "flagged":
        return "bg-red-500/10 text-red-600 border-red-200"
      case "blocked":
        return "bg-red-500/10 text-red-600 border-red-200"
      case "investigating":
        return "bg-blue-500/10 text-blue-600 border-blue-200"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-200"
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance & Fraud Detection</h1>
          <p className="text-gray-600">Monitor financial performance and detect fraudulent activities</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const filtered = transactions
                .filter((t) =>
                  (filterStatus === "all" || t.status === filterStatus) &&
                  (searchTerm.trim() === "" ||
                    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    t.customer.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                .map((t) => ({
                  id: t.id,
                  date_iso: t.timestamp, // already in ISO-like string
                  amount_ngn: t.amount,
                  category: t.type,
                  memo: "",
                  counterparty: t.customer,
                  tax: "",
                  status: t.status,
                }))
              const headers = [
                "id",
                "date_iso",
                "amount_ngn",
                "category",
                "memo",
                "counterparty",
                "tax",
                "status",
              ]
              const csv = toCSVWithHeaders(headers, filtered)
              download(`transactions_${selectedPeriod}.csv`, csv)
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Fraud Alerts */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          Critical Fraud Alerts
        </h2>
        {fraudAlerts.map((alert) => (
          <Alert key={alert.id} className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="flex items-center justify-between">
              <div>
                <span className="font-medium">{alert.type}</span> - {alert.customer} ({alert.amount})
                <Badge className={`ml-2 ${getRiskBadgeColor(alert.riskScore)}`}>Risk: {alert.riskScore}%</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusBadgeColor(alert.status)}>{alert.status}</Badge>
                <Button size="sm" variant="outline">
                  <Eye className="w-4 h-4 mr-1" />
                  Review
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ))}
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$328,000</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12.5% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$113,000</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              +8.2% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fraud Detection Rate</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.2%</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              +0.3% accuracy improvement
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Transactions</CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <div className="flex items-center text-xs text-red-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              +15 from yesterday
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
          <TabsTrigger value="fraud">Fraud Analytics</TabsTrigger>
          <TabsTrigger value="payments">Payment Methods</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stackId="1"
                      stroke="#6366f1"
                      fill="#6366f1"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stackId="2"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profit Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fraud" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fraud Detection Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">23</div>
                  <div className="text-sm text-red-600">High Risk Transactions</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">156</div>
                  <div className="text-sm text-yellow-600">Medium Risk Transactions</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">2,847</div>
                  <div className="text-sm text-green-600">Low Risk Transactions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentMethods}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {paymentMethods.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transaction Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Real-time Transaction Monitoring
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Transaction ID</th>
                  <th className="text-left py-3 px-4 font-medium">Customer</th>
                  <th className="text-left py-3 px-4 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 font-medium">Type</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Risk Score</th>
                  <th className="text-left py-3 px-4 font-medium">Timestamp</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">{transaction.id}</td>
                    <td className="py-3 px-4">{transaction.customer}</td>
                    <td className="py-3 px-4 font-semibold">${transaction.amount.toLocaleString()}</td>
                    <td className="py-3 px-4">{transaction.type}</td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusBadgeColor(transaction.status)}>{transaction.status}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getRiskBadgeColor(transaction.riskScore)}>{transaction.riskScore}%</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{transaction.timestamp}</td>
                    <td className="py-3 px-4">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { FinanceInterface }
export default FinanceInterface
