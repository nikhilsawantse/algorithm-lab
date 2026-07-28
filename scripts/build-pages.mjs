import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const clientDirectory = path.join(root, "dist", "client");
const pagesDirectory = path.join(root, "dist-pages");
const siteBase = "/algorithm-lab";
const siteOrigin = "https://nikhilsawantse.github.io";
const routes = ["/", "/sorting/bubble-sort", "/glossary"];

await rm(pagesDirectory, { recursive: true, force: true });
await mkdir(pagesDirectory, { recursive: true });
await cp(clientDirectory, pagesDirectory, { recursive: true });

const workerUrl = pathToFileURL(path.join(root, "dist", "server", "index.js"));
workerUrl.searchParams.set("pages-build", `${process.pid}-${Date.now()}`);
const { default: worker } = await import(workerUrl.href);

async function assetResponse(request) {
  const requestUrl = new URL(request.url);
  const assetPath = requestUrl.pathname.replace(`${siteBase}/`, "").replace(/^\//, "");

  try {
    return new Response(await readFile(path.join(clientDirectory, assetPath)));
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

async function renderRoute(route) {
  const response = await worker.fetch(
    new Request(`${siteOrigin}${route}`, { headers: { accept: "text/html", host: "nikhilsawantse.github.io" } }),
    { ASSETS: { fetch: assetResponse } },
    { waitUntil() {}, passThroughOnException() {} },
  );

  if (!response.ok) {
    throw new Error(`Could not render ${route}: ${response.status} ${response.statusText}`);
  }

  const html = (await response.text()).replace(
    /(?:href|src)="\/(?!\/|algorithm-lab(?:\/|"))/g,
    (reference) => reference.replace('="/', `="${siteBase}/`),
  );
  const invalidRootReference = /(?:href|src)="\/(?!\/|algorithm-lab(?:\/|"))/.exec(html);

  if (invalidRootReference) {
    throw new Error(`Found a root-relative URL that bypasses ${siteBase}: ${invalidRootReference[0]}`);
  }

  const outputDirectory = route === "/" ? pagesDirectory : path.join(pagesDirectory, route.slice(1));
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(path.join(outputDirectory, "index.html"), html);

  return html;
}

const renderedPages = [];
for (const route of routes) renderedPages.push(await renderRoute(route));

await writeFile(path.join(pagesDirectory, ".nojekyll"), "");
await writeFile(path.join(pagesDirectory, "404.html"), renderedPages[0]);

console.log(`Generated ${routes.length} GitHub Pages routes in ${pagesDirectory}`);
