import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  callbacks: {
    authorized: async ({ auth }) => {
      // Logged in users are authenticated, otherwise redirect to login page
      return !!auth;
    },
    async signIn({ user }) {
      // LA REGLA DE ORO:
      // Solo deja pasar si el email es exactamente el del admin
      const isAllowedToSignIn = user.email === "sion.rivas489@gmail.com";

      if (isAllowedToSignIn) {
        return true;
      } else {
        // Retorna false para denegar el acceso
        return false;
      }
    },
  },
});
