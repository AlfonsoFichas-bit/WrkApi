import { Hono } from "hono";
import { db } from "../db/index";
import { authMiddleware, requireAdmin } from "../middlewares/auth";
import type { Env } from "../types";

const projects = new Hono<Env>();

// Todas las rutas de proyectos requieren autenticación
projects.use("*", authMiddleware);

// --- Rutas solo para Administradores ---

// --- Rutas solo para Administradores ---

// Crear proyecto
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
	} catch (err: any) {
		if (err.code === "P2002") {
			return c.json({ error: "Project name must be unique" }, 409);
		}
		return c.json({ error: "Failed to create project" }, 400);
	}
});

// Listar proyectos
// (Los administradores ven todos, podríamos restringir a los usuarios regulares a sus proyectos, pero la Iteración 1 dice que el administrador gestiona los proyectos)
projects.get("/", async (c) => {
	const user = c.get("user");

	// Los administradores ven todos los proyectos, los usuarios regulares solo ven los proyectos en los que están asignados
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

// Actualizar proyecto
projects.put("/:id", requireAdmin, async (c) => {
	const id = c.req.param("id");
	const body = await c.req.json().catch(() => null);
	if (!body) return c.json({ error: "Invalid body" }, 400);

	try {
		// Preparar los datos a actualizar
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

// Eliminar proyecto
projects.delete("/:id", requireAdmin, async (c) => {
	const id = c.req.param("id");
	try {
		// Eliminar el proyecto de la base de datos
		await db.project.delete({ where: { id } });
		return c.json({ success: true });
	} catch (_err) {
		return c.json({ error: "Project not found" }, 404);
	}
});

// Asignar miembro al proyecto
projects.post("/:id/members", requireAdmin, async (c) => {
	const projectId = c.req.param("id") as string;
	const body = await c.req.json().catch(() => null);

	if (!body?.userId || !body?.role) {
		return c.json({ error: "Missing userId or role" }, 400);
	}

	// Validar roles permitidos
	const validRoles = ["Scrum Master", "Product Owner", "Team Developer"];
	if (!validRoles.includes(body.role)) {
		return c.json({ error: "Invalid project role" }, 400);
	}

	try {
		// Asignar usuario al proyecto o actualizar su rol si ya está asignado
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
				user: { connect: { id: body.userId } },
				project: { connect: { id: projectId } },
				role: body.role,
			},
		});

		// Simular notificación por correo electrónico
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
