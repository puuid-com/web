export type RateLimit = {
  requests: number;
  windowMs: number;
};

export type RateLimitEndpointConfig = {
  limits: RateLimit[];
};

type RequestRecord = {
  timestamp: number;
};

export class RateLimiterError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class RateLimiterService<T extends string = any> {
  private requestHistory: Map<T, RequestRecord[]> = new Map();
  private endpointConfigs: Map<T, RateLimitEndpointConfig> = new Map();
  private defaultLimits: RateLimit[];

  constructor(defaultLimits: RateLimit[] = []) {
    this.defaultLimits = this.normalizeAndDedupe(defaultLimits);
  }

  setDefaultLimits(limits: RateLimit[]) {
    this.defaultLimits = this.normalizeAndDedupe(limits);
  }

  configure(endpoint: T, limits: RateLimit[]) {
    const merged = this.mergeWithDefaults(limits);
    this.endpointConfigs.set(endpoint, { limits: merged });
  }

  ensureRateLimit(endpoint: T): void {
    const config = this.getEffectiveConfig(endpoint);
    if (config.limits.length === 0) {
      this.record(endpoint, Date.now());
      return;
    }

    const now = Date.now();
    const history = this.requestHistory.get(endpoint) || [];

    const maxWindow = Math.max(...config.limits.map((l) => l.windowMs));
    const cleanedHistory = history.filter((r) => now - r.timestamp < maxWindow);
    this.requestHistory.set(endpoint, cleanedHistory);

    for (const limit of config.limits) {
      const windowStart = now - limit.windowMs;
      const requestsInWindow = cleanedHistory.filter(
        (r) => r.timestamp >= windowStart
      ).length;

      if (requestsInWindow >= limit.requests) {
        const windowSeconds = limit.windowMs / 1000;

        console.error(
          `[RateLimiter] Rate limit exceeded for ${endpoint}: ${requestsInWindow}/${limit.requests} requests in ${windowSeconds}s window`
        );

        throw new RateLimiterError(
          `(Internal) Rate limit exceeded for ${endpoint}: ${requestsInWindow}/${limit.requests} requests in ${windowSeconds}s window`
        );
      }
    }

    this.record(endpoint, now);
  }

  private record(endpoint: T, timestamp: number) {
    const history = this.requestHistory.get(endpoint) || [];
    history.push({ timestamp });
    this.requestHistory.set(endpoint, history);
  }

  private getEffectiveConfig(endpoint: T): RateLimitEndpointConfig {
    const configured = this.endpointConfigs.get(endpoint);
    if (!configured) {
      return { limits: this.defaultLimits };
    }
    return { limits: this.mergeWithDefaults(configured.limits) };
  }

  private mergeWithDefaults(limits: RateLimit[] = []): RateLimit[] {
    return this.normalizeAndDedupe([...this.defaultLimits, ...limits]);
  }

  private normalizeAndDedupe(limits: RateLimit[]): RateLimit[] {
    const byWindow = new Map<number, number>();
    for (const l of limits) {
      const prev = byWindow.get(l.windowMs);
      if (prev == null || l.requests < prev) {
        byWindow.set(l.windowMs, l.requests);
      }
    }
    return Array.from(byWindow.entries())
      .map(([windowMs, requests]) => ({ windowMs, requests }))
      .sort((a, b) => a.windowMs - b.windowMs);
  }
}

export type TimeWindow =
  | `${number} second`
  | `${number} seconds`
  | `${number} minute`
  | `${number} minutes`
  | `${number} hour`
  | `${number} hours`;

export function parseRateLime(
  rateLimitStr: `${number} requests every ${TimeWindow}`
): RateLimit {
  const [requests, timeWindowStr] = rateLimitStr.split(" requests every ");
  return {
    requests: Number(requests),
    windowMs: parseTimeWindow(timeWindowStr as TimeWindow),
  };
}

export function parseTimeWindow(timeStr: TimeWindow): number {
  const match = timeStr.match(/(\d+)\s*(second|minute|hour)s?/i);
  if (!match || match.length < 3)
    throw new Error(`Invalid time format: ${timeStr}`);

  const value = Number.parseInt(match[1]!);
  const unit = match[2]!.toLowerCase();

  switch (unit) {
    case "second":
      return value * 1000;
    case "minute":
      return value * 60 * 1000;
    case "hour":
      return value * 60 * 60 * 1000;
    default:
      throw new Error(`Unsupported time unit: ${unit}`);
  }
}
