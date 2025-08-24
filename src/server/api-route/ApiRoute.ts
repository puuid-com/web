import { lolClient } from "@/client/lib/lolClient";
import { RiotAPIRateLimiter } from "@/server/api-route/riot/RiotRateLimiter";
import { type Options } from "ky";
import * as v from "valibot";

type Schema = v.BaseSchema<any, any, any>;

const keys = RiotAPIRateLimiter.getKeys();

export type ApiRouteConfigs<S extends Schema, P> = {
  key: (typeof keys)[number];
  schema: S;
  getUrl: (p: P) => string;
};

export class RiotApiRoute<S extends Schema, P> {
  readonly configs: ApiRouteConfigs<S, P>;

  constructor(cfg: ApiRouteConfigs<S, P>) {
    this.configs = cfg;
  }

  protected async ensureRateLimit() {
    await RiotAPIRateLimiter.acquireOrWait(this.configs.key);
  }

  protected async fetchData(param: P, options?: Options) {
    options = {
      method: "get",
      ...(options ?? {}),
    };

    const url = this.configs.getUrl(param);

    try {
      return await lolClient()(url, options).json();
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  }

  protected parseData(data: any) {
    return v.parse(this.configs.schema, data, { abortEarly: true });
  }

  public async call(param: P, options?: Options): Promise<v.InferOutput<S>> {
    await this.ensureRateLimit();

    try {
      const data = await this.fetchData(param, options);

      return this.parseData(data);
    } catch (e) {
      console.error(e);

      process.exit(1);

      throw e;
    }
  }
}
