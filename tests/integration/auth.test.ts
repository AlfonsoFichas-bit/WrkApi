import { describe, expect, it, vi, beforeEach } from "vitest";
import { db } from "../../src/db/index";
import { request } from "../helpers";

vi.mock("../../src/db/index", () => ({
	db: {
		user: {
			findUnique: vi.fn(),
		},
	},
}));

describe("Integration Tests: Auth", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("POST /api/auth/login", () => {
		it("should return 401 on invalid credentials (user not found)", async () => {
			(db.user.findUnique as any).mockResolvedValue(null);

			const res = await request("/api/auth/login", {
				method: "POST",
				body: { email: "wrong@test.com", password: "pwd" },
			});

			expect(res.status).toBe(401);
			expect(res.body.error).toBe("Invalid credentials");
		});

		it("should return 401 on invalid credentials (wrong password)", async () => {
			(db.user.findUnique as any).mockResolvedValue({ id: "1", passwordHash: "hashed" });
			// Bun.password.verify is mocked to return true by default in setup.ts, 
			// so we need to mock it to return false here if we want to test failure.
			(globalThis as any).Bun.password.verify.mockResolvedValueOnce(false);

			const res = await request("/api/auth/login", {
				method: "POST",
				body: { email: "test@test.com", password: "wrong" },
			});

			expect(res.status).toBe(401);
		});

		it("should login successfully", async () => {
			(db.user.findUnique as any).mockResolvedValue({ 
				id: "1", 
				email: "test@test.com", 
				passwordHash: "hashed",
				globalRole: "USER"
			});

			const res = await request("/api/auth/login", {
				method: "POST",
				body: { email: "test@test.com", password: "password123" },
			});

			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("token");
		});
	});

	describe("POST /api/auth/recover-password", () => {
		it("should return 200 even if user not found (security)", async () => {
			(db.user.findUnique as any).mockResolvedValue(null);

			const res = await request("/api/auth/recover-password", {
				method: "POST",
				body: { email: "nonexistent@test.com" },
			});

			expect(res.status).toBe(200);
		});

		it("should return 200 if user exists", async () => {
			(db.user.findUnique as any).mockResolvedValue({ id: "1", email: "exists@test.com" });

			const res = await request("/api/auth/recover-password", {
				method: "POST",
				body: { email: "exists@test.com" },
			});

			expect(res.status).toBe(200);
		});

		it("should return 400 if email is missing", async () => {
			const res = await request("/api/auth/recover-password", {
				method: "POST",
				body: {},
			});

			expect(res.status).toBe(400);
		});
	});
});
