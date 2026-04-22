import { Hono } from "hono";
import { db } from "../db/index";
import { authMiddleware, requireProjectRole } from "../middlewares/auth";
import type { Env } from "../types";

const stories = new Hono<Env>();

// Middleware base para todas las rutas de historias requiere autenticación
stories.use("*", authMiddleware);

// Crear historia de usuario (Requiere Product Owner)
stories.post(
	"/:projectId/stories",
	requireProjectRole(["Product Owner"]),
	async (c) => {
		const projectId = c.req.param("projectId");
		const body = await c.req.json().catch(() => null);

		if (!projectId) return c.json({ error: "Missing project ID" }, 400);

		if (!body?.description || !body?.acceptanceCriteria) {
			return c.json(
				{ error: "Missing description or acceptance criteria" },
				400,
			);
		}

		try {
			// Crear una nueva historia de usuario
			const story = await db.userStory.create({
				data: {
					project: { connect: { id: projectId } },
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

// Listar historias para un proyecto (Cualquier miembro del proyecto puede ver, incluyendo Scrum Master, PO, Team Developer)
stories.get(
	"/:projectId/stories",
	requireProjectRole(["Product Owner", "Scrum Master", "Team Developer"]),
	async (c) => {
		const projectId = c.req.param("projectId");
		if (!projectId) return c.json({ error: "Missing project ID" }, 400);

		// Obtener historias del proyecto ordenadas por prioridad
		const projectStories = await db.userStory.findMany({
			where: { projectId },
			orderBy: { priority: "desc" },
		});

		return c.json(projectStories);
	},
);

// Actualizar detalles de la historia (Requiere Product Owner)
stories.put(
	"/:projectId/stories/:storyId",
	requireProjectRole(["Product Owner"]),
	async (c) => {
		const projectId = c.req.param("projectId");
		const storyId = c.req.param("storyId");
		const body = await c.req.json().catch(() => null);

		if (!projectId || !storyId)
			return c.json({ error: "Missing project or story ID" }, 400);
		if (!body) return c.json({ error: "Invalid body" }, 400);

		try {
			// Preparar los datos a actualizar
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

// Actualizar prioridad de la historia (Requiere Product Owner)
stories.patch(
	"/:projectId/stories/:storyId/priority",
	requireProjectRole(["Product Owner"]),
	async (c) => {
		const projectId = c.req.param("projectId");
		const storyId = c.req.param("storyId");
		const body = await c.req.json().catch(() => null);

		if (!projectId || !storyId)
			return c.json({ error: "Missing project or story ID" }, 400);
		if (!body || typeof body.priority !== "number") {
			return c.json({ error: "Missing or invalid priority number" }, 400);
		}

		try {
			// Actualizar la prioridad de la historia
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

// Eliminar historia (Requiere Product Owner)
stories.delete(
	"/:projectId/stories/:storyId",
	requireProjectRole(["Product Owner"]),
	async (c) => {
		const projectId = c.req.param("projectId");
		const storyId = c.req.param("storyId");

		if (!projectId || !storyId)
			return c.json({ error: "Missing project or story ID" }, 400);

		try {
			// Eliminar la historia de usuario
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
