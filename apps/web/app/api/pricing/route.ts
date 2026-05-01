import { NextResponse } from "next/server";
import { getActivePlans } from "@/lib/pricing-server";

export const runtime = "nodejs";

export async function GET() {
  const plans = await getActivePlans();
  return NextResponse.json({ plans });
}
