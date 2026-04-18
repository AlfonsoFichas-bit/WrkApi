import { vi } from "vitest";

// Mock Bun global
(globalThis as any).Bun = {
	password: {
		hash: vi.fn().mockResolvedValue("hashed-password"),
		verify: vi.fn().mockResolvedValue(true),
	},
};

vi.mock("hono/jwt", () => ({
	verify: vi.fn().mockImplementation(async (token) => {
		if (token.includes("invalid")) {
			throw new Error("Invalid token");
		}
		return { id: "test-user-id", globalRole: "ADMIN" };
	}),
	sign: vi.fn().mockResolvedValue("mocked-token"),
}));
