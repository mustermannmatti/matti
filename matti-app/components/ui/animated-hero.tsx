"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

export function AnimatedHeadline() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["einfach.", "digital.", "sicher.", "papierlos.", "immer dabei."],
    []
  );

  useEffect(() => {
    const id = setTimeout(() => {
      setTitleNumber((prev) => (prev === titles.length - 1 ? 0 : prev + 1));
    }, 2000);
    return () => clearTimeout(id);
  }, [titleNumber, titles]);

  return (
    <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
      &nbsp;
      {titles.map((title, index) => (
        <motion.span
          key={index}
          className="absolute font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500"
          initial={{ opacity: 0, y: -80 }}
          transition={{ type: "spring", stiffness: 60, damping: 14 }}
          animate={
            titleNumber === index
              ? { y: 0, opacity: 1 }
              : { y: titleNumber > index ? -80 : 80, opacity: 0 }
          }
        >
          {title}
        </motion.span>
      ))}
    </span>
  );
}
