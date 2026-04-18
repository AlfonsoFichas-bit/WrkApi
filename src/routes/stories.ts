import { Hono } from "hono";
import { db } from "../db/index";
import { authMiddleware, requireProjectRole } from "../middlewares/auth";

const stories = new Hono();

// Base middleware for all stories routes requires authentication
stories.use("*", authMiddleware);

// Create User Story (Requires Product Owner)
stories.post(
	"/:projectId/stories",
	requireProjectRole(["Product Owner"]),
	async (c) => {
		const projectId = c.req.param("projectId");
		const body = await c.req.json().catch(() => null);

		if (!body?.description || !body?.acceptanceCriteria) {
			return c.json(
				{ error: "Missing description or acceptance criteria" },
				400,
			);
		}

		try {
			const story = await db.userStory.create({
				data: {
					projectId,
					description: body.description,
					acceptanceCriteria: body.acceptanceCriteria,
					priority: body.priority || 0,
				},
			});
			return c.json(story, 201);
		} catch (_err) {
			return c.json(
				{ error: "Failed to create user story. Check project ID." },
				400,
			);
		}
	},
);

// List Stories for a Project (Any project member can view, including Scrum Master, PO, Team Developer)
stories.get(
	"/:projectId/stories",
	requireProjectRole(["Product Owner", "Scrum Master", "Team Developer"]),
	async (c) => {
		const projectId = c.req.param("projectId");

		const projectStories = await db.userStory.findMany({
			where: { projectId },
			orderBy: { priority: "desc" },
		});

		return c.json(projectStories);
	},
);

// Update Story Details (Requires Product Owner)
stories.put(
	"/:projectId/stories/:storyId",
	requireProjectRole(["Product Owner"]),
	async (c) => {
		const projectId = c.req.param("projectId");
		const storyId = c.req.param("storyId");
		const body = await c.req.json().catch(() => null);

		if (!body) return c.json({ error: "Invalid body" }, 400);

		try {
			const updateData: Partial<{
				description: string;
				acceptanceCriteria: string;
			}> = {};
			if (body.description) updateData.description = body.description;
			if (body.acceptanceCriteria)
				updateData.acceptanceCriteria = body.acceptanceCriteria;

			const story = await db.userStory.update({
				where: { id: storyId, projectId: projectId },
				data: updateData,
			});

			return c.json(story);
		} catch (_err) {
			return c.json({ error: "Story not found or update failed" }, 400);
		}
	},
);

// Update Story Priority (Requires Product Owner)
stories.patch(
	"/:projectId/stories/:storyId/priority",
	requireProjectRole(["Product Owner"]),
	async (c) => {
		const projectId = c.req.param("projectId");
		const storyId = c.req.param("storyId");
		const body = await c.req.json().catch(() => null);

		if (!body || typeof body.priority !== "number") {
			return c.json({ error: "Missing or invalid priority number" }, 400);
		}

		try {
			const story = await db.userStory.update({
				where: { id: storyId, projectId: projectId },
				data: { priority: body.priority },
			});

			return c.json(story);
		} catch (_err) {
			return c.json({ error: "Story not found or update failed" }, 400);
		}
	},
);

// Delete Story (Requires Product Owner)
stories.delete(
	"/:projectId/stories/:storyId",
	requireProjectRole(["Product Owner"]),
	async (c) => {
		const projectId = c.req.param("projectId");
		const storyId = c.req.param("storyId");

		try {
			await db.userStory.delete({
				where: { id: storyId, projectId: projectId },
			});

			return c.json({ success: true });
		} catch (_err) {
			return c.json({ error: "Story not found or delete failed" }, 404);
		}
	},
);

export default stories;
