import { LayoutWrapper } from "@/components/layout-wrapper"
import { PlantsPage } from "@/components/pages/plants-page"

export const metadata = {
  title: "Plants - Smart Farm",
  description: "Crop catalog for soil analysis",
}

export default function Page() {
  return (
    <LayoutWrapper>
      <PlantsPage />
    </LayoutWrapper>
  )
}

