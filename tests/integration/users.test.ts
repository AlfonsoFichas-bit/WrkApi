import { describe, expect, it, vi, beforeEach } from "vitest";
import { db } from "../../src/db/index";
import { request } from "../helpers";

vi.mock("../../src/db/index", () => ({
	db: {
		user: {
			create: vi.fn(),
			findUnique: vi.fn(),
			findMany: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
		},
	},
}));

describe("Integration Tests: Users", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const adminToken = "Bearer admin-token";

	it("should create a user", async () => {
		(db.user.findUnique as any).mockResolvedValue(null);
		(db.user.create as any).mockResolvedValue({
			id: "1",
			email: "test@test.com",
		});

		const res = await request("/api/users", {
			method: "POST",
			body: { email: "test@test.com", password: "Password123", name: "Test" },
			headers: { Authorization: adminToken },
		});

		expect(res.status).toBe(201);
		expect(res.body.email).toBe("test@test.com");
	});

	it("should return 409 if email already in use", async () => {
		(db.user.findUnique as any).mockResolvedValue({ id: "existing" });

		const res = await request("/api/users", {
			method: "POST",
			body: { email: "test@test.com", password: "Password123", name: "Test" },
			headers: { Authorization: adminToken },
		});

		expect(res.status).toBe(409);
		expect(res.body.error).toBe("Email already in use");
	});

	it("should list all users", async () => {
		(db.user.findMany as any).mockResolvedValue([{ id: "1", email: "u1@test.com" }]);

		const res = await request("/api/users", {
			headers: { Authorization: adminToken },
		});

		expect(res.status).toBe(200);
		expect(Array.isArray(res.body)).toBe(true);
	});

	it("should get a user by ID", async () => {
		(db.user.findUnique as any).mockResolvedValue({ id: "1", email: "u1@test.com" });

		const res = await request("/api/users/1", {
			headers: { Authorization: adminToken },
		});

		expect(res.status).toBe(200);
		expect(res.body.id).toBe("1");
	});

	it("should update a user", async () => {
		(db.user.update as any).mockResolvedValue({ id: "1", name: "Updated" });

		const res = await request("/api/users/1", {
			method: "PUT",
			body: { name: "Updated" },
			headers: { Authorization: adminToken },
		});

		expect(res.status).toBe(200);
		expect(res.body.name).toBe("Updated");
	});

	it("should return 400 if user not found for update", async () => {
		(db.user.update as any).mockRejectedValue(new Error("Not Found"));

		const res = await request("/api/users/1", {
			method: "PUT",
			body: { name: "Updated" },
			headers: { Authorization: adminToken },
		});

		expect(res.status).toBe(400); 
	});

	it("should delete a user", async () => {
		(db.user.delete as any).mockResolvedValue({ id: "1" });

		const res = await request("/api/users/1", {
			method: "DELETE",
			headers: { Authorization: adminToken },
		});

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
	});

	it("should return 404 if user not found for deletion", async () => {
		(db.user.delete as any).mockRejectedValue(new Error("Not Found"));

		const res = await request("/api/users/1", {
			method: "DELETE",
			headers: { Authorization: adminToken },
		});

		expect(res.status).toBe(404);
	});
});
