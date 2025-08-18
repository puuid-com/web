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

  configure(endpoint: T, limits: RateLimit[]) {
    this.endpointConfigs.set(endpoint, { limits });
  }

  configureAll(configurations: Record<T, { limits: RateLimit[] }>) {
    Object.entries(configurations).forEach(([key, value]) => {
      const _key = key as T;
      const _value = value as { limits: RateLimit[] };

      this.endpointConfigs.set(_key, _value);
    });
  }

  ensureRateLimit(endpoint: T): void {
    const config = this.endpointConfigs.get(endpoint)!;

    const now = Date.now();
    const history = this.requestHistory.get(endpoint) || [];

    // Clean old requests outside all windows
    const maxWindow = Math.max(...config.limits.map((limit) => limit.windowMs));
    const cleanedHistory = history.filter(
      (record) => now - record.timestamp < maxWindow
    );
    this.requestHistory.set(endpoint, cleanedHistory);

    // Check each rate limit
    for (const limit of config.limits) {
      const windowStart = now - limit.windowMs;
      const requestsInWindow = cleanedHistory.filter(
        (record) => record.timestamp >= windowStart
      ).length;

      if (requestsInWindow >= limit.requests) {
        const windowSeconds = limit.windowMs / 1000;

        throw new RateLimiterError(
          `Rate limit exceeded for ${endpoint}: ${requestsInWindow}/${limit.requests} requests in ${windowSeconds}s window`
        );
      }
    }

    // Record this request
    cleanedHistory.push({ timestamp: now });
    this.requestHistory.set(endpoint, cleanedHistory);
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
