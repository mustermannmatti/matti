import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = (auth?.user as { role?: string })?.role;
      const isOnPOS = nextUrl.pathname.startsWith("/pos");
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");

      const isOnOnboarding = nextUrl.pathname.startsWith("/onboarding");

      if (!isLoggedIn) {
        if (isOnPOS || isOnDashboard || isOnOnboarding) return false;
        return true;
      }

      // Redirect merchants away from consumer dashboard
      if (isOnDashboard && role === "merchant") {
        return Response.redirect(new URL("/pos", nextUrl));
      }

      // Redirect consumers away from merchant POS and onboarding
      if (isOnPOS && role === "consumer") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      if (isOnOnboarding && role === "consumer") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
};
