"use client";
import Image from "next/image";
import Link from "next/link";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

export default function LandingPage() {
  return (
    <div className="bg-gradient-to-b from-sky-50 to-white">
      {/* Hero — scroll animation section */}
      <ContainerScroll
        titleComponent={
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-sky-600">
              Built for South African small businesses
            </p>
            <h1 className="text-4xl font-bold text-gray-900 md:text-6xl leading-tight">
              Manage your finances,{" "}
              <span className="text-sky-500">the smart way.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-gray-500">
              Invoices, expenses, and recurring payments — all in one place.
              Get paid faster and stay on top of your cash flow.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-full bg-gray-900 px-7 py-3 text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
              >
                Get started free
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-7 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                See features
              </Link>
            </div>
          </div>
        }
      >
        <Image
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&q=80"
          alt="FinanceKite dashboard preview"
          height={720}
          width={1400}
          className="mx-auto rounded-2xl object-cover h-full object-top"
          draggable={false}
        />
      </ContainerScroll>

      {/* Features section */}
      <section
        id="features"
        className="flex min-h-screen items-center justify-center bg-white"
      >
        <h2 className="text-3xl font-bold text-gray-900">Features Section</h2>
      </section>
    </div>
  );
}
