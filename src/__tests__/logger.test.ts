import { describe, it, expect, vi } from "vitest"
import { logger } from "@/lib/logger"

describe("logger", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("logs info messages", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {})
    logger.info("teste info")
    expect(spy).toHaveBeenCalled()
    expect(spy.mock.calls[0][0]).toContain("[INFO]")
    expect(spy.mock.calls[0][0]).toContain("teste info")
  })

  it("logs error messages", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    logger.error("teste error", { code: 500 })
    expect(spy).toHaveBeenCalled()
    expect(spy.mock.calls[0][0]).toContain("[ERROR]")
    expect(spy.mock.calls[0][0]).toContain('"code":500')
  })

  it("logs warning messages", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {})
    logger.warn("aviso")
    expect(spy).toHaveBeenCalled()
    expect(spy.mock.calls[0][0]).toContain("[WARN]")
  })

  it("includes timestamp in log messages", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {})
    logger.info("com timestamp")
    const logMsg = spy.mock.calls[0][0] as string
    expect(logMsg).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)
  })
})
