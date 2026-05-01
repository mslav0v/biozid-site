// proxy.ts (предишно middleware.ts)
import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";

// Използваме стандартна функция, за да е доволен Turbopack
export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = { 
  matcher: ["/admin/:path*"] 
};