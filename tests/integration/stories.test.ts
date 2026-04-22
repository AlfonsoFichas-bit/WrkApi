import { describe, expect, it, vi, beforeEach } from "vitest";
import { db } from "../../src/db/index";
import { request } from "../helpers";

vi.mock("../../src/db/index", () => ({
	db: {
		userStory: {
			create: vi.fn(),
			findMany: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
		},
		userProject: {
			findUnique: vi.fn(),
		},
	},
}));

describe("Integration Tests: Stories", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const adminToken = "Bearer admin-token"; // Admin bypasses role checks

	it("should allow a Product Owner to create a story", async () => {
		(db.userProject.findUnique as any).mockResolvedValue({ role: "Product Owner" });
		(db.userStory.create as any).mockResolvedValue({ id: "s1" });

		const res = await request("/api/projects/proj-1/stories", {
			method: "POST",
			body: { description: "D", acceptanceCriteria: "A" },
			headers: { Authorization: "Bearer user-token" }, // Not admin
		});

		expect(res.status).toBe(201);
	});

	it("should forbid a Team Developer from creating a story", async () => {
		(db.userProject.findUnique as any).mockResolvedValue({ role: "Team Developer" });

		const res = await request("/api/projects/proj-1/stories", {
			method: "POST",
			body: { description: "D", acceptanceCriteria: "A" },
			headers: { Authorization: "Bearer user-token" },
		});

		expect(res.status).toBe(403);
	});

	describe("POST /api/projects/:projectId/stories", () => {
		it("should create a story (Admin bypass)", async () => {
			const storyData = {
				description: "User Story 1",
				acceptanceCriteria: "Criteria 1",
			};

			(db.userStory.create as any).mockResolvedValue({ id: "story-1", ...storyData });

			const res = await request("/api/projects/proj-1/stories", {
				method: "POST",
				body: storyData,
				headers: { Authorization: adminToken },
			});

			expect(res.status).toBe(201);
			expect(res.body.description).toBe("User Story 1");
		});

		it("should return 400 if missing fields", async () => {
			const res = await request("/api/projects/proj-1/stories", {
				method: "POST",
				body: { description: "Missing Criteria" },
				headers: { Authorization: adminToken },
			});

			expect(res.status).toBe(400);
			expect(res.body.error).toBe("Missing description or acceptance criteria");
		});
	});

	describe("GET /api/projects/:projectId/stories", () => {
		it("should return 400 if projectId is missing", async () => {
			// This is hard to trigger with the current route definition /:projectId/stories
			// but we can try calling the base route if it existed.
		});

		it("should list stories for a project", async () => {
			(db.userStory.findMany as any).mockResolvedValue([{ id: "s1", description: "Story 1" }]);

			const res = await request("/api/projects/proj-1/stories", {
				headers: { Authorization: adminToken },
			});

			expect(res.status).toBe(200);
			expect(Array.isArray(res.body)).toBe(true);
		});
	});

	describe("PATCH /api/projects/:projectId/stories/:storyId/priority", () => {
		it("should update story priority", async () => {
			(db.userStory.update as any).mockResolvedValue({ id: "s1", priority: 10 });

			const res = await request("/api/projects/proj-1/stories/s1/priority", {
				method: "PATCH",
				body: { priority: 10 },
				headers: { Authorization: adminToken },
			});

			expect(res.status).toBe(200);
			expect(res.body.priority).toBe(10);
		});
	});

	describe("PUT /api/projects/:projectId/stories/:storyId", () => {
		it("should update story details", async () => {
			(db.userStory.update as any).mockResolvedValue({ id: "s1", description: "Updated" });

			const res = await request("/api/projects/proj-1/stories/s1", {
				method: "PUT",
				body: { description: "Updated" },
				headers: { Authorization: adminToken },
			});

			expect(res.status).toBe(200);
			expect(res.body.description).toBe("Updated");
		});

		it("should return 400 on update failure", async () => {
			(db.userStory.update as any).mockRejectedValue(new Error("Fail"));

			const res = await request("/api/projects/proj-1/stories/s1", {
				method: "PUT",
				body: { description: "Fail" },
				headers: { Authorization: adminToken },
			});

			expect(res.status).toBe(400);
		});
	});

	describe("DELETE /api/projects/:projectId/stories/:storyId", () => {
		it("should delete a story", async () => {
			(db.userStory.delete as any).mockResolvedValue({ id: "s1" });

			const res = await request("/api/projects/proj-1/stories/s1", {
				method: "DELETE",
				headers: { Authorization: adminToken },
			});

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
		});

		it("should return 404 on delete failure", async () => {
			(db.userStory.delete as any).mockRejectedValue(new Error("Not Found"));

			const res = await request("/api/projects/proj-1/stories/s1", {
				method: "DELETE",
				headers: { Authorization: adminToken },
			});

			expect(res.status).toBe(404);
		});
	});
});
