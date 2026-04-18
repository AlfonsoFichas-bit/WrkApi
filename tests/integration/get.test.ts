import { describe, it, expect, vi } from 'vitest';
import { request } from '../helpers';
import { db } from '../../src/db/index';

vi.mock('../../src/db/index', () => ({
	db: {
		user: {
			findMany: vi.fn(),
		},
	},
}));

describe('Integration Tests: GET Endpoints', () => {
	it('should return 200 for root endpoint', async () => {
		const res = await request('/');
		expect(res.status).toBe(200);
		expect(res.body).toEqual({ message: 'Wrk_api: Iteracion 1 is running!' });
	});

	it('should return 401 for /api/users without auth', async () => {
		const res = await request('/api/users');
		expect(res.status).toBe(401);
		expect(res.body.error).toContain('Unauthorized');
	});
});
