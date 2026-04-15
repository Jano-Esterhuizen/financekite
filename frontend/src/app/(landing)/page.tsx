"use client";
import Image from "next/image";
import Link from "next/link";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { Feature1 } from "@/components/ui/feature-1";
import { Feature2 } from "@/components/ui/feature-2";
import { BentoSection } from "@/components/landing/bento-section";
import Pricing from "@/components/ui/pricing";
import { Component as FlickeringFooter } from "@/components/flickering-footer";

export default function LandingPage() {
  return (
    <div className="bg-gradient-to-b from-brand-50 to-white">
      {/* Hero — scroll animation section */}
      <ContainerScroll
        titleComponent={
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-600">
              Built for South African small businesses
            </p>
            <h1 className="text-4xl font-bold tracking-tight leading-tight text-gray-900 md:text-6xl">
              Manage your finances,{" "}
              <span className="text-brand-500">the smart way.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-gray-500">
              Invoices, expenses, and recurring payments — all in one place.
              Get paid faster and stay on top of your cash flow.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-full bg-gray-900 px-8 py-3 text-sm font-semibold text-white hover:bg-gray-800 active:scale-[0.98] transition-all duration-150"
              >
                Get started free
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-8 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition-all duration-150"
              >
                See features
              </Link>
            </div>
          </div>
        }
      >
        <Image
          src="/screenshots/dashboard-hero.png"
          alt="FinanceKite dashboard preview"
          height={720}
          width={1400}
          className="mx-auto rounded-2xl object-cover h-full object-top"
          draggable={false}
          priority
        />
      </ContainerScroll>

      {/* Features section — overlaps the hero scroll with a white fade */}
      <section
        id="features"
        className="relative z-10 -mt-64 min-h-screen rounded-t-[2.5rem] bg-white shadow-[0_-12px_40px_rgba(0,0,0,0.06)]"
      >
        {/* Gradient that bleeds upward over the card bottom */}
        <div className="pointer-events-none absolute -top-40 left-0 right-0 h-40 bg-gradient-to-b from-transparent to-white" />

        {/* Feature 1 — text left, image right */}
        <Feature1
          badge="Invoicing"
          title="Send professional invoices in minutes"
          description="Create, customise, and send invoices to clients instantly. FinanceKite tracks payment status automatically and follows up so you never have to chase a payment again."
          imageSrc="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80"
          imageAlt="Invoice management"
          cardColor="bg-brand-50"
          buttonPrimary={{ label: "Start invoicing free", href: "/sign-up" }}
        />

        {/* Feature 2 — image left, text right */}
        <Feature2
          badge="Expenses"
          title="Track every expense without the hassle"
          description="Capture business expenses in seconds, categorise them with ease, and always know exactly where your money is going — all from one clean dashboard."
          imageSrc="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"
          imageAlt="Expense tracking dashboard"
          cardColor="bg-violet-50"
          buttonPrimary={{ label: "Track expenses", href: "/sign-up" }}
        />

        {/* Feature 3 — text left, image right */}
        <Feature1
          badge="Recurring Payments"
          title="Never miss a recurring payment again"
          description="Set up recurring payment schedules once and let FinanceKite send automatic reminders to clients. Keep your cash flow healthy and your admin overhead zero."
          imageSrc="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80"
          imageAlt="Recurring payments"
          cardColor="bg-emerald-50"
          buttonPrimary={{ label: "Get started free", href: "/sign-up" }}
        />

        {/* Bento grid — app screenshot showcase */}
        <BentoSection />

        {/* Pricing */}
        <Pricing />

        {/* Footer */}
        <FlickeringFooter />
      </section>
    </div>
  );
}
