import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { CopyIcon } from "@phosphor-icons/react/dist/csr/Copy";
import { useEffect, useId, useRef, useState } from "react";

import { AuthButton } from "@/features/auth/auth-screen";
import { AuthMark } from "@/features/auth/auth-mark";
import { deploymentName, ownerCommand } from "@/features/auth/owner-command";

import "@fontsource/ibm-plex-mono/400.css";
import "./auth.css";

/**
 * Signed in, but not an owner: says so, shows the Clerk user id and the command that adds it to
 * the owners, and offers to sign out. The Days stay empty: there is no data for this account.
 */
export function NoAccessScreen({ userId, signOut }: { userId: string; signOut: () => void }) {
  const [signingOut, setSigningOut] = useState(false);
  const command = ownerCommand(userId, deploymentName(import.meta.env.VITE_CONVEX_URL));

  return (
    <main className="auth-screen" data-align="start">
      <AuthMark filled={false} />
      <h1 className="auth-title">No access</h1>
      <div className="auth-content gap-7">
        <p className="text-base leading-6 text-pretty text-ink-2">
          This account is signed in, but only the owner’s account can see the habits. To give it
          access, run the command below from the root of the repository, then reload this page.
        </p>
        <CopyValue label="User id" value={userId} />
        <CopyValue label="Command" value={command} />
        <AuthButton
          variant="quiet"
          className="self-start"
          disabled={signingOut}
          onClick={() => {
            setSigningOut(true);
            signOut();
          }}
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </AuthButton>
      </div>
    </main>
  );
}

/** A value to copy: its label, the value in a code face, and a copy button. */
function CopyValue({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const reset = useRef<ReturnType<typeof setTimeout>>(undefined);
  const id = useId();
  useEffect(() => () => clearTimeout(reset.current), []);

  const copy = async () => {
    if (!(await copyText(value))) return;
    setCopied(true);
    clearTimeout(reset.current);
    reset.current = setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section className="flex flex-col gap-1.5" aria-labelledby={id}>
      <div className="flex items-center justify-between gap-3">
        <h2 id={id} className="auth-label">
          {label}
        </h2>
        <button
          type="button"
          className="auth-copy"
          onClick={() => void copy()}
          aria-label={copied ? `${label} copied` : `Copy the ${label.toLowerCase()}`}
        >
          {copied ? (
            <CheckIcon weight="bold" className="size-4" aria-hidden />
          ) : (
            <CopyIcon weight="bold" className="size-4" aria-hidden />
          )}
          <span aria-hidden>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <code className="auth-code">{value}</code>
    </section>
  );
}

/** Copies text to the clipboard; false when the browser refused. */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // No Clipboard API outside a secure context (a phone on the dev server's LAN address).
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();
    const done = document.execCommand("copy");
    field.remove();
    return done;
  }
}
