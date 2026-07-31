import { NextResponse } from "next/server";

export async function POST() {
  const origin =
    process.env.LIEN_WEBSITE_URL ||
    process.env.URL ||
    "https://donlien.xyz";
  const response = NextResponse.redirect(new URL("/lien-id", origin), 303);
  response.cookies.delete("lien_session");
  return response;
}
