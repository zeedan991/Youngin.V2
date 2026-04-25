"use client";
import React, { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Button } from "../ui/Button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const TopNav = () => {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
  });

  return (
    <motion.header
      className={cn(
        "fixed top-0 inset-x-0 z-50 px-6 py-4 transition-all duration-300",
        scrolled
          ? "bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/5"
          : "bg-transparent",
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-white font-[900] text-xl tracking-[4px]">
          YOUNGIN
        </Link>

        {/* Navigation - Hidden on small mobile */}
        <nav className="hidden md:flex items-center gap-8 text-[#888888] text-sm font-medium tracking-wide">
          <Link
            href="#features"
            className="hover:text-white transition-colors hover:text-glow"
          >
            Features
          </Link>
          <Link
            href="/studio"
            className="hover:text-white transition-colors hover:text-glow"
          >
            Studio
          </Link>
          <Link
            href="/marketplace"
            className="hover:text-white transition-colors hover:text-glow"
          >
            Marketplace
          </Link>
          <Link
            href="/pricing"
            className="hover:text-white transition-colors hover:text-glow"
          >
            Pricing
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden sm:block text-sm text-white font-medium hover:text-[#00E5FF] transition-colors"
          >
            Sign In
          </Link>
          <Button variant="primary" size="sm" className="font-bold">
            Get Started
          </Button>
        </div>
      </div>
    </motion.header>
  );
};
