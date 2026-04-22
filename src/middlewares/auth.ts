import type { Next } from "hono";
import { verify } from "hono/jwt";
import type { Context } from "hono";
import type { Env, UserPayload } from "../types";

const JWT_SECRET = process.env.JWT_SECRET || "iteracion1_secret";

export const authMiddleware = async (c: Context<Env>, next: Next) => {
	const authHeader = c.req.header("Authorization");

	if (!authHeader?.startsWith("Bearer ")) {
		return c.json({ error: "Unauthorized: Missing or invalid token" }, 401);
	}

	const token = authHeader.split(" ")[1];

	try {
		const payload = (await verify(token, JWT_SECRET, "HS256")) as any as UserPayload;
		c.set("user", payload);
		await next();
	} catch (_error) {
		return c.json({ error: "Unauthorized: Invalid token" }, 401);
	}
};

export const requireAdmin = async (c: Context<Env>, next: Next) => {
	const user = c.get("user");

	if (!user || user.globalRole !== "ADMIN") {
		return c.json({ error: "Forbidden: Requires Administrator role" }, 403);
	}

	await next();
};

export const requireProjectRole = (allowedRoles: string[]) => {
	return async (c: Context<Env>, next: Next) => {
		const user = c.get("user");
		const projectId = c.req.param("projectId") || c.req.param("id");

		if (!user) {
			return c.json({ error: "Unauthorized" }, 401);
		}

		// Los administradores globales omiten las verificaciones de roles de proyecto
		if (user.globalRole === "ADMIN") {
			await next();
			return;
		}

		if (!projectId) {
			return c.json({ error: "Bad Request: Missing project ID" }, 400);
		}

		// Importación dinámica para evitar dependencia circular
		const { db } = await import("../db/index");

		const userProject = await db.userProject.findUnique({
			where: {
				userId_projectId: {
					userId: user.id,
					projectId: projectId,
				},
			},
		});

		if (!userProject || !allowedRoles.includes(userProject.role)) {
			return c.json(
				{ error: "Forbidden: Insufficient project permissions" },
				403,
			);
		}

		c.set("projectRole", userProject.role);
		await next();
	};
};
