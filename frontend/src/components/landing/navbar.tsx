"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
]

const SPRING = "cubic-bezier(0.32, 0.72, 0, 1)"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    /*
     * Only three things change on scroll:
     *  1. maxWidth  — pill narrows horizontally (920 → 660px)
     *  2. top       — pill floats off the edge slightly
     *  3. Inner pill visuals — frosted glass + border + border-radius appear
     * Font sizes, padding, and element sizes are identical in both states.
     */
    <div
      className="fixed z-50"
      style={{
        left:      "50%",
        transform: "translateX(-50%)",
        top:       scrolled ? "12px" : 0,
        width:     "calc(100% - 2rem)",
        maxWidth:  scrolled ? 660 : 920,
        transition: `top 480ms ${SPRING}, max-width 480ms ${SPRING}`,
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{
          borderRadius:         scrolled ? 9999 : 0,
          background:           scrolled ? "rgba(255, 255, 255, 0.25)" : "transparent",
          backdropFilter:       scrolled ? "blur(10px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(10px)" : "none",
          border:               "1px solid",
          borderColor:          scrolled ? "rgba(117, 115, 114, 0.15)" : "rgba(117, 115, 114, 0)",
          boxShadow:            "none",
          padding:              "12px 20px",
          transition: [
            `border-radius    480ms ${SPRING}`,
            `background-color 280ms ease-out`,
            `border-color     280ms ease-out`,
            `backdrop-filter  280ms ease-out`,
          ].join(", "),
        }}
      >

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <KiteLogo
            className="text-primary"
            style={{ width: "1.4rem", height: "1.4rem" }}
          />
          <span className="text-[1.1rem] font-semibold tracking-tight text-gray-900">
            FinanceKite
          </span>
        </Link>

        {/* ── Desktop nav links ── */}
        <nav className="hidden md:flex items-center">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-[0.95rem] font-medium text-gray-600 hover:text-gray-900 rounded-full hover:bg-black/5 transition-colors duration-150"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ── Desktop CTAs ── */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-[0.95rem] font-medium text-gray-600 hover:text-gray-900 transition-colors duration-150"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center rounded-full bg-gray-900 px-5 py-2 text-[0.95rem] font-semibold text-white hover:bg-gray-700 active:scale-[0.97] transition-colors duration-150"
          >
            Get started free
          </Link>
        </div>

        {/* ── Mobile hamburger ── */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="md:hidden rounded-full">
              <Menu className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 p-0">
            <div className="flex flex-col h-full">

              <div className="flex items-center gap-2.5 px-6 py-5 border-b">
                <KiteLogo className="text-primary" style={{ width: "1.4rem", height: "1.4rem" }} />
                <span className="text-base font-semibold tracking-tight text-gray-900">
                  FinanceKite
                </span>
              </div>

              <nav className="flex flex-col px-3 py-4 gap-0.5 flex-1">
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>

              <div className="flex flex-col gap-2.5 px-5 pb-8">
                <Link
                  href="/sign-in"
                  className="flex items-center justify-center w-full rounded-full border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="flex items-center justify-center w-full rounded-full bg-gray-900 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
                >
                  Get started free
                </Link>
              </div>

            </div>
          </SheetContent>
        </Sheet>

      </div>
    </div>
  )
}

function KiteLogo({
  className,
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <svg
      viewBox="0 0 32 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M16 2L30 19L16 24L2 19Z" fill="currentColor" />
      <path d="M16 24L30 19L16 34L2 19Z" fill="currentColor" opacity="0.35" />
    </svg>
  )
}
