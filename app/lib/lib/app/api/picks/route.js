import { generateDailyPicks } from "../../../lib/algorithm.js";

export const revalidate = 300;

export async function GET() {
  try {
    const data = await generateDailyPicks();
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: String(err.message || err), picks: [] }, { status: 500 });
  }
}
