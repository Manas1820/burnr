import { describe, it, expect } from "vitest";
import {
  isDisposableEmail,
  isDisposableDomain,
  getDisposableDomains,
} from "../src/index.js";

describe("isDisposableEmail", () => {
  it("returns true for known disposable emails", () => {
    expect(isDisposableEmail("user@mailinator.com")).toBe(true);
    expect(isDisposableEmail("test@guerrillamail.com")).toBe(true);
    expect(isDisposableEmail("foo@yopmail.com")).toBe(true);
  });

  it("returns false for legitimate emails", () => {
    expect(isDisposableEmail("user@gmail.com")).toBe(false);
    expect(isDisposableEmail("user@outlook.com")).toBe(false);
    expect(isDisposableEmail("user@yahoo.com")).toBe(false);
  });

  it("handles uppercase", () => {
    expect(isDisposableEmail("USER@MAILINATOR.COM")).toBe(true);
    expect(isDisposableEmail("User@Gmail.com")).toBe(false);
  });

  it("handles whitespace", () => {
    expect(isDisposableEmail("  user@mailinator.com  ")).toBe(true);
  });

  it("returns false for empty input", () => {
    expect(isDisposableEmail("")).toBe(false);
  });

  it("returns false for input with no @", () => {
    expect(isDisposableEmail("not-an-email")).toBe(false);
  });

  it("returns false for @ only", () => {
    expect(isDisposableEmail("@")).toBe(false);
  });

  it("returns false when no local part", () => {
    expect(isDisposableEmail("@mailinator.com")).toBe(false);
  });

  it("returns false when no domain", () => {
    expect(isDisposableEmail("user@")).toBe(false);
  });

  it("returns false when domain has no TLD", () => {
    expect(isDisposableEmail("user@localhost")).toBe(false);
  });

  it("handles multiple @ signs (uses lastIndexOf)", () => {
    expect(isDisposableEmail('"weird@local"@mailinator.com')).toBe(true);
  });
});

describe("isDisposableDomain", () => {
  it("returns true for known disposable domains", () => {
    expect(isDisposableDomain("mailinator.com")).toBe(true);
    expect(isDisposableDomain("guerrillamail.com")).toBe(true);
  });

  it("returns false for legitimate domains", () => {
    expect(isDisposableDomain("gmail.com")).toBe(false);
    expect(isDisposableDomain("outlook.com")).toBe(false);
  });

  it("handles uppercase and whitespace", () => {
    expect(isDisposableDomain("  MAILINATOR.COM  ")).toBe(true);
  });
});

describe("getDisposableDomains", () => {
  it("returns a non-empty array", () => {
    const domains = getDisposableDomains();
    expect(domains.length).toBeGreaterThan(100);
  });

  it("returns a sorted array", () => {
    const domains = getDisposableDomains();
    const sorted = [...domains].sort();
    expect(domains).toEqual(sorted);
  });

  it("returns a new copy each time", () => {
    const a = getDisposableDomains();
    const b = getDisposableDomains();
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });

  it("contains known disposable domains", () => {
    const domains = getDisposableDomains();
    expect(domains).toContain("mailinator.com");
    expect(domains).toContain("guerrillamail.com");
  });

  it("does not contain legitimate domains", () => {
    const domains = getDisposableDomains();
    expect(domains).not.toContain("gmail.com");
    expect(domains).not.toContain("outlook.com");
  });
});
