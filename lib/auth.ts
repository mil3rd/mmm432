import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// This app has exactly one user: Mild. Rather than a full user table,
// her login is two env vars — ADMIN_EMAIL and a bcrypt hash of her
// password (ADMIN_PASSWORD_HASH). See the README for how to generate
// the hash.
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    CredentialsProvider({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const emailMatches = credentials.email === process.env.ADMIN_EMAIL;
        const passwordMatches = await bcrypt.compare(
          credentials.password,
          process.env.ADMIN_PASSWORD_HASH ?? ""
        );

        if (emailMatches && passwordMatches) {
          return { id: "admin", email: credentials.email, name: "Mild" };
        }
        return null;
      },
    }),
  ],
};
