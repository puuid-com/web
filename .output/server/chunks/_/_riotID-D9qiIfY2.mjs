import { jsxs, jsx } from 'react/jsx-runtime';
import { a as Route } from './ssr.mjs';
import '@tanstack/react-router';
import '@t3-oss/env-core';
import 'valibot';
import 'ky';
import 'tiny-invariant';
import 'tiny-warning';
import '@tanstack/router-core';
import '@tanstack/router-core/ssr/client';
import 'node:async_hooks';
import '@tanstack/history';
import '@tanstack/router-core/ssr/server';
import '@tanstack/react-router/ssr/server';

function RouteComponent() {
  const data = Route.useLoaderData();
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-5", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("h1", { className: "text-3xl", children: [
        /* @__PURE__ */ jsx("span", { children: data.gameName }),
        /* @__PURE__ */ jsxs("span", { className: "text-muted italic", children: [
          "#",
          data.tagLine
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "font-mono bg-neutral-700 rounded-md px-1", children: data.puuid })
    ] }),
    /* @__PURE__ */ jsx("div", {})
  ] });
}

export { RouteComponent as component };
//# sourceMappingURL=_riotID-D9qiIfY2.mjs.map
