import { Hono } from "hono";
import { db } from "../db/index";
import { authMiddleware, requireAdmin } from "../middlewares/auth";

const projects = new Hono();

// All project routes require authentication
projects.use("*", authMiddleware);

// --- Admin Only Routes ---

// Create Project
projects.post("/", requireAdmin, async (c) => {
	const body = await c.req.json().catch(() => null);
	if (!body?.name || !body?.description || !body?.startDate || !body?.endDate) {
		return c.json({ error: "Missing required fields" }, 400);
	}

	const start = new Date(body.startDate);
	const end = new Date(body.endDate);

	if (start >= end) {
		return c.json({ error: "Start date must be before end date" }, 400);
	}

	// Check for overlapping projects logic (simplified to just check if dates overlap globally as per simplified reqs)
	const overlapping = await db.project.findFirst({
		where: {
			AND: [{ startDate: { lte: end } }, { endDate: { gte: start } }],
		},
	});

	if (overlapping) {
		return c.json({ error: "Dates overlap with an existing project" }, 409);
	}

	try {
		const project = await db.project.create({
			data: {
				name: body.name,
				description: body.description,
				startDate: start,
				endDate: end,
			},
		});
		return c.json(project, 201);
	} catch (err) {
		if (err.code === "P2002") {
			return c.json({ error: "Project name must be unique" }, 409);
		}
		return c.json({ error: "Failed to create project" }, 400);
	}
});

// List Projects
// (Admins see all, we could restrict regular users to their projects, but Iteration 1 says admin manages projects)
projects.get("/", async (c) => {
	const user = c.get("user");

	const projectList =
		user.globalRole === "ADMIN"
			? await db.project.findMany()
			: await db.project.findMany({
					where: {
						members: {
							some: {
								userId: user.id,
							},
						},
					},
				});

	return c.json(projectList);
});

// Update Project
projects.put("/:id", requireAdmin, async (c) => {
	const id = c.req.param("id");
	const body = await c.req.json().catch(() => null);
	if (!body) return c.json({ error: "Invalid body" }, 400);

	try {
		const updateData: Partial<{
			name: string;
			description: string;
			startDate: Date;
			endDate: Date;
		}> = {};
		if (body.name) updateData.name = body.name;
		if (body.description) updateData.description = body.description;
		if (body.startDate) updateData.startDate = new Date(body.startDate);
		if (body.endDate) updateData.endDate = new Date(body.endDate);

		const project = await db.project.update({
			where: { id },
			data: updateData,
		});
		return c.json(project);
	} catch (_err) {
		return c.json({ error: "Failed to update project" }, 400);
	}
});

// Delete Project
projects.delete("/:id", requireAdmin, async (c) => {
	const id = c.req.param("id");
	try {
		await db.project.delete({ where: { id } });
		return c.json({ success: true });
	} catch (_err) {
		return c.json({ error: "Project not found" }, 404);
	}
});

// Assign Member to Project
projects.post("/:id/members", requireAdmin, async (c) => {
	const projectId = c.req.param("id");
	const body = await c.req.json().catch(() => null);

	if (!body?.userId || !body?.role) {
		return c.json({ error: "Missing userId or role" }, 400);
	}

	const validRoles = ["Scrum Master", "Product Owner", "Team Developer"];
	if (!validRoles.includes(body.role)) {
		return c.json({ error: "Invalid project role" }, 400);
	}

	try {
		const userProject = await db.userProject.upsert({
			where: {
				userId_projectId: {
					userId: body.userId,
					projectId: projectId,
				},
			},
			update: {
				role: body.role,
			},
			create: {
				userId: body.userId,
				projectId: projectId,
				role: body.role,
			},
		});

		// Mock Email Notification
		console.log(
			`[Mock Email] Assigned user ${body.userId} to project ${projectId} as ${body.role}`,
		);

		return c.json(userProject, 200);
	} catch (_err) {
		return c.json(
			{ error: "Failed to assign member. Check user ID and project ID." },
			400,
		);
	}
});

export default projects;
