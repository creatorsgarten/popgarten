import { SignJWT } from "jose";
import { parseArgs } from "node:util";
import { ofetch } from "ofetch";
import { getEventProcessedContent } from "./getEventProcessedContent";

async function main() {
  const args = parseArgs({
    args: process.argv.slice(2),
    strict: true,
    allowPositionals: true,
    options: {
      test: { type: "boolean" },
    },
  });
  const slug = args.positionals[0];
  if (!slug) {
    console.error("No slug provided");
    return;
  }
  const processedContent = await getEventProcessedContent(slug);
  const { eventId, description } = processedContent;
  if (args.values.test) {
    console.warn("Test mode, skipping update");
    console.log("Event ID:", eventId);
    console.log("Description:");
    console.log(description);
    return;
  }
  if (!eventId) {
    console.error("No event ID found");
    return;
  }
  const jwt = await new SignJWT({ eventId, organizerId: 1017 })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .setIssuedAt()
    .setIssuer("popgarten")
    .sign(new TextEncoder().encode(Bun.env["EVENT_POPPER_JWT_SECRET"]));
  console.log("Updating event", `https://eventpop.me/e/${eventId}`);
  const result = await ofetch(Bun.env["EVENT_POPPER_URL"]!, {
    method: "POST",
    body: {
      description,
      apiKey: jwt,
    },
  });
  console.log("Update result:", result);
}

await main();
