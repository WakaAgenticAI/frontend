"use client"

import { AppShell } from "@/components/app-shell"
import { OrdersInterface } from "@/components/orders/orders-interface"

export default function OrdersPage() {
  return (
    <AppShell>
      <div className="h-full">
        <OrdersInterface />
      </div>
    </AppShell>
  )
}
