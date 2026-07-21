import { tasks } from "@trigger.dev/sdk";
import type { helloWorldTask } from "@/src/trigger/example";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { message?: string };

  const handle = await tasks.trigger<typeof helloWorldTask>("hello-world", {
    message: body.message ?? "Hello from my app!",
  });

  return Response.json({ id: handle.id });
}
