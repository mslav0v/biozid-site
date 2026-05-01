// components/TrackedLink.tsx
"use client";

import Link from "next/link";
import { trackEvent } from "@/utils/analytics";

interface TrackedLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
  eventAction: string;
  eventCategory: string;
  eventLabel: string;
}

export default function TrackedLink({ 
  href, 
  className, 
  children, 
  eventAction, 
  eventCategory, 
  eventLabel 
}: TrackedLinkProps) {
  
  const handleClick = () => {
    trackEvent(eventAction, eventCategory, eventLabel);
  };

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}