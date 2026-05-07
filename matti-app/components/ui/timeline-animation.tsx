"use client";

import {
  type ElementType,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface TimelineContentProps {
  children: React.ReactNode;
  as?: ElementType;
  animationNum?: number;
  timelineRef?: RefObject<HTMLElement | HTMLDivElement | null>;
  customVariants?: Variants;
  className?: string;
  [key: string]: unknown;
}

const defaultVariants: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      delay: i * 0.12,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export function TimelineContent({
  children,
  as: Tag = "div",
  animationNum = 0,
  timelineRef,
  customVariants,
  className,
  ...props
}: TimelineContentProps) {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const variants = customVariants ?? defaultVariants;

  // Must be memoized — motion.create() returns a new component on every call.
  // Without this, React unmounts/remounts the element each render, resetting isVisible.
  const MotionTag = useMemo(() => motion.create(Tag as ElementType), [Tag]);

  return (
    <MotionTag
      ref={ref}
      custom={animationNum}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={variants}
      className={cn(className)}
      {...props}
    >
      {children}
    </MotionTag>
  );
}
