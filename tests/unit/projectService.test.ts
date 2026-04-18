import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkProjectOverlap } from '../../src/services/projectService';
import { db } from '../../src/db/index';

vi.mock('../../src/db/index', () => ({
	db: {
		project: {
			findFirst: vi.fn(),
		},
	},
}));

describe('Project Service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('checkProjectOverlap', () => {
		it('should return true if overlapping project is found', async () => {
			(db.project.findFirst as any).mockResolvedValue({ id: 'existing-id' });

			const result = await checkProjectOverlap(new Date('2026-01-01'), new Date('2026-01-10'));
			
			expect(result).toBe(true);
			expect(db.project.findFirst).toHaveBeenCalledWith({
				where: {
					AND: [
						{ startDate: { lte: expect.any(Date) } },
						{ endDate: { gte: expect.any(Date) } },
					],
				},
			});
		});

		it('should return false if no overlapping project is found', async () => {
			(db.project.findFirst as any).mockResolvedValue(null);

			const result = await checkProjectOverlap(new Date('2026-01-01'), new Date('2026-01-10'));
			
			expect(result).toBe(false);
		});
	});
});
