import Link from "next/link";
import { BlurTextEffect } from "@/components/ui/blur-text-effect";

interface Feature2Props {
  badge?: string;
  title: string;
  description?: string;
  imageSrc: string;
  imageAlt: string;
  cardColor?: string;
  buttonPrimary: {
    label: string;
    href: string;
  };
  buttonSecondary?: {
    label: string;
    href: string;
  };
}

export const Feature2 = ({
  badge,
  title,
  description,
  imageSrc,
  imageAlt,
  cardColor = "bg-gray-100",
  buttonPrimary,
  buttonSecondary,
}: Feature2Props) => {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Image card — left on desktop, below text on mobile */}
          <div className={`${cardColor} order-last flex items-center justify-center rounded-2xl p-6 lg:order-first`}>
            <img
              src={imageSrc}
              alt={imageAlt}
              className="w-full rounded-xl object-cover shadow-sm"
            />
          </div>

          {/* Text */}
          <div className="flex flex-col items-start text-left">
            {badge && (
              <span className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-600">
                <BlurTextEffect>{badge}</BlurTextEffect>
              </span>
            )}
            <h2 className="mb-4 text-3xl md:text-4xl font-bold tracking-tight leading-tight text-gray-900">
              <BlurTextEffect>{title}</BlurTextEffect>
            </h2>
            {description && (
              <p className="mb-8 text-base lg:text-lg leading-relaxed text-gray-500">
                <BlurTextEffect charAnimation={false}>{description}</BlurTextEffect>
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <Link
                href={buttonPrimary.href}
                className="inline-flex items-center justify-center rounded-full bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 active:scale-[0.98] transition-all duration-150"
              >
                {buttonPrimary.label}
              </Link>
              {buttonSecondary && (
                <Link
                  href={buttonSecondary.href}
                  className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition-all duration-150"
                >
                  {buttonSecondary.label}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
