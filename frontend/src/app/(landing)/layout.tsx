import { Navbar } from "@/components/landing/navbar"
import { PageLoader } from "@/components/landing/page-loader"

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <PageLoader />
      <Navbar />
      <main>{children}</main>
    </>
  )
}
