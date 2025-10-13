"use client"

import { AppShell } from "@/components/app-shell"
import { InventoryInterface } from "@/components/inventory/inventory-interface"

export default function InventoryPage() {
  return (
    <AppShell>
      <div className="h-full">
        <InventoryInterface />
      </div>
    </AppShell>
  )
}
