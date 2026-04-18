import { describe, it, expect, vi } from 'vitest';
import { request } from '../helpers';
import { db } from '../../src/db/index';

vi.mock('../../src/db/index', () => ({
	db: {
		user: {
			findUnique: vi.fn(),
		},
	},
}));

describe('Integration Tests: POST Endpoints', () => {
	describe('POST /api/auth/login', () => {
		it('should return 400 if email or password missing', async () => {
			const res = await request('/api/auth/login', {
				method: 'POST',
				body: { email: 'test@example.com' },
			});
			expect(res.status).toBe(400);
			expect(res.body.error).toBe('Missing email or password');
		});

		it('should return 401 if user not found', async () => {
			(db.user.findUnique as any).mockResolvedValue(null);

			const res = await request('/api/auth/login', {
				method: 'POST',
				body: { email: 'notfound@example.com', password: 'password123' },
			});
			expect(res.status).toBe(401);
			expect(res.body.error).toBe('Invalid credentials');
		});
	});
});
