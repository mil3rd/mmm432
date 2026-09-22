import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// This app has exactly one user: Mild. Rather than a full user table,
// her login is two env vars — ADMIN_USERNAME and a bcrypt hash of her
// password (ADMIN_PASSWORD_HASH). See the README for how to generate
// the hash.
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    CredentialsProvider({
      name: "Admin",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        // If either env var is missing the account doesn't exist, so nothing
        // can sign in. Without this a misconfigured deploy would compare
        // against undefined and hand out a session on an empty password.
        const expectedUsername = process.env.ADMIN_USERNAME;
        const expectedHash = process.env.ADMIN_PASSWORD_HASH;
        if (!expectedUsername || !expectedHash) return null;

        const usernameMatches = credentials.username === expectedUsername;
        const passwordMatches = await bcrypt.compare(credentials.password, expectedHash);

        if (usernameMatches && passwordMatches) {
          return { id: "admin", name: expectedUsername };
        }
        return null;
      },
    }),
  ],
};
