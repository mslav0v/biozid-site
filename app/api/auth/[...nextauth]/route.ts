import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        username: { label: "Потребител", type: "text" },
        password: { label: "Парола", type: "password" }
      },
      async authorize(credentials) {
        // Проверка дали променливите в .env съществуват
        if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
          console.error("ГРЕШКА: Липсват ADMIN_USERNAME или ADMIN_PASSWORD в .env файла!");
          return null;
        }

        // Логика за сравняване
        if (
          credentials?.username === process.env.ADMIN_USERNAME && 
          credentials?.password === process.env.ADMIN_PASSWORD
        ) {
          // Данните съвпадат - създаваме сесия
          return { 
            id: "1", 
            name: "Admin Biozid", 
            email: "admin@biozid.bg" 
          };
        }

        // Ако не съвпадат - отказваме достъп
        return null;
      }
    })
  ],
  pages: {
    signIn: "/login", 
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };