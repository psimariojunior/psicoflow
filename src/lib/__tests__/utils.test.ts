import { describe, it, expect } from "vitest"
import { cn, formatCurrency, formatDate, getInitials, calculateAge } from "../utils"

describe("cn", () => {
  it("merges classes correctly", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2")
    expect(cn("px-4", false && "hidden")).toBe("px-4")
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500")
  })
})

describe("formatCurrency", () => {
  it("formats BRL currency", () => {
    const result = formatCurrency(1500.5)
    expect(result).toContain("1.500")
    expect(result).toContain("R$")
  })

  it("handles zero", () => {
    expect(formatCurrency(0)).toContain("0")
  })
})

describe("formatDate", () => {
  it("formats a date string", () => {
    const result = formatDate("2024-06-15T10:00:00Z")
    expect(result).toBeTruthy()
  })
})

describe("getInitials", () => {
  it("returns initials from full name", () => {
    expect(getInitials("João Silva")).toBe("JS")
  })

  it("handles single name", () => {
    expect(getInitials("Maria")).toBe("M")
  })

  it("handles empty", () => {
    expect(getInitials("")).toBe("")
  })
})

describe("calculateAge", () => {
  it("calculates age from birth date", () => {
    const birth = new Date()
    birth.setFullYear(birth.getFullYear() - 25)
    expect(calculateAge(birth.toISOString())).toBe(25)
  })
})
