// Test utilities for Vitest typings
// Export a shared mock type alias to avoid repeating ReturnType<typeof vi.fn> everywhere.
export type VMock = ReturnType<typeof vi.fn>;
