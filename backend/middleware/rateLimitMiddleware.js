const createRateLimiter = ({
  windowMs,
  maxRequests,
  message,
}) => {
  const requestsByKey = new Map();

  const resolveClientKey = (req) => {
    const rawIp = req.ip || req.socket.remoteAddress || "unknown";

    // Normalize localhost IPv6/IPv4 mapped formats to a stable key.
    return String(rawIp).replace("::ffff:", "");
  };

  return (req, res, next) => {
    const key = resolveClientKey(req);
    const now = Date.now();
    const windowStart = now - windowMs;

    const history = requestsByKey.get(key) || [];
    const recentHistory = history.filter((timestamp) => timestamp > windowStart);
    const resetAtMs = recentHistory.length > 0 ? recentHistory[0] + windowMs : now + windowMs;
    const resetAfterSeconds = Math.max(1, Math.ceil((resetAtMs - now) / 1000));

    res.setHeader("X-RateLimit-Limit", maxRequests);
    const remainingRequests = Math.max(0, maxRequests - recentHistory.length - 1);
    res.setHeader("X-RateLimit-Remaining", remainingRequests);
    res.setHeader("X-RateLimit-Reset", resetAfterSeconds);

    if (recentHistory.length >= maxRequests) {
      const retryAfterSeconds = resetAfterSeconds;
      res.setHeader("Retry-After", retryAfterSeconds);
      return res.status(429).json({
        message,
        retryAfterSeconds,
      });
    }

    recentHistory.push(now);
    requestsByKey.set(key, recentHistory);
    return next();
  };
};

const authRateLimiter = createRateLimiter({
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000),
  maxRequests: Number(process.env.AUTH_RATE_LIMIT_MAX || 10),
  message: "Too many authentication attempts. Please try again later.",
});

module.exports = {
  createRateLimiter,
  authRateLimiter,
};
