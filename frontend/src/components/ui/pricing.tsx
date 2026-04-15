"use client";

import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
    <section id="pricing" className="relative flex flex-col items-center justify-center py-20">
      <div className="flex flex-col items-center justify-center max-w-2xl mx-auto px-6">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-600">
            Pricing
          </p>
          <h2 className="text-4xl font-bold mt-4 text-gray-900">
            Simple, transparent pricing
          </h2>
          <p className="text-base md:text-lg text-center text-muted-foreground mt-4">
            No hidden fees. Cancel anytime. All prices in ZAR.
          </p>
        </div>

        {/* Monthly / Annually toggle */}
        <div className="flex items-center justify-center space-x-4 mt-6">
          <span className="text-base font-medium">Monthly</span>
          <button onClick={handleSwitch} className="relative rounded-full focus:outline-none">
            <div className="w-12 h-6 transition rounded-full shadow-md outline-none bg-sky-500" />
            <div
              className={cn(
                "absolute inline-flex items-center justify-center w-4 h-4 transition-all duration-500 ease-in-out top-1 left-1 rounded-full bg-white",
                billPlan === "annually" ? "translate-x-6" : "translate-x-0"
              )}
            />
          </button>
          <span className="text-base font-medium">
            Annually{" "}
            <span className="text-xs font-semibold text-sky-600 ml-1">Save 16%</span>
          </span>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid w-full grid-cols-1 lg:grid-cols-2 pt-8 lg:pt-12 gap-4 lg:gap-6 max-w-4xl mx-auto px-6">
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
        "flex flex-col relative rounded-2xl lg:rounded-3xl transition-all bg-background items-start w-full border overflow-hidden",
        isPro ? "border-sky-400" : "border-foreground/10"
      )}
    >
      {/* Pro glow */}
      {isPro && (
        <div className="absolute top-1/2 inset-x-0 mx-auto h-12 -rotate-45 w-full bg-sky-400 rounded-full blur-[8rem] -z-10" />
      )}

      {/* Header */}
      <div className="p-4 md:p-8 flex rounded-t-2xl lg:rounded-t-3xl flex-col items-start w-full relative">
        <div className="flex items-center gap-2">
          <h2 className="font-medium text-xl text-foreground pt-5">{plan.title}</h2>
          {plan.badge && (
            <span className="mt-5 inline-flex items-center rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-600 ring-1 ring-sky-500/20">
              {plan.badge}
            </span>
          )}
        </div>
        <h3 className="mt-3 text-2xl font-bold md:text-5xl">
          <NumberFlow
            value={billPlan === "monthly" ? plan.monthlyPrice : plan.annuallyPrice}
            prefix="R"
            suffix={billPlan === "monthly" ? "/mo" : "/yr"}
            format={{
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }}
          />
        </h3>
        <p className="text-sm md:text-base text-muted-foreground mt-2">{plan.desc}</p>
      </div>

      {/* CTA */}
      <div className="flex flex-col items-start w-full px-4 py-2 md:px-8">
        <Button size="lg" className={cn("w-full rounded-full", isPro && "bg-sky-500 hover:bg-sky-600")} asChild>
          <Link href={plan.link}>{plan.buttonText}</Link>
        </Button>
        <div className="h-8 overflow-hidden w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.span
              key={billPlan}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="text-sm text-center text-muted-foreground mt-3 mx-auto block"
            >
              {billPlan === "monthly" ? "Billed monthly" : "Billed in one annual payment"}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Features */}
      <div className="flex flex-col items-start w-full p-5 mb-4 ml-1 gap-y-2">
        <span className="text-base text-left mb-2">Includes:</span>
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-center justify-start gap-2">
            <div className="flex items-center justify-center">
              <CheckIcon className="size-5 text-sky-500" />
            </div>
            <span className="text-sm">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
