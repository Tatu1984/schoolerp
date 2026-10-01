'use client'

import { PortalProvider } from '@/components/portal/PortalContext'
import PortalShell from '@/components/portal/PortalShell'

export default function PortalLayout({ children }) {
  return (
    <PortalProvider>
      <PortalShell>{children}</PortalShell>
    </PortalProvider>
  )
}
