import { LayoutWrapper } from "@/components/layout-wrapper"
import { FieldsPage } from "@/components/pages/fields-page"

export const metadata = {
  title: "Fields - Smart Farm",
  description: "Manage your farm fields",
}

export default function Page() {
  return (
    <LayoutWrapper>
      <FieldsPage />
    </LayoutWrapper>
  )
}
