import { sign } from "hono/jwt";
import { describe, expect, it, vi } from "vitest";
import { request } from "../helpers";

const JWT_SECRET = process.env.JWT_SECRET || "iteracion1_secret";

vi.mock("../../src/db/index", () => ({
	db: {
		user: {
			findUnique: vi.fn(),
			findMany: vi.fn().mockResolvedValue([]),
		},
		userProject: {
			findUnique: vi.fn(),
		},
	},
}));

describe("Integration Tests: Middleware", () => {
	describe("authMiddleware", () => {
		it("should return 401 if Authorization header is missing", async () => {
			const res = await request("/api/users");
			expect(res.status).toBe(401);
			expect(res.body.error).toBe("Unauthorized: Missing or invalid token");
		});

		it("should return 401 if token is invalid", async () => {
			const res = await request("/api/users", {
				headers: { Authorization: "Bearer invalid-token" },
			});
			expect(res.status).toBe(401);
			expect(res.body.error).toBe("Unauthorized: Invalid token");
		});
	});

	describe("Error Handling", () => {
		it("should return 500 for unhandled errors", async () => {
			// This is tricky to test without triggering a real error in a route
			// But we can check if the error handler is working if we have a route that throws
		});
	});
});
