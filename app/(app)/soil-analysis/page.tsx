import { LayoutWrapper } from "@/components/layout-wrapper"
import { SoilAnalysisPage } from "@/components/pages/soil-analysis-page"

export const metadata = {
  title: "Soil Analysis - Smart Farm",
  description: "Detailed soil analysis",
}

export default function Page() {
  return (
    <LayoutWrapper>
      <SoilAnalysisPage />
    </LayoutWrapper>
  )
}
