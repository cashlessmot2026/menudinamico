import '@testing-library/jest-dom/vitest'

class IO {
  constructor(cb) { this.cb = cb }
  observe(el) { this.cb([{ isIntersecting: true, target: el }]) }
  unobserve() {}
  disconnect() {}
}
globalThis.IntersectionObserver = globalThis.IntersectionObserver || IO
