import { describe, it, expect, vi } from 'vitest';
import { request } from '../helpers';
import { db } from '../../src/db/index';

vi.mock('../../src/db/index', () => ({
	db: {
		user: {
			create: vi.fn(),
			findUnique: vi.fn(),
			findMany: vi.fn(),
		},
	},
}));

describe('Integration Tests: Users', () => {
	it('should create a user', async () => {
		(db.user.findUnique as any).mockResolvedValue(null);
		(db.user.create as any).mockResolvedValue({ id: '1', email: 'test@test.com' });

		const res = await request('/api/users', {
			method: 'POST',
			body: { email: 'test@test.com', password: 'Password123', name: 'Test' },
			headers: { 'Authorization': 'Bearer valid.token' }
		});
		
		expect(res.status).toBe(201);
		expect(res.body.email).toBe('test@test.com');
	});
});
