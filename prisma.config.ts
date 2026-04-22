// Configuración de Prisma para la base de datos
// Este archivo fue generado por Prisma y asume que ejecutas comandos de Prisma usando `bun --bun run prisma [command]`.
import { defineConfig, env } from "prisma/config";

export default defineConfig({
	schema: "prisma/schema.prisma",
	migrations: {
		path: "prisma/migrations",
	},
	datasource: {
		url: env("DATABASE_URL"),
	},
});
