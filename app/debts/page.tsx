"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Plus, Search, Filter, DollarSign, AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { getDebts, createDebt, updateDebt, addPayment, getDebtSummary, getAgingReport } from "@/lib/api"

interface Debt {
  id: number
  type: string
  entity_type: string
  entity_id?: number
  amount_ngn: number
  currency: string
  description?: string
  due_date?: string
  status: string
  priority: string
  created_at: string
  updated_at: string
}

interface DebtSummary {
  receivables_total: number
  payables_total: number
  receivables_count: number
  payables_count: number
  overdue_receivables: number
  overdue_payables: number
}

interface AgingReport {
  range_0_30: number
  range_31_60: number
  range_61_90: number
  range_90_plus: number
  total_overdue_amount: number
  total_debts: number
  total_amount: number
}

export default function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [summary, setSummary] = useState<DebtSummary | null>(null)
  const [agingReport, setAgingReport] = useState<AgingReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [debtsData, summaryData, agingData] = await Promise.all([
        getDebts({ type_filter: typeFilter, status_filter: statusFilter }),
        getDebtSummary(),
        getAgingReport()
      ])
      setDebts(debtsData)
      setSummary(summaryData)
      setAgingReport(agingData)
    } catch (error) {
      console.error("Failed to load debts data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'partial': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />
      case 'overdue': return <AlertTriangle className="w-4 h-4" />
      case 'partial': return <Clock className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      default: return <XCircle className="w-4 h-4" />
    }
  }

  const filteredDebts = debts.filter(debt =>
    debt.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    debt.entity_type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="p-6">Loading debts...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Debt Management</h1>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Debt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Debt</DialogTitle>
            </DialogHeader>
            <DebtForm onSuccess={() => {
              setShowCreateDialog(false)
              loadData()
            }} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Receivables</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{summary.receivables_total.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{summary.receivables_count} debts</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payables</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{summary.payables_total.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{summary.payables_count} debts</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Receivables</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{summary.overdue_receivables}</div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Payables</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{summary.overdue_payables}</div>
              <p className="text-xs text-muted-foreground">Payment due</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Aging Report */}
      {agingReport && (
        <Card>
          <CardHeader>
            <CardTitle>Debt Aging Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{agingReport.range_0_30}</div>
                <p className="text-sm text-muted-foreground">0-30 days</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{agingReport.range_31_60}</div>
                <p className="text-sm text-muted-foreground">31-60 days</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{agingReport.range_61_90}</div>
                <p className="text-sm text-muted-foreground">61-90 days</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{agingReport.range_90_plus}</div>
                <p className="text-sm text-muted-foreground">90+ days</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-800">₦{agingReport.total_overdue_amount.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Total overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search debts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="receivable">Receivable</SelectItem>
                <SelectItem value="payable">Payable</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadData} variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Debts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Debts ({filteredDebts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDebts.map((debt) => (
                <TableRow key={debt.id}>
                  <TableCell>
                    <Badge variant={debt.type === 'receivable' ? 'default' : 'secondary'}>
                      {debt.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{debt.entity_type}{debt.entity_id ? ` (${debt.entity_id})` : ''}</TableCell>
                  <TableCell>₦{debt.amount_ngn.toLocaleString()}</TableCell>
                  <TableCell>{debt.due_date ? format(new Date(debt.due_date), 'MMM dd, yyyy') : 'N/A'}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(debt.status)}>
                      {getStatusIcon(debt.status)}
                      <span className="ml-1">{debt.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      debt.priority === 'high' ? 'destructive' :
                      debt.priority === 'medium' ? 'default' : 'secondary'
                    }>
                      {debt.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedDebt(debt)
                          setShowPaymentDialog(true)
                        }}
                      >
                        Add Payment
                      </Button>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Payment</DialogTitle>
          </DialogHeader>
          {selectedDebt && (
            <PaymentForm
              debt={selectedDebt}
              onSuccess={() => {
                setShowPaymentDialog(false)
                setSelectedDebt(null)
                loadData()
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DebtForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    type: '',
    entity_type: '',
    entity_id: '',
    amount_ngn: '',
    description: '',
    due_date: undefined as Date | undefined,
    priority: 'medium'
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await createDebt({
        ...formData,
        entity_id: formData.entity_id ? parseInt(formData.entity_id) : undefined,
        amount_ngn: parseFloat(formData.amount_ngn),
        due_date: formData.due_date?.toISOString().split('T')[0]
      })
      onSuccess()
    } catch (error) {
      console.error("Failed to create debt:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="type">Type</Label>
        <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="receivable">Receivable</SelectItem>
            <SelectItem value="payable">Payable</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="entity_type">Entity Type</Label>
        <Select value={formData.entity_type} onValueChange={(value) => setFormData({...formData, entity_type: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Select entity type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="supplier">Supplier</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="entity_id">Entity ID (optional)</Label>
        <Input
          id="entity_id"
          type="number"
          value={formData.entity_id}
          onChange={(e) => setFormData({...formData, entity_id: e.target.value})}
        />
      </div>

      <div>
        <Label htmlFor="amount">Amount (NGN)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={formData.amount_ngn}
          onChange={(e) => setFormData({...formData, amount_ngn: e.target.value})}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        />
      </div>

      <div>
        <Label>Due Date (optional)</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.due_date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.due_date ? format(formData.due_date, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={formData.due_date}
              onSelect={(date) => setFormData({...formData, due_date: date})}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Label htmlFor="priority">Priority</Label>
        <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating..." : "Create Debt"}
      </Button>
    </form>
  )
}

function PaymentForm({ debt, onSuccess }: { debt: Debt; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    amount_ngn: '',
    payment_date: new Date(),
    payment_method: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await addPayment(debt.id, {
        ...formData,
        amount_ngn: parseFloat(formData.amount_ngn),
        payment_date: formData.payment_date.toISOString().split('T')[0]
      })
      onSuccess()
    } catch (error) {
      console.error("Failed to add payment:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Debt: {debt.description || `Debt #${debt.id}`}</Label>
        <p className="text-sm text-muted-foreground">
          Amount: ₦{debt.amount_ngn.toLocaleString()} | Status: {debt.status}
        </p>
      </div>

      <div>
        <Label htmlFor="amount">Payment Amount (NGN)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={formData.amount_ngn}
          onChange={(e) => setFormData({...formData, amount_ngn: e.target.value})}
          required
        />
      </div>

      <div>
        <Label>Payment Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(formData.payment_date, "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={formData.payment_date}
              onSelect={(date) => date && setFormData({...formData, payment_date: date})}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Label htmlFor="method">Payment Method</Label>
        <Select value={formData.payment_method} onValueChange={(value) => setFormData({...formData, payment_method: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Select method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="check">Check</SelectItem>
            <SelectItem value="card">Card</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Adding Payment..." : "Add Payment"}
      </Button>
    </form>
  )
}
