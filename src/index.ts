import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

// Define a custom context type to type the variables set in middleware
type Variables = {
	user: {
		id: string;
		email: string;
		globalRole: string;
	};
	projectRole?: string;
};

const app = new Hono<{ Variables: Variables }>();

// Base Middlewares
app.use("*", logger());
app.use("*", cors());

// Basic error handler
app.onError((err, c) => {
	console.error(`[Error] ${err.message}`, err);
	return c.json({ error: "Internal Server Error", message: err.message }, 500);
});

import authRoutes from "./routes/auth";
import projectRoutes from "./routes/projects";
import storyRoutes from "./routes/stories";
import userRoutes from "./routes/users";

app.route("/api/auth", authRoutes);
app.route("/api/users", userRoutes);
app.route("/api/projects", projectRoutes);
app.route("/api/projects", storyRoutes);

app.get("/", (c) => {
	return c.json({ message: "Wrk_api: Iteracion 1 is running!" });
});

export default app;
