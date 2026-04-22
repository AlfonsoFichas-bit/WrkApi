import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { Env } from "./types";

const app = new Hono<Env>();

// Middlewares base
app.use("*", logger());
app.use("*", cors());

// Manejador básico de errores
app.onError((err, c) => {
	console.error(`[Error] ${err.message}`, err);
	return c.json({ error: "Internal Server Error", message: err.message }, 500);
});

import authRoutes from "./routes/auth";
import projectRoutes from "./routes/projects";
import storyRoutes from "./routes/stories";
import userRoutes from "./routes/users";
import { openAPIRouteHandler } from "hono-openapi";
import { swaggerUI } from "@hono/swagger-ui";

app.route("/api/auth", authRoutes);
app.route("/api/users", userRoutes);
app.route("/api/projects", projectRoutes);
app.route("/api/projects", storyRoutes);

app.get(
	"/openapi",
	openAPIRouteHandler(app, {
		documentation: {
			info: {
				title: "Wrk_api API",
				version: "1.0.0",
				description: "API for Project and Story management - Iteration 1",
			},
			servers: [{ url: "http://localhost:3000", description: "Local Server" }],
		},
	}),
);

app.get("/docs", swaggerUI({ url: "/openapi" }));

app.get("/", (c) => {
	return c.json({ message: "Wrk_api: Iteracion 1 is running!" });
});

export default app;
