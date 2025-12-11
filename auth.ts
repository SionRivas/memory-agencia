import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Lista de correos autorizados para acceso administrativo
const AUTHORIZED_EMAILS = [
  "sion.rivas489@gmail.com",
  "oseas22castillo@gmail.com",
];

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
      // Solo deja pasar si el email está en la lista de autorizados
      const isAllowedToSignIn = AUTHORIZED_EMAILS.includes(user.email || "");

      if (isAllowedToSignIn) {
        return true;
      } else {
        // Retorna false para denegar el acceso
        return false;
      }
    },
  },
});
