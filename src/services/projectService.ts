// Servicio para verificar si hay proyectos con fechas superpuestas
import { db } from "../db/index";

export const checkProjectOverlap = async (
	start: Date,
	end: Date,
	excludeId?: string,
) => {
	const overlapping = await db.project.findFirst({
		where: {
			AND: [
				{ startDate: { lte: end } },
				{ endDate: { gte: start } },
				...(excludeId ? [{ id: { not: excludeId } }] : []),
			],
		},
	});
	return !!overlapping;
};
