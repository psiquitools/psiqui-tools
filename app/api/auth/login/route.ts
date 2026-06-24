import { NextRequest, NextResponse } from "next/server";

const VALID_USER = process.env.AUTH_USER ?? "juanma";
const VALID_PASS = process.env.AUTH_PASS ?? "juanma";
const COOKIE_VALUE = process.env.SESSION_SECRET ?? "psiqui-ok";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (username !== VALID_USER || password !== VALID_PASS) {
    return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("psiqui_session", COOKIE_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 días
  });
  return res;
}
