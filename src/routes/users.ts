import { Hono } from "hono";
import { db } from "../db/index";
import { authMiddleware, requireAdmin } from "../middlewares/auth";

const users = new Hono();

// All user management routes require authentication and Admin role
users.use("*", authMiddleware, requireAdmin);

// Create User (Register)
users.post("/", async (c) => {
	const body = await c.req.json().catch(() => null);
	if (!body?.email || !body?.password || !body?.name) {
		return c.json(
			{ error: "Missing required fields (email, password, name)" },
			400,
		);
	}

	const existingUser = await db.user.findUnique({
		where: { email: body.email },
	});
	if (existingUser) {
		return c.json({ error: "Email already in use" }, 409);
	}

	const passwordHash = await Bun.password.hash(body.password);

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
});

// List Users
users.get("/", async (c) => {
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
});

// Get User by ID
users.get("/:id", async (c) => {
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
});

// Update User
users.put("/:id", async (c) => {
	const id = c.req.param("id");
	const body = await c.req.json().catch(() => null);

	if (!body) {
		return c.json({ error: "Invalid request body" }, 400);
	}

	try {
		const updateData: Partial<{
			name: string;
			email: string;
			globalRole: string;
			passwordHash: string;
		}> = {};
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
});

// Delete User
users.delete("/:id", async (c) => {
	const id = c.req.param("id");

	try {
		await db.user.delete({
			where: { id },
		});
		return c.json({ success: true, message: "User deleted" });
	} catch (_error) {
		return c.json({ error: "User not found or cannot be deleted" }, 404);
	}
});

export default users;
