import { load } from "cheerio";
import { SignJWT } from "jose";
import { parseArgs } from "node:util";
import { ofetch } from "ofetch";

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
  const url = `https://creatorsgarten.org/event/${slug}?embed=true`;
  const baseUrl = `https://creatorsgarten.org/event/${slug}`;
  const html = await ofetch(url);
  const processedContent = processContent(html, baseUrl);
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

function processContent(html: string, baseUrl: string) {
  const $ = load(html);
  const $content = $(".prose");
  let eventId: number | undefined;

  {
    const eventpopLink = $content
      .find('a img[alt="Tickets available at eventpop.me"]')
      .closest("a")
      .attr("href");
    const match = eventpopLink?.match(/e\/(\d+)/);
    if (match) {
      eventId = +match[1];
    }
  }

  $content
    .find('a img[alt="Tickets available at eventpop.me"]')
    .closest("p")
    .remove();
  $content.find("nav").remove();

  $content.find("*").removeAttr("id");
  $content.find("h2").addClass("mt-5 h3 text-heading");
  $content.find("a > span.icon.icon-link").closest("a").remove();
  $content.find("a").each(function () {
    const $a = $(this);
    if ($a.attr("href")) {
      $a.attr("href", new URL($a.attr("href")!, baseUrl).toString()).attr(
        "target",
        "_blank"
      );
    }
  });

  const content = $content.html();
  return { description: content, eventId };
}

await main();
