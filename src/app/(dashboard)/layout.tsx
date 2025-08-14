import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

export default function DashboardAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  )
}