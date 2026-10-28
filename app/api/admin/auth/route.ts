export async function POST(req: Request): Promise<Response> {
  const { pin } = await req.json();
  const ADMIN_PIN = process.env.ADMIN_PIN ?? "1234";
  if (pin === ADMIN_PIN) {
    return Response.json({ ok: true });
  }
  return Response.json({ ok: false }, { status: 401 });
}
