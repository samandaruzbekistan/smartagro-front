import { LayoutWrapper } from "@/components/layout-wrapper"
import { ProfilePage } from "@/components/pages/profile-page"

export const metadata = {
  title: "Profile - Smart Farm",
  description: "Manage your profile settings",
}

export default function Page() {
  return (
    <LayoutWrapper>
      <ProfilePage />
    </LayoutWrapper>
  )
}

