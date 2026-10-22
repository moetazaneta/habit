import type { EmailCodeSignIn } from "@habit/data";
import { GoogleLogoIcon } from "@phosphor-icons/react/dist/csr/GoogleLogo";
import { useEffect, useId, useState, type FormEvent } from "react";

import { MorphHeight } from "@/components/sheet";
import { AuthButton, AuthScreen } from "@/features/auth/auth-screen";

/** The test users of the Clerk development instance (docs/notes/data.md). */
const TEST_USERS = [
  "habit-owner+clerk_test@example.com",
  "habit-guest+clerk_test@example.com",
] as const;

/**
 * Signed out: the mark, the name, and one action, "Continue with Google". In development a
 * sign-in with an email code is one tap further, so the test users can sign in.
 */
export function SignInScreen({
  signIn,
  emailCode,
}: {
  signIn: () => void;
  emailCode?: EmailCodeSignIn | undefined;
}) {
  const [opening, setOpening] = useState(false);

  // Back from Google's page, the browser can restore this page as it was left: the button must
  // work again.
  useEffect(() => {
    const onShow = (event: PageTransitionEvent) => {
      if (event.persisted) setOpening(false);
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  return (
    <AuthScreen filled title="Habit">
      <div className="flex w-full flex-col items-stretch gap-3">
        <AuthButton
          aria-busy={opening}
          disabled={opening}
          onClick={() => {
            setOpening(true);
            signIn();
          }}
        >
          <GoogleLogoIcon weight="bold" className="size-5" aria-hidden />
          {opening ? "Opening Google…" : "Continue with Google"}
        </AuthButton>
        {import.meta.env.DEV && emailCode !== undefined ? (
          <EmailCodeSection emailCode={emailCode} />
        ) : null}
      </div>
    </AuthScreen>
  );
}

type Step = { name: "closed" } | { name: "email" } | { name: "code"; email: string };

/** Development only: a sign-in with a code from an email, in two short steps. */
function EmailCodeSection({ emailCode }: { emailCode: EmailCodeSignIn }) {
  const [step, setStep] = useState<Step>({ name: "closed" });
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ids = useId();

  const run = async (task: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await task();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const sendCode = (event: FormEvent) => {
    event.preventDefault();
    const address = email.trim();
    void run(async () => {
      await emailCode.sendCode(address);
      setCode("");
      setStep({ name: "code", email: address });
    });
  };

  const verifyCode = (event: FormEvent) => {
    event.preventDefault();
    // A success unmounts this screen: the app shows the list, or "no access".
    void run(() => emailCode.verifyCode(code.trim()));
  };

  const errorId = `${ids}-error`;
  const errorLine =
    error === null ? null : (
      <p id={errorId} role="alert" className="text-[0.9375rem] text-ink-2">
        {error}
      </p>
    );

  return (
    <MorphHeight className="-mx-1 px-1">
      {step.name === "closed" ? (
        <button
          type="button"
          className="auth-quiet-link mx-auto mt-1"
          onClick={() => setStep({ name: "email" })}
        >
          Sign in with an email code
        </button>
      ) : step.name === "email" ? (
        <form className="flex flex-col gap-3 pt-5" onSubmit={sendCode} noValidate>
          <label htmlFor={`${ids}-email`} className="sr-only">
            Email
          </label>
          <input
            id={`${ids}-email`}
            className="auth-field"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="Email"
            list={`${ids}-test-users`}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={error !== null}
            aria-describedby={error === null ? `${ids}-note` : errorId}
            // The person opened this form a moment ago.
            autoFocus
          />
          <datalist id={`${ids}-test-users`}>
            {TEST_USERS.map((user) => (
              <option key={user} value={user} />
            ))}
          </datalist>
          {errorLine}
          <AuthButton variant="quiet" type="submit" disabled={busy || email.trim() === ""}>
            {busy ? "Sending…" : "Send code"}
          </AuthButton>
          <p id={`${ids}-note`} className="text-center text-[0.875rem] text-ink-3">
            Development only. The test users get the code 424242.
          </p>
        </form>
      ) : (
        <form className="flex flex-col gap-3 pt-5" onSubmit={verifyCode} noValidate>
          <p className="text-center text-[0.9375rem] text-ink-3">
            Enter the code sent to
            <span className="block text-ink-2 [overflow-wrap:anywhere]">{step.email}</span>
          </p>
          <label htmlFor={`${ids}-code`} className="sr-only">
            Code
          </label>
          <input
            id={`${ids}-code`}
            className="auth-field text-center tracking-[0.2em] tabular-nums"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="Code"
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
            aria-invalid={error !== null}
            aria-describedby={error === null ? undefined : errorId}
            autoFocus
          />
          {errorLine}
          <AuthButton variant="quiet" type="submit" disabled={busy || code.length < 6}>
            {busy ? "Signing in…" : "Sign in"}
          </AuthButton>
          <button
            type="button"
            className="auth-quiet-link mx-auto"
            onClick={() => {
              setError(null);
              setStep({ name: "email" });
            }}
          >
            Use another email
          </button>
        </form>
      )}
    </MorphHeight>
  );
}
