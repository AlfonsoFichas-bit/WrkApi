import { Hono } from "hono";
import { db } from "../db/index";
import { authMiddleware, requireAdmin } from "../middlewares/auth";
import type { Env } from "../types";
import { z } from "zod";
import { describeRoute, resolver, validator } from "hono-openapi";

const users = new Hono<Env>();

// Todas las rutas de gestión de usuarios requieren autenticación y rol de Administrador
users.use("*", authMiddleware, requireAdmin);

// Esquema de respuesta para usuarios
const userResponseSchema = z.object({
	id: z.string().uuid(),
	email: z.string().email(),
	name: z.string(),
	globalRole: z.enum(["ADMIN", "USER"]),
	createdAt: z.date().optional(),
});

// Esquema de validación para la creación de usuarios
const createUserSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
	name: z.string(),
	globalRole: z.enum(["ADMIN", "USER"]).optional(),
});

// Esquema de validación para la actualización de usuarios
const updateUserSchema = z.object({
	email: z.string().email().optional(),
	password: z.string().min(8).optional(),
	name: z.string().optional(),
	globalRole: z.enum(["ADMIN", "USER"]).optional(),
});

// Crear usuario (Registro)
users.post(
	"/",
	describeRoute({
		description: "Create a new user (Admin only)",
		responses: {
			201: {
				description: "User created successfully",
				content: {
					"application/json": { schema: resolver(userResponseSchema) },
				},
			},
			400: { description: "Missing required fields" },
			409: { description: "Email already in use" },
		},
	}),
	validator("json", createUserSchema),
	async (c) => {
		const body = c.req.valid("json");

		// Verificar si el correo electrónico ya está en uso
		const existingUser = await db.user.findUnique({
			where: { email: body.email },
		});
		if (existingUser) {
			return c.json({ error: "Email already in use" }, 409);
		}

		// Hashear la contraseña
		const passwordHash = await Bun.password.hash(body.password);

		// Crear el usuario en la base de datos
		const user = await db.user.create({
			data: {
				email: body.email,
				name: body.name,
				passwordHash: passwordHash,
				globalRole: body.globalRole === "ADMIN" ? "ADMIN" : "USER",
			},
			select: {
				id: true,
				email: true,
				name: true,
				globalRole: true,
				createdAt: true,
			},
		});

		return c.json(user, 201);
	},
);

// Listar usuarios
users.get(
	"/",
	describeRoute({
		description: "List all users (Admin only)",
		responses: {
			200: {
				description: "List of users",
				content: {
					"application/json": { schema: resolver(z.array(userResponseSchema)) },
				},
			},
		},
	}),
	async (c) => {
		// Obtener todos los usuarios de la base de datos
		const allUsers = await db.user.findMany({
			select: {
				id: true,
				email: true,
				name: true,
				globalRole: true,
				createdAt: true,
			},
		});
		return c.json(allUsers);
	},
);

// Obtener usuario por ID
users.get(
	"/:id",
	describeRoute({
		description: "Get a user by ID (Admin only)",
		responses: {
			200: {
				description: "User found",
				content: {
					"application/json": { schema: resolver(userResponseSchema) },
				},
			},
			404: { description: "User not found" },
		},
	}),
	async (c) => {
		const id = c.req.param("id");
		const user = await db.user.findUnique({
			where: { id },
			select: {
				id: true,
				email: true,
				name: true,
				globalRole: true,
				createdAt: true,
			},
		});

		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}

		return c.json(user);
	},
);

// Actualizar usuario
users.put(
	"/:id",
	describeRoute({
		description: "Update a user (Admin only)",
		responses: {
			200: {
				description: "User updated successfully",
				content: {
					"application/json": { schema: resolver(userResponseSchema) },
				},
			},
			400: { description: "Invalid request body" },
			404: { description: "User not found" },
		},
	}),
	validator("json", updateUserSchema),
	async (c) => {
		const id = c.req.param("id");
		const body = c.req.valid("json");

		try {
			// Preparar los datos a actualizar
			const updateData: any = {};
			if (body.name) updateData.name = body.name;
			if (body.email) updateData.email = body.email;
			if (body.globalRole) updateData.globalRole = body.globalRole;
			if (body.password) {
				updateData.passwordHash = await Bun.password.hash(body.password);
			}

			const user = await db.user.update({
				where: { id },
				data: updateData,
				select: {
					id: true,
					email: true,
					name: true,
					globalRole: true,
				},
			});

			return c.json(user);
		} catch (_error) {
			return c.json({ error: "Failed to update user" }, 400);
		}
	},
);

// Eliminar usuario
users.delete(
	"/:id",
	describeRoute({
		description: "Delete a user (Admin only)",
		responses: {
			200: {
				description: "User deleted successfully",
				content: {
					"application/json": {
						schema: resolver(
							z.object({ success: z.boolean(), message: z.string() }),
						),
					},
				},
			},
			404: { description: "User not found" },
		},
	}),
	async (c) => {
		const id = c.req.param("id");

		try {
			// Eliminar el usuario de la base de datos
			await db.user.delete({
				where: { id },
			});
			return c.json({ success: true, message: "User deleted" });
		} catch (_error) {
			return c.json({ error: "User not found or cannot be deleted" }, 404);
		}
	},
);

export default users;
