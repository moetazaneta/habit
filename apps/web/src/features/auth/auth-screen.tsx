import type { ButtonHTMLAttributes, ReactNode } from "react";

import { AuthMark } from "@/features/auth/auth-mark";
import { cn } from "@/lib/utils";

import "./auth.css";

/**
 * The frame of the screens before the list: the mark at a fixed height, the name under it, then
 * the screen's own content. The loading screen draws the same frame with the mark alone, so the
 * mark does not move when the sign-in screen replaces it.
 */
export function AuthScreen({
  filled,
  title,
  children,
}: {
  filled: boolean;
  title?: string;
  children?: ReactNode;
}) {
  return (
    <main className="auth-screen">
      <AuthMark filled={filled} />
      {title === undefined ? null : <h1 className="auth-title">{title}</h1>}
      {children === undefined ? null : <div className="auth-content">{children}</div>}
    </main>
  );
}

/** The button of these screens: the primary one is solid ink, the quiet one a soft surface. */
export function AuthButton({
  variant = "primary",
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "quiet" }) {
  return (
    <button type="button" {...rest} className={cn("auth-button", className)} data-variant={variant}>
      {children}
    </button>
  );
}
