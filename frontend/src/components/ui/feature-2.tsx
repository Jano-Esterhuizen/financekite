import Link from "next/link";
import { Button } from "@/components/ui/button";

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
  cardColor = "bg-violet-50",
  buttonPrimary,
  buttonSecondary,
}: Feature2Props) => {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Image card — left on desktop, below text on mobile */}
          <div className={`${cardColor} order-last flex items-center justify-center rounded-3xl p-6 lg:order-first`}>
            <img
              src={imageSrc}
              alt={imageAlt}
              className="w-full rounded-2xl object-cover shadow-md"
            />
          </div>

          {/* Text */}
          <div className="flex flex-col items-start text-left">
            {badge && (
              <span className="mb-4 text-xs font-semibold uppercase tracking-widest text-sky-600">
                {badge}
              </span>
            )}
            <h2 className="mb-4 text-4xl font-bold leading-tight text-gray-900 lg:text-5xl">
              {title}
            </h2>
            <p className="mb-8 text-base text-gray-500 lg:text-lg">
              {description}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="rounded-full">
                <Link href={buttonPrimary.href}>{buttonPrimary.label}</Link>
              </Button>
              {buttonSecondary && (
                <Button variant="outline" asChild className="rounded-full">
                  <Link href={buttonSecondary.href}>{buttonSecondary.label}</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
