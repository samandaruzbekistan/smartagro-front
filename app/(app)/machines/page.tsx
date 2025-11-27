import { LayoutWrapper } from "@/components/layout-wrapper"
import { MachinesPage } from "@/components/pages/machines-page"

export const metadata = {
  title: "Machines - Smart Farm",
  description: "Equipment management",
}

export default function Page() {
  return (
    <LayoutWrapper>
      <MachinesPage />
    </LayoutWrapper>
  )
}
