import { createServer } from "node:http";
import { createReadStream, existsSync } from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "dist");
const port = Number(process.env.PORT) || 4173;
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

createServer((request, response) => {
  const urlPath = decodeURIComponent(new URL(request.url, `http://localhost:${port}`).pathname);
  const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(root, safePath === "/" ? "index.html" : safePath);
  const target = existsSync(filePath) ? filePath : path.join(root, "index.html");
  response.setHeader("Content-Type", types[path.extname(target)] || "application/octet-stream");
  createReadStream(target).pipe(response);
}).listen(port, () => {
  console.log(`Music Monetization running at http://localhost:${port}`);
});
