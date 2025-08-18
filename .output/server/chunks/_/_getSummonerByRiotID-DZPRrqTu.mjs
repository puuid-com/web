import { c as createServerRpc, b as createServerFn, A as AcountV1ByRiotID } from './ssr.mjs';
import { redirect } from '@tanstack/react-router';
import * as v from 'valibot';
import 'react/jsx-runtime';
import '@t3-oss/env-core';
import 'ky';
import 'tiny-invariant';
import 'tiny-warning';
import '@tanstack/router-core';
import '@tanstack/router-core/ssr/client';
import 'node:async_hooks';
import '@tanstack/history';
import '@tanstack/router-core/ssr/server';
import '@tanstack/react-router/ssr/server';

const $getSummonerByRiotID_createServerFn_handler = createServerRpc("src_server_functions_getSummonerByRiotID_ts--_getSummonerByRiotID_createServerFn_handler", "/_serverFn", (opts, signal) => {
  return $getSummonerByRiotID.__executeServer(opts, signal);
});
const $getSummonerByRiotID = createServerFn({
  method: "GET"
}).validator(v.string()).handler($getSummonerByRiotID_createServerFn_handler, async (ctx) => {
  const riotID = ctx.data;
  const [gameName, tagLine] = riotID.split("-");
  if (!gameName || !tagLine) {
    throw redirect({
      to: "/"
    });
  }
  const data = await AcountV1ByRiotID.call({
    gameName,
    tagLine,
    routingValue: "europe"
  });
  return data;
});

export { $getSummonerByRiotID_createServerFn_handler };
//# sourceMappingURL=_getSummonerByRiotID-DZPRrqTu.mjs.map
