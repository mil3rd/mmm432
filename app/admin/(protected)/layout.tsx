import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import Providers from "@/components/admin/Providers";
import { authOptions } from "@/lib/auth";

export const metadata = {
  title: "Admin — Know Me More",
  // Keep the admin out of search results even if a URL leaks.
  robots: { index: false, follow: false },
};

// (protected) is a route group — it shapes which pages get this layout
// without appearing in the URL. /admin/login sits outside it on purpose:
// if it were inside, the redirect below would send the login page to
// itself forever.
export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // middleware.ts redirects before this runs. This is the backstop that
  // still holds if middleware is ever bypassed.
  if (!session) redirect("/admin/login");

  return (
    <Providers>
      <div className="min-h-screen bg-paper">
        <AdminNav />
        <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
      </div>
    </Providers>
  );
}
