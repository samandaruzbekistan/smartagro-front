import { LayoutWrapper } from "@/components/layout-wrapper"
import { CropRecommendationPage } from "@/components/pages/crop-recommendation-page"

export const metadata = {
  title: "Ekin Tavsiyasi - Smart Agro",
  description: "AI yordamida ekin tavsiyasi olish",
}

export default function Page() {
  return (
    <LayoutWrapper>
      <CropRecommendationPage />
    </LayoutWrapper>
  )
}

