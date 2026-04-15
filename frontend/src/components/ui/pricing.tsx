"use client";

import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { BlurTextEffect } from "@/components/ui/blur-text-effect";

type Plan = "monthly" | "annually";

type PLAN = {
  id: string;
  title: string;
  desc: string;
  monthlyPrice: number;
  annuallyPrice: number;
  badge?: string;
  buttonText: string;
  features: string[];
  link: string;
};

const PLANS: PLAN[] = [
  {
    id: "starter",
    title: "Starter",
    desc: "Perfect for freelancers and sole traders who need simple, professional financial management without the complexity.",
    monthlyPrice: 99,
    annuallyPrice: 990,
    buttonText: "Get started free",
    features: [
      "Up to 10 clients",
      "20 invoices per month",
      "Expense tracking",
      "Basic financial reports",
      "Recurring payment reminders",
      "Email support",
      "1 user",
    ],
    link: "/sign-up",
  },
  {
    id: "pro",
    title: "Pro",
    desc: "Built for growing businesses that need unlimited invoicing, advanced reports, and priority support.",
    monthlyPrice: 249,
    annuallyPrice: 2490,
    badge: "Best Value",
    buttonText: "Start Pro trial",
    features: [
      "Unlimited clients",
      "Unlimited invoices",
      "Advanced expense categories",
      "Full reports & cash flow insights",
      "Automated recurring payments",
      "Priority support",
      "Up to 3 users",
      "Accountant access",
    ],
    link: "/sign-up",
  },
];

export default function Pricing() {
  const [billPlan, setBillPlan] = useState<Plan>("monthly");

  const handleSwitch = () => {
    setBillPlan((prev) => (prev === "monthly" ? "annually" : "monthly"));
  };

  return (
    <section id="pricing" className="relative flex flex-col items-center justify-center py-24">
      <div className="flex flex-col items-center justify-center max-w-2xl mx-auto px-6">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
            <BlurTextEffect>Pricing</BlurTextEffect>
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-3 text-gray-900">
            <BlurTextEffect>Simple, transparent pricing</BlurTextEffect>
          </h2>
          <p className="text-base md:text-lg text-center leading-relaxed text-gray-500 mt-4">
            <BlurTextEffect charAnimation={false}>
              No hidden fees. Cancel anytime. All prices in ZAR.
            </BlurTextEffect>
          </p>
        </div>

        {/* Monthly / Annually toggle */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <span className="text-sm font-medium text-gray-600">Monthly</span>
          <button onClick={handleSwitch} className="relative rounded-full focus:outline-none">
            <div className="w-12 h-6 transition rounded-full bg-brand-600" />
            <div
              className={cn(
                "absolute inline-flex items-center justify-center w-4 h-4 transition-all duration-500 ease-in-out top-1 left-1 rounded-full bg-white",
                billPlan === "annually" ? "translate-x-6" : "translate-x-0"
              )}
            />
          </button>
          <span className="text-sm font-medium text-gray-600">
            Annually{" "}
            <span className="text-xs font-semibold text-brand-600 ml-1">Save 16%</span>
          </span>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid w-full grid-cols-1 lg:grid-cols-2 pt-12 gap-6 max-w-4xl mx-auto px-6">
        {PLANS.map((plan) => (
          <PlanCard key={plan.id} plan={plan} billPlan={billPlan} />
        ))}
      </div>
    </section>
  );
}

function PlanCard({ plan, billPlan }: { plan: PLAN; billPlan: Plan }) {
  const isPro = plan.id === "pro";

  return (
    <div
      className={cn(
        "flex flex-col relative rounded-2xl transition-all bg-white items-start w-full border overflow-hidden",
        isPro ? "border-brand-400" : "border-gray-200"
      )}
    >
      {/* Pro glow */}
      {isPro && (
        <div className="absolute top-1/2 inset-x-0 mx-auto h-12 -rotate-45 w-full bg-brand-400 rounded-full blur-[8rem] -z-10" />
      )}

      {/* Header */}
      <div className="p-6 md:p-8 flex flex-col items-start w-full relative">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-xl text-gray-900">{plan.title}</h3>
          {plan.badge && (
            <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-600 ring-1 ring-brand-500/20">
              {plan.badge}
            </span>
          )}
        </div>
        <div className="mt-3 text-2xl font-bold md:text-5xl text-gray-900">
          <NumberFlow
            value={billPlan === "monthly" ? plan.monthlyPrice : plan.annuallyPrice}
            prefix="R"
            suffix={billPlan === "monthly" ? "/mo" : "/yr"}
            format={{
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }}
          />
        </div>
        <p className="text-sm md:text-base leading-relaxed text-gray-500 mt-3">{plan.desc}</p>
      </div>

      {/* CTA */}
      <div className="flex flex-col items-start w-full px-6 py-2 md:px-8">
        <Link
          href={plan.link}
          className={cn(
            "inline-flex w-full items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold active:scale-[0.98] transition-all duration-150",
            isPro
              ? "bg-brand-600 text-white hover:bg-brand-700"
              : "bg-gray-900 text-white hover:bg-gray-800"
          )}
        >
          {plan.buttonText}
        </Link>
        <div className="h-8 overflow-hidden w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.span
              key={billPlan}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="text-sm text-center text-gray-500 mt-3 mx-auto block"
            >
              {billPlan === "monthly" ? "Billed monthly" : "Billed in one annual payment"}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Features */}
      <div className="flex flex-col items-start w-full px-6 pb-6 md:px-8 gap-y-2">
        <span className="text-sm font-semibold text-gray-900 mb-2">Includes:</span>
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-center justify-start gap-2">
            <CheckIcon className="size-4 text-brand-500 shrink-0" />
            <span className="text-sm text-gray-600">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
