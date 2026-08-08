import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Dukyoung alumni homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>덕영고등학교 총동문회<\/title>/);
  assert.match(html, /덕영고등학교 총동문회/);
  assert.match(html, /덕영고등학교를 소개합니다/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/);
});

test("keeps Dukyoung branding in project metadata", async () => {
  const [page, layout, config, shell] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../vite.config.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/_components/site-shell.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /applicationName:\s*"Dukyoung"/);
  assert.match(layout, /creator:\s*"Dukyoung"/);
  assert.match(layout, /publisher:\s*"Dukyoung"/);
  assert.match(shell, /DUKYOUNG HIGH SCHOOL ALUMNI ASSOCIATION/);
  assert.match(config, /usePolling:\s*true/);
  assert.doesNotMatch(`${page}\n${layout}\n${shell}`, /Starter Project|Your site is taking shape/);
});

test("renders the separated association, school-news, department and member pages", async () => {
  const routes = [
    "/association",
    "/school-news",
    "/departments",
    "/departments/management-accounting",
    "/departments/health-nursing",
    "/departments/big-data",
    "/departments/graphic-software",
    "/departments/ai-software",
    "/departments/security-software",
    "/login",
    "/register",
    "/mypage",
    "/admin",
  ];

  const responses = await Promise.all(routes.map((route) => render(route)));
  for (const [index, response] of responses.entries()) {
    assert.equal(response.status, 200, `${routes[index]} should render`);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  }

  assert.match(await responses[1].text(), /학교 소식/);
  assert.match(await responses[2].text(), /6개 특성화 학과/);
  assert.match(await responses[7].text(), /인공지능소프트웨어과/);
  assert.match(await responses[9].text(), /동문회원 로그인/);
  assert.match(await responses[10].text(), /동문회원 가입/);
  assert.match(await responses[12].text(), /관리자 페이지/);
});
