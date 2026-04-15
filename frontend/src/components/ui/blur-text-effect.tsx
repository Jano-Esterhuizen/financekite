"use client";

import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface BlurTextEffectProps {
  children: string;
  className?: string;
  /**
   * true  = character-by-character stagger (headings, badges)
   * false = single-block fade (descriptions, body text)
   */
  charAnimation?: boolean;
}

export const BlurTextEffect: React.FC<BlurTextEffectProps> = ({
  children,
  className = "",
  charAnimation = true,
}) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    if (charAnimation) {
      const chars = containerRef.current.querySelectorAll("span.char");

      gsap.set(chars, { opacity: 0, y: 10, filter: "blur(8px)" });

      const tween = gsap.to(chars, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.3,
        ease: "power2.out",
        stagger: 0.015,
        clearProps: "filter",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 90%",
          once: true,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    } else {
      const el = containerRef.current;

      gsap.set(el, { opacity: 0, y: 12, filter: "blur(6px)" });

      const tween = gsap.to(el, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.5,
        ease: "power2.out",
        clearProps: "filter",
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          once: true,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    }
  }, [children, charAnimation]);

  if (!charAnimation) {
    return (
      <span className={`inline-block ${className}`} ref={containerRef}>
        {children}
      </span>
    );
  }

  return (
    <span className={`inline-block ${className}`} ref={containerRef}>
      {children.split("").map((char, i) => (
        <span
          key={`${char}-${i}`}
          className="char inline-block"
          style={{ whiteSpace: "pre" }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
};
