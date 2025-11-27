import { LayoutWrapper } from "@/components/layout-wrapper"
import { AnalyticsPage } from "@/components/pages/analytics-page"

export const metadata = {
  title: "Analytics - Smart Farm",
  description: "Financial analytics",
}

export default function Page() {
  return (
    <LayoutWrapper>
      <AnalyticsPage />
    </LayoutWrapper>
  )
}
