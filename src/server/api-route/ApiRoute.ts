import { lolClient } from "@/client/lib/lolClient";
import {
  RateLimiterService,
  type RateLimit,
} from "@/server/services/rate-limiter";
import { type Options } from "ky";
import * as v from "valibot";

type Schema = v.BaseSchema<any, any, any>;

const ApiRouteRateLimiter = new RateLimiterService();

export type ApiRouteConfigs<S extends Schema, P> = {
  key: string;
  schema: S;
  getUrl: (p: P) => string;
  limits: RateLimit[];
};

export class ApiRoute<S extends Schema, P> {
  readonly schema: S;
  readonly getUrl: (p: P) => string;
  readonly limits: RateLimit[];
  readonly key: string;

  constructor(cfg: ApiRouteConfigs<S, P>) {
    this.schema = cfg.schema;
    this.getUrl = cfg.getUrl;
    this.limits = cfg.limits;
    this.key = cfg.key;

    ApiRouteRateLimiter.configure(this.key, this.limits);
  }

  protected ensureRateLimit() {
    ApiRouteRateLimiter.ensureRateLimit(this.key);
  }

  protected async fetchData(param: P, options?: Options) {
    options = {
      method: "get",
      ...(options ?? {}),
    };

    const url = this.getUrl(param);

    console.log("🚨🚨 \t", url);

    return lolClient()(url, options).json();
  }

  protected parseData(data: any) {
    return v.parse(this.schema, data, { abortEarly: true });
  }

  public async call(param: P, options?: Options): Promise<v.InferOutput<S>> {
    this.ensureRateLimit();

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
