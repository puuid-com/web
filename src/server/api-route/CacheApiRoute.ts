import { ApiRoute, type ApiRouteConfigs } from "@/server/api-route/ApiRoute";
import { CacheService } from "@/server/services/cache/CacheService";
import type { Options } from "ky";
import * as v from "valibot";

type Schema = v.BaseSchema<any, any, any>;

export type CachedApiRouteConfigs<S extends Schema, P> = ApiRouteConfigs<
  S,
  P
> & {
  R2Dir: string;
};

export type CachedApiRouteParams = {
  id: string;
};

export class CachedApiRoute<
  S extends Schema,
  P extends CachedApiRouteParams,
> extends ApiRoute<S, P> {
  readonly R2Dir: string;

  constructor(cfg: CachedApiRouteConfigs<S, P>) {
    super(cfg);

    this.R2Dir = cfg.R2Dir;
  }

  override async call(
    param: P,
    options?: Options,
    refreshCache: boolean = false
  ): Promise<v.InferOutput<S>> {
    try {
      const r2Cache = refreshCache
        ? null
        : await this.tryGetCachedDataById(param.id);

      if (r2Cache) return this.parseData(r2Cache);

      this.ensureRateLimit();

      const data = await this.fetchData(param, options);

      const parsedData = this.parseData(data);

      await CacheService.saveToCache(param.id, data, this.R2Dir);

      return parsedData;
    } catch (e) {
      console.error(e);

      process.exit(0);

      throw e;
    }
  }

  public tryGetCachedDataById(id: string): Promise<v.InferOutput<S>> {
    return CacheService.tryGetFileFromCache<v.InferOutput<S>>(id, this.R2Dir);
  }
}
