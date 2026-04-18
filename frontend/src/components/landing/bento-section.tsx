import Link from "next/link";
import { BlurTextEffect } from "@/components/ui/blur-text-effect";

export function BentoSection() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-600">
            <BlurTextEffect>Built for your workflow</BlurTextEffect>
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
            <BlurTextEffect>{"Everything your business needs, "}</BlurTextEffect>
            <BlurTextEffect className="text-brand-500">in one place</BlurTextEffect>
          </h2>
          <p className="mx-auto mt-4 max-w-lg leading-relaxed text-gray-500">
            <BlurTextEffect charAnimation={false}>
              From invoicing to expenses and recurring payments — FinanceKite handles your finances so you can focus on growing your business.
            </BlurTextEffect>
          </p>
        </div>

        {/*
          Desktop grid (lg):
          ┌─────────────────────┬──────────┐  ← row 1 — 260px
          │  Dashboard (col-2)  │  Tall    │
          ├──────────┬──────────┤  card    │  ← row 2 — 260px
          │ Expenses │  Clients │ (col-1)  │
          ├──────────┴──────────┴──────────┤  ← row 3 — auto
          │     Reports (col-3, wide)      │
          └────────────────────────────────┘
        */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:grid-rows-[260px_260px_auto]">

          {/* ── Businesses: wide top-left, side-by-side layout ── */}
          <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 transition-colors duration-300 hover:bg-brand-100 lg:col-span-2 lg:row-span-1 lg:flex-row lg:items-center">
            <div className="p-6 lg:w-56 lg:flex-shrink-0">
              <span className="text-xs font-semibold uppercase tracking-widest text-brand-600">
                Multi-Business
              </span>
              <h3 className="mt-2 text-xl font-semibold text-gray-900">
                Manage multiple businesses
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Switch between businesses in a click — each with its own
                clients, invoices, expenses, and reports, all under one account.
              </p>
            </div>
            <div className="flex-1 flex items-center justify-center p-4 lg:py-4 lg:pr-6 lg:pl-0">
              <div className="max-w-[60%] overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                <img
                  src="/screenshots/businesses.png"
                  alt="FinanceKite business management"
                  className="w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </div>
          </div>

          {/* ── Streamline: tall right column spanning rows 1 & 2 ── */}
          <div className="group overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 transition-colors duration-300 hover:bg-brand-100 lg:col-start-3 lg:row-start-1 lg:row-span-2">
            <div className="p-6 pb-0">
              <span className="text-xs font-semibold uppercase tracking-widest text-brand-600">
                Streamline
              </span>
              <h3 className="mt-2 text-base font-semibold text-gray-900">
                Everything at your fingertips
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Navigate your entire business from one clean sidebar —
                dashboard, expenses, clients, invoices, and recurring payments,
                all one click away.
              </p>
            </div>
            <div className="mt-4 px-6">
              <div className="overflow-hidden rounded-t-xl border border-gray-200 shadow-sm">
                <img
                  src="/screenshots/sidebar.png"
                  alt="FinanceKite sidebar navigation"
                  className="w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  style={{ maxHeight: "300px" }}
                />
              </div>
            </div>
          </div>

          {/* ── Expenses: bottom-left ── */}
          <div className="group overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 transition-colors duration-300 hover:bg-brand-100">
            <div className="p-6 pb-0">
              <span className="text-xs font-semibold uppercase tracking-widest text-brand-600">
                Expenses
              </span>
              <h3 className="mt-2 text-base font-semibold text-gray-900">
                Every rand accounted for
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Capture and categorise business expenses on the go.
              </p>
            </div>
            <div className="mt-4 px-6">
              <div className="overflow-hidden rounded-t-xl border border-gray-200 shadow-sm">
                <img
                  src="/screenshots/expenses.png"
                  alt="FinanceKite expenses"
                  className="w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  style={{ maxHeight: "130px" }}
                />
              </div>
            </div>
          </div>

          {/* ── Clients: bottom-middle ── */}
          <div className="group overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 transition-colors duration-300 hover:bg-brand-100">
            <div className="p-6 pb-0">
              <span className="text-xs font-semibold uppercase tracking-widest text-brand-600">
                Clients
              </span>
              <h3 className="mt-2 text-base font-semibold text-gray-900">
                Know your clients
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Manage client details, invoice history, and balances in one
                place.
              </p>
            </div>
            <div className="mt-4 px-6">
              <div className="overflow-hidden rounded-t-xl border border-gray-200 shadow-sm">
                <img
                  src="/screenshots/clients.png"
                  alt="FinanceKite clients"
                  className="w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  style={{ maxHeight: "130px" }}
                />
              </div>
            </div>
          </div>

          {/* ── Reports: full-width horizontal bottom card ── */}
          <div className="group flex flex-col gap-6 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 p-6 transition-colors duration-300 hover:bg-brand-100 lg:col-span-3 lg:flex-row lg:items-center">
            {/* Text */}
            <div className="lg:w-72 lg:flex-shrink-0">
              <span className="text-xs font-semibold uppercase tracking-widest text-brand-600">
                Reports &amp; Insights
              </span>
              <h3 className="mt-2 text-xl font-semibold text-gray-900">
                Data-driven decisions, made simple
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Understand your revenue trends, payment history, and expense
                patterns at a glance — so you can grow with confidence.
              </p>
              <Link
                href="/sign-up"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 active:scale-[0.98] transition-all duration-150"
              >
                Get started free
              </Link>
            </div>

            {/* Screenshot */}
            <div className="flex-1 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
              <img
                src="/screenshots/dashboard.png"
                alt="FinanceKite dashboard overview"
                className="w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                style={{ maxHeight: "200px" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
