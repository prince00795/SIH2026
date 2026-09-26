export class RateLimiter {
  constructor(rateLimitRps = 1.5, burstCapacity = 2.0, minJitterMs = 50, maxJitterMs = 180) {
    this.rate = rateLimitRps;
    this.capacity = burstCapacity;
    this.tokens = burstCapacity;
    this.lastRefill = Date.now();
    this.minJitterMs = minJitterMs;
    this.maxJitterMs = maxJitterMs;
  }

  refill() {
    const now = Date.now();
    const elapsedSec = (now - this.lastRefill) / 1000;
    if (elapsedSec > 0) {
      this.tokens = Math.min(this.capacity, this.tokens + elapsedSec * this.rate);
      this.lastRefill = now;
    }
  }

  async acquire(tokensRequested = 1.0) {
    while (true) {
      this.refill();
      if (this.tokens >= tokensRequested) {
        this.tokens -= tokensRequested;
        break;
      }
      const needed = tokensRequested - this.tokens;
      const waitMs = (needed / this.rate) * 1000;
      await new Promise(res => setTimeout(res, waitMs));
    }

    // Inject ethical non-linear jitter to prevent periodic burst pulses on target servers
    const jitter = Math.floor(Math.random() * (this.maxJitterMs - this.minJitterMs + 1)) + this.minJitterMs;
    await new Promise(res => setTimeout(res, jitter));
    return jitter;
  }
}
