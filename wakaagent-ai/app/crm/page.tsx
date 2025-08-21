"use client"

import { AppShell } from "@/components/app-shell"
import { CRMInterface } from "@/components/crm/crm-interface"

export default function CRMPage() {
  return (
    <AppShell>
      <div className="h-full">
        <CRMInterface />
      </div>
    </AppShell>
  )
}
