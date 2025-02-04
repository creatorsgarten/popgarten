import { load } from "cheerio";
import { ofetch } from "ofetch";

export async function getEventProcessedContent(slug: string) {
  const baseUrl = `https://creatorsgarten.org/event/${slug}`;
  const url = `https://creatorsgarten.org/event/${slug}?embed=true`;
  const html = await ofetch(url);
  const processedContent = processContent(html, baseUrl);
  return processedContent;
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
  $content.find("h3").addClass("mt-4 h4");
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
