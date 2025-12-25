// src/lib/__tests__/rateLimiter.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { RateLimiter } from "../rateLimiter";

describe("RateLimiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should execute a function immediately if the queue is empty", async () => {
    const rateLimiter = new RateLimiter(100);
    const fn = vi.fn().mockResolvedValue("test");

    const promise = rateLimiter.execute(fn);
    await vi.advanceTimersToNextTimerAsync();

    await expect(promise).resolves.toBe("test");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should queue functions and execute them sequentially", async () => {
    const rateLimiter = new RateLimiter(100);
    const fn1 = vi.fn().mockResolvedValue("first");
    const fn2 = vi.fn().mockResolvedValue("second");

    const p1 = rateLimiter.execute(fn1);
    const p2 = rateLimiter.execute(fn2);

    await vi.advanceTimersToNextTimerAsync();
    await p1;
    expect(fn1).toHaveBeenCalledTimes(1);
    expect(fn2).not.toHaveBeenCalled();

    await vi.advanceTimersToNextTimerAsync();
    await p2;
    expect(fn2).toHaveBeenCalledTimes(1);
  });

  it("should respect the minInterval between requests", async () => {
    const rateLimiter = new RateLimiter(100);
    const fn1 = vi.fn().mockResolvedValue("first");
    const fn2 = vi.fn().mockResolvedValue("second");
    const startTime = Date.now();

    const p1 = rateLimiter.execute(fn1);
    const p2 = rateLimiter.execute(fn2);

    await vi.advanceTimersToNextTimerAsync();
    await p1;
    const timeAfterFirst = Date.now();
    expect(timeAfterFirst - startTime).toBeLessThan(100);

    await vi.advanceTimersByTimeAsync(100);
    await p2;
    const timeAfterSecond = Date.now();
    expect(timeAfterSecond - timeAfterFirst).toBeGreaterThanOrEqual(100);
  });

  it("should retry a failed function up to maxRetries", async () => {
    const rateLimiter = new RateLimiter(100, 3, 10);
    const error = new Error("Failed");
    const fn = vi
      .fn()
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
      .mockResolvedValue("success");

    const promise = rateLimiter.execute(fn);

    await vi.advanceTimersToNextTimerAsync(); // First attempt
    await vi.advanceTimersToNextTimerAsync(); // First retry
    await vi.advanceTimersToNextTimerAsync(); // Second retry

    await expect(promise).resolves.toBe("success");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("should reject after all retries have failed", async () => {
    const rateLimiter = new RateLimiter(100, 2, 10);
    const error = new Error("Failed");
    const fn = vi.fn().mockRejectedValue(error);

    const promise = rateLimiter.execute(fn);

    await vi.advanceTimersToNextTimerAsync(); // First attempt
    await vi.advanceTimersToNextTimerAsync(); // First retry
    await vi.advanceTimersToNextTimerAsync(); // Second retry

    await expect(promise).rejects.toThrow("Failed");
    expect(fn).toHaveBeenCalledTimes(3);
  });
});
