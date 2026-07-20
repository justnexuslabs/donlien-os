import { NextResponse } from "next/server";
import {
  adminLoginSchema,
  assertSameOrigin,
  compareSecret,
  createAdminSession,
  getClientKey,
  logEvent,
  rateLimit,
} from "@/lib/security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await assertSameOrigin())) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  const limited = await rateLimit(await getClientKey("admin"), 5, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many failed attempts." }, { status: 429 });
  }

  if (!process.env.ADMIN_ACCESS_CODE || process.env.ADMIN_ACCESS_CODE.length < 32) {
    logEvent("admin_missing_or_weak_code");
    return NextResponse.json({ error: "Admin authentication is not production-configured." }, { status: 503 });
  }

  const parsed = adminLoginSchema.safeParse(await request.json());
  if (!parsed.success || !compareSecret(parsed.data.accessCode, process.env.ADMIN_ACCESS_CODE)) {
    logEvent("admin_login_failed");
    return NextResponse.json({ error: "Access denied." }, { status: 401 });
  }

  await createAdminSession();
  logEvent("admin_login_success");
  return NextResponse.json({ ok: true });
}
