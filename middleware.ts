import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    // Успешно оторизиран потребител - продължава към админ страницата
    return NextResponse.next();
  },
  {
    callbacks: {
      // Страницата се достъпва само ако има валиден JWT токен
      authorized: ({ token }) => !!token,
    },
    pages: {
      // При липса на токен, автоматично пренасочва към страницата за вход
      signIn: "/login",
    },
  }
);

// Защитаваме главния /admin и всички негови подмаршрути
export const config = { 
  matcher: ["/admin", "/admin/:path*"] 
};