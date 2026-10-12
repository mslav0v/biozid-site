"use client";

import Link from "next/link";
import { ComponentProps } from "react";
import { trackEvent } from "@/utils/analytics";

interface TrackedLinkProps extends ComponentProps<typeof Link> {
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
  eventLabel,
  onClick,
  ...props
}: TrackedLinkProps) {
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    try {
      trackEvent(eventAction, eventCategory, eventLabel);
    } catch (error) {
      console.error("Грешка при проследяване на събитието:", error);
    }

    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Link 
      href={href} 
      className={className} 
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
}