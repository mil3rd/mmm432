import { withAuth } from "next-auth/middleware";

// Gates every /admin route behind a session.
//
// The `pages.signIn` option is load-bearing, not decoration: NextAuth's
// middleware skips the gate for whichever path is named here. Without it the
// option defaults to /api/auth/signin, leaving /admin/login itself gated —
// so an unauthenticated visitor bounces between the two forever.
export default withAuth({
  pages: { signIn: "/admin/login" },
});

export const config = {
  matcher: ["/admin/:path*"],
};
