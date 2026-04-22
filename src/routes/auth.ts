import { Hono } from "hono";
import { sign } from "hono/jwt";
import { db } from "../db";
import type { Env } from "../types";
import { z } from "zod";
import { describeRoute, resolver, validator } from "hono-openapi";

const auth = new Hono<Env>();
const JWT_SECRET = process.env.JWT_SECRET || "jwt_secret";

// Esquema de validación para el inicio de sesión
const loginSchema = z.object({
	email: z.string().min(1),
	password: z.string().min(1),
});

const recoverPasswordSchema = z.object({
	email: z.string().min(1),
});

// Ruta para el inicio de sesión de usuarios
auth.post(
	"/login",
	validator("json", loginSchema),
	async (c) => {
		const body = c.req.valid("json");

		const user = await db.user.findUnique({
			where: { email: body.email },
		});

		if (!user) {
			return c.json({ error: "Invalid credentials" }, 401);
		}

		const isMatch = await Bun.password.verify(body.password, user.passwordHash);
		if (!isMatch) {
			return c.json({ error: "Invalid credentials" }, 401);
		}

		const payload = {
			id: user.id,
			email: user.email,
			globalRole: user.globalRole,
			exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
		};

		const token = await sign(payload, JWT_SECRET, "HS256");

		return c.json({
			token,
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				globalRole: user.globalRole,
			},
		});
	},
);

// Ruta para la recuperación de contraseña
auth.post(
	"/recover-password",
	describeRoute({
		description: "Send a password recovery link to the user's email",
		responses: {
			200: {
				description: "Recovery email sent (or user not found for security)",
				content: {
					"application/json": {
						schema: resolver(z.object({ message: z.string() })),
					},
				},
			},
		},
	}),
	validator("json", recoverPasswordSchema),
	async (c) => {
		const body = c.req.valid("json");

		// Buscar usuario por correo electrónico
		const user = await db.user.findUnique({
			where: { email: body.email },
		});

		if (!user) {
			// Retornar 200 para evitar la enumeración de correos electrónicos
			return c.json({
				message: "If the email exists, a recovery link has been sent.",
			});
		}

		// Generar token de recuperación
		const recoveryToken = crypto.randomUUID();
		// Simular el envío de correo electrónico
		console.log(
			`[Mock Email] Password recovery requested for ${body.email}. Token: ${recoveryToken}`,
		);

		return c.json({
			message: "If the email exists, a recovery link has been sent.",
		});
	},
);

export default auth;
