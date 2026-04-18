import { Hono } from "hono";
import { sign } from "hono/jwt";
import { db } from "../db/index";

const auth = new Hono();
const JWT_SECRET = process.env.JWT_SECRET || "iteracion1_secret";

auth.post("/login", async (c) => {
	const body = await c.req.json().catch(() => null);
	if (!body?.email || !body.password) {
		return c.json({ error: "Missing email or password" }, 400);
	}

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
		exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
	};

	const token = await sign(payload, JWT_SECRET);

	return c.json({
		token,
		user: {
			id: user.id,
			email: user.email,
			name: user.name,
			globalRole: user.globalRole,
		},
	});
});

auth.post("/recover-password", async (c) => {
	const body = await c.req.json().catch(() => null);
	if (!body?.email) {
		return c.json({ error: "Missing email" }, 400);
	}

	const user = await db.user.findUnique({
		where: { email: body.email },
	});

	if (!user) {
		// Return 200 to prevent email enumeration
		return c.json({
			message: "If the email exists, a recovery link has been sent.",
		});
	}

	const recoveryToken = crypto.randomUUID();
	// Mock sending email
	console.log(
		`[Mock Email] Password recovery requested for ${body.email}. Token: ${recoveryToken}`,
	);

	return c.json({
		message: "If the email exists, a recovery link has been sent.",
	});
});

export default auth;
