"use client";

import { useEffect, useRef, useState, type ReactNode, type ElementType } from "react";

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  delay?: number; // ms
  direction?: "up" | "down" | "left" | "right" | "fade";
  duration?: number; // ms
  as?: ElementType;
  threshold?: number;
  rootMargin?: string;
}

export function RevealOnScroll({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 650,
  as: Component = "div",
  threshold = 0.01,
  rootMargin = "0px 0px 80px 0px",
}: RevealOnScrollProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Safety fallback: ensure content is always revealed on mobile even if IntersectionObserver fails
    const safetyTimer = setTimeout(() => {
      setIsVisible(true);
    }, 500 + delay);

    if (!("IntersectionObserver" in window)) {
      const immediateTimer = setTimeout(() => setIsVisible(true), 0);
      return () => {
        clearTimeout(safetyTimer);
        clearTimeout(immediateTimer);
      };
    }

    const element = ref.current;
    if (!element) return () => clearTimeout(safetyTimer);

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          clearTimeout(safetyTimer);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      clearTimeout(safetyTimer);
      observer.disconnect();
    };
  }, [threshold, rootMargin, delay]);

  const getHiddenTransform = () => {
    switch (direction) {
      case "up":
        return "translate3d(0, 24px, 0)";
      case "down":
        return "translate3d(0, -24px, 0)";
      case "left":
        return "translate3d(24px, 0, 0)";
      case "right":
        return "translate3d(-24px, 0, 0)";
      case "fade":
      default:
        return "translate3d(0, 0, 0)";
    }
  };

  const hiddenStyle = {
    opacity: 0,
    transform: getHiddenTransform(),
  };

  const visibleStyle = {
    opacity: 1,
    transform: "translate3d(0, 0, 0)",
    transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
  };

  return (
    <Component
      ref={ref}
      suppressHydrationWarning
      style={isVisible ? visibleStyle : hiddenStyle}
      className={`will-change-[opacity,transform] ${className}`}
    >
      {children}
    </Component>
  );
}
