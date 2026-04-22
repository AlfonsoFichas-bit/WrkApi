import { describe, expect, it, vi, beforeEach } from "vitest";
import { db } from "../../src/db/index";
import { request } from "../helpers";

vi.mock("../../src/db/index", () => ({
	db: {
		project: {
			create: vi.fn(),
			findFirst: vi.fn(),
			findMany: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
		},
		userProject: {
			upsert: vi.fn(),
		},
	},
}));

describe("Integration Tests: Projects", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const adminToken = "Bearer admin-token"; // Mocked as ADMIN in tests/setup.ts

	describe("POST /api/projects", () => {
		it("should create a project successfully", async () => {
			const projectData = {
				name: "New Project",
				description: "Description",
				startDate: "2026-05-01",
				endDate: "2026-06-01",
			};

			(db.project.findFirst as any).mockResolvedValue(null);
			(db.project.create as any).mockResolvedValue({ id: "proj-1", ...projectData });

			const res = await request("/api/projects", {
				method: "POST",
				body: projectData,
				headers: { Authorization: adminToken },
			});

			expect(res.status).toBe(201);
			expect(res.body.name).toBe("New Project");
		});

		it("should return 400 if missing fields", async () => {
			const res = await request("/api/projects", {
				method: "POST",
				body: { name: "Incomplete" },
				headers: { Authorization: adminToken },
			});

			expect(res.status).toBe(400);
			expect(res.body.error).toBe("Missing required fields");
		});

		it("should return 409 if dates overlap", async () => {
			(db.project.findFirst as any).mockResolvedValue({ id: "existing" });

			const res = await request("/api/projects", {
				method: "POST",
				body: {
					name: "Overlap",
					description: "Desc",
					startDate: "2026-05-01",
					endDate: "2026-06-01",
				},
				headers: { Authorization: adminToken },
			});

			expect(res.status).toBe(409);
			expect(res.body.error).toBe("Dates overlap with an existing project");
		});

		it("should return 400 if start date is after end date", async () => {
			const res = await request("/api/projects", {
				method: "POST",
				body: {
					name: "Invalid Dates",
					description: "Desc",
					startDate: "2026-06-01",
					endDate: "2026-05-01",
				},
				headers: { Authorization: adminToken },
			});

			expect(res.status).toBe(400);
			expect(res.body.error).toBe("Start date must be before end date");
		});

		it("should return 409 if project name is not unique", async () => {
			(db.project.findFirst as any).mockResolvedValue(null);
			const error: any = new Error("Unique constraint failed");
			error.code = "P2002";
			(db.project.create as any).mockRejectedValue(error);

			const res = await request("/api/projects", {
				method: "POST",
				body: {
					name: "Duplicate",
					description: "Desc",
					startDate: "2026-05-01",
					endDate: "2026-06-01",
				},
				headers: { Authorization: adminToken },
			});

			expect(res.status).toBe(409);
			expect(res.body.error).toBe("Project name must be unique");
		});
	});

	describe("GET /api/projects", () => {
		it("should list projects for admin", async () => {
			(db.project.findMany as any).mockResolvedValue([{ id: "1", name: "P1" }]);

			const res = await request("/api/projects", {
				headers: { Authorization: adminToken },
			});

			expect(res.status).toBe(200);
			expect(Array.isArray(res.body)).toBe(true);
		});

		it("should list projects for regular user", async () => {
			(db.project.findMany as any).mockResolvedValue([{ id: "1", name: "P1" }]);

			const res = await request("/api/projects", {
				headers: { Authorization: "Bearer user-token" }, // Setup.ts mocks this as non-admin if token doesn't have 'admin'
			});

			expect(res.status).toBe(200);
		});
	});

	describe("PUT /api/projects/:id", () => {
		it("should update a project", async () => {
			(db.project.update as any).mockResolvedValue({ id: "1", name: "Updated" });

			const res = await request("/api/projects/1", {
				method: "PUT",
				body: { name: "Updated" },
				headers: { Authorization: adminToken },
			});

			expect(res.status).toBe(200);
			expect(res.body.name).toBe("Updated");
		});

		it("should return 400 on update failure", async () => {
			(db.project.update as any).mockRejectedValue(new Error("Fail"));

			const res = await request("/api/projects/1", {
				method: "PUT",
				body: { name: "Fail" },
				headers: { Authorization: adminToken },
			});

			expect(res.status).toBe(400);
		});
	});

	describe("DELETE /api/projects/:id", () => {
		it("should delete a project", async () => {
			(db.project.delete as any).mockResolvedValue({ id: "1" });

			const res = await request("/api/projects/1", {
				method: "DELETE",
				headers: { Authorization: adminToken },
			});

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
		});

		it("should return 404 if project not found for deletion", async () => {
			(db.project.delete as any).mockRejectedValue(new Error("Not Found"));

			const res = await request("/api/projects/1", {
				method: "DELETE",
				headers: { Authorization: adminToken },
			});

			expect(res.status).toBe(404);
		});
	});

	describe("POST /api/projects/:id/members", () => {
		it("should assign a member to a project", async () => {
			const memberData = { userId: "user-1", role: "Scrum Master" };
			(db.userProject.upsert as any).mockResolvedValue({ projectId: "proj-1", ...memberData });

			const res = await request("/api/projects/proj-1/members", {
				method: "POST",
				body: memberData,
				headers: { Authorization: adminToken },
			});

			expect(res.status).toBe(200);
			expect(res.body.role).toBe("Scrum Master");
		});

		it("should return 400 for invalid role", async () => {
			const res = await request("/api/projects/proj-1/members", {
				method: "POST",
				body: { userId: "user-1", role: "Invalid Role" },
				headers: { Authorization: adminToken },
			});

			expect(res.status).toBe(400);
			expect(res.body.error).toBe("Invalid project role");
		});
	});
});
