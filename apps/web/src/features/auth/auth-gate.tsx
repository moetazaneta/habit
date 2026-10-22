import { useAuth } from "@habit/data";
import type { ReactNode } from "react";

import { AuthScreen } from "@/features/auth/auth-screen";
import { NoAccessScreen } from "@/features/auth/no-access";
import { SignInScreen } from "@/features/auth/sign-in";

/**
 * Shows the app to the owner only. The other states of the sign-in get their own screen: a quiet
 * loading frame, the sign-in, or "no access".
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const auth = useAuth();
  switch (auth.status) {
    case "loading":
      return <AuthLoading />;
    case "signedOut":
      return <SignInScreen signIn={auth.signIn} emailCode={auth.emailCode} />;
    case "noAccess":
      return <NoAccessScreen userId={auth.userId} signOut={auth.signOut} />;
    case "ready":
      return children;
  }
}

/**
 * While the sign-in state loads: the bare ground, so a fast start goes straight to its screen
 * without a flash. A slow start fades in the empty mark after a second, where the sign-in screen
 * will draw it.
 */
function AuthLoading() {
  return (
    <div className="auth-loading" aria-busy="true">
      <span className="sr-only" role="status">
        Loading
      </span>
      <AuthScreen filled={false} />
    </div>
  );
}
