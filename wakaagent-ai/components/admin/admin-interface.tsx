"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Settings,
  Users,
  Shield,
  Activity,
  Database,
  Key,
  Globe,
  Search,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Download,
} from "lucide-react"

const users = [
  {
    id: 1,
    name: "John Smith",
    email: "john@wakaagent.com",
    role: "Admin",
    status: "active",
    lastLogin: "2024-01-15 14:30",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 2,
    name: "Sarah Davis",
    email: "sarah@wakaagent.com",
    role: "Manager",
    status: "active",
    lastLogin: "2024-01-15 13:45",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@wakaagent.com",
    role: "Agent",
    status: "inactive",
    lastLogin: "2024-01-14 16:20",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 4,
    name: "Lisa Wilson",
    email: "lisa@wakaagent.com",
    role: "Agent",
    status: "active",
    lastLogin: "2024-01-15 12:15",
    avatar: "/placeholder.svg?height=32&width=32",
  },
]

const auditLogs = [
  {
    id: 1,
    user: "John Smith",
    action: "User Created",
    resource: "User: mike@wakaagent.com",
    timestamp: "2024-01-15 14:30",
    ip: "192.168.1.100",
  },
  {
    id: 2,
    user: "Sarah Davis",
    action: "Role Updated",
    resource: "User: lisa@wakaagent.com",
    timestamp: "2024-01-15 13:45",
    ip: "192.168.1.101",
  },
  {
    id: 3,
    user: "System",
    action: "Backup Created",
    resource: "Database Backup",
    timestamp: "2024-01-15 12:00",
    ip: "System",
  },
]

const systemSettings = [
  { key: "maintenance_mode", label: "Maintenance Mode", value: false, type: "boolean" },
  { key: "user_registration", label: "Allow User Registration", value: true, type: "boolean" },
  { key: "email_notifications", label: "Email Notifications", value: true, type: "boolean" },
  { key: "session_timeout", label: "Session Timeout (minutes)", value: "30", type: "number" },
  { key: "max_file_size", label: "Max File Size (MB)", value: "10", type: "number" },
]

export default function AdminInterface() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-red-500/10 text-red-600 border-red-200"
      case "manager":
        return "bg-blue-500/10 text-blue-600 border-blue-200"
      case "agent":
        return "bg-green-500/10 text-green-600 border-green-200"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-200"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-600 border-green-200"
      case "inactive":
        return "bg-gray-500/10 text-gray-600 border-gray-200"
      case "suspended":
        return "bg-red-500/10 text-red-600 border-red-200"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-200"
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, roles, and system settings</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>Create a new user account with appropriate permissions</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Full name" />
                <Input placeholder="Email address" type="email" />
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Temporary password" type="password" />
                <Button className="w-full">Create User</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <div className="flex items-center text-xs text-green-600">+12 this month</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <div className="flex items-center text-xs text-blue-600">Current active users</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <div className="flex items-center text-xs text-green-600">All systems operational</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <div className="flex items-center text-xs text-yellow-600">Requires attention</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* User Filters */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">User</th>
                      <th className="text-left py-3 px-4 font-medium">Email</th>
                      <th className="text-left py-3 px-4 font-medium">Role</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Last Login</th>
                      <th className="text-left py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={user.avatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4">
                          <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusBadgeColor(user.status)}>{user.status}</Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{user.lastLogin}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-500" />
                  Admin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>User Management</span>
                    <Badge variant="secondary">Full Access</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>System Settings</span>
                    <Badge variant="secondary">Full Access</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Financial Data</span>
                    <Badge variant="secondary">Full Access</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Audit Logs</span>
                    <Badge variant="secondary">Full Access</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Manager
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>User Management</span>
                    <Badge variant="outline">Limited</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Reports</span>
                    <Badge variant="secondary">Full Access</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Customer Data</span>
                    <Badge variant="secondary">Full Access</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Support Tickets</span>
                    <Badge variant="secondary">Full Access</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-green-500" />
                  Agent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Customer Support</span>
                    <Badge variant="secondary">Full Access</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Order Management</span>
                    <Badge variant="outline">Read Only</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Chat System</span>
                    <Badge variant="secondary">Full Access</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Reports</span>
                    <Badge variant="outline">Limited</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {systemSettings.map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{setting.label}</span>
                    {setting.type === "boolean" ? (
                      <Switch checked={setting.value as boolean} />
                    ) : (
                      <Input type={setting.type} value={setting.value as string} className="w-20 text-right" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Localization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Default Language</span>
                  <Select defaultValue="en">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="pidgin">Naija Pidgin</SelectItem>
                      <SelectItem value="ha">Hausa</SelectItem>
                      <SelectItem value="yo">Yoruba</SelectItem>
                      <SelectItem value="ig">Igbo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Timezone</span>
                  <Select defaultValue="utc">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc">UTC</SelectItem>
                      <SelectItem value="wat">WAT</SelectItem>
                      <SelectItem value="est">EST</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Currency</span>
                  <Select defaultValue="usd">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD</SelectItem>
                      <SelectItem value="ngn">NGN</SelectItem>
                      <SelectItem value="eur">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                System Audit Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">User</th>
                      <th className="text-left py-3 px-4 font-medium">Action</th>
                      <th className="text-left py-3 px-4 font-medium">Resource</th>
                      <th className="text-left py-3 px-4 font-medium">Timestamp</th>
                      <th className="text-left py-3 px-4 font-medium">IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{log.user}</td>
                        <td className="py-3 px-4">{log.action}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{log.resource}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{log.timestamp}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{log.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
