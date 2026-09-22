export { default } from "next-auth/middleware";

export const config = {
  // Protects everything under /admin except /admin/login (NextAuth's
  // middleware already lets the sign-in page itself through).
  matcher: ["/admin/:path*"],
};
