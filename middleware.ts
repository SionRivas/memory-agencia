import { auth } from "@/auth";

export default auth((req) => {
  const pathname = req.nextUrl.pathname;

  if (pathname === "/admin" && !req.auth) {
    const newUrl = new URL("/signin", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }

  if (pathname === "/signin" && req.auth) {
    const newUrl = new URL("/admin", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }
});
