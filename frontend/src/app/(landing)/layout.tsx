import { Navbar } from "@/components/landing/navbar"
import { PageLoader } from "@/components/landing/page-loader"
import { SmoothScroll } from "@/components/landing/smooth-scroll"

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <PageLoader />
      <SmoothScroll />
      <Navbar />
      <main>{children}</main>
    </>
  )
}
