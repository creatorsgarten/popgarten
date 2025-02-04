import { getEventProcessedContent } from "./getEventProcessedContent";

export default {
  async fetch(req: Request) {
    const pathname = new URL(req.url).pathname;
    if (pathname === "/") {
      return new Response("Go to /slug to preview the event");
    }
    const match = pathname.match(/^\/([\w]+)$/);
    if (!match) {
      return new Response("Invalid slug");
    }
    const processedContent = await getEventProcessedContent(match[1]);
    const html = `<!DOCTYPE html>
    <html>
      <head>
        <title>${match[1]}</title>
        <link rel="stylesheet" href="https://p-a.popcdn.net/assets/application-178074c211b0f24a979e85edccd296f93d9996bde9593a75a346ec087c120402.css">
      </head>
      <body class="iframe-event-main-content">
        <div class="container">
          ${processedContent.description}
        </div>
      </body>
    </html>`;
    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  },
};
