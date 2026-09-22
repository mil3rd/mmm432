"use client";

import { SessionProvider } from "next-auth/react";

// signOut() and useSession() in the nav need this context. It's a client
// boundary, so it's kept in its own file rather than making the whole
// admin layout a client component.
export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
