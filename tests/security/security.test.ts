import { describe, it, expect, vi } from 'vitest';
import { request } from '../helpers';
import { db } from '../../src/db/index';

vi.mock('../../src/db/index', () => ({
	db: {
		user: {
			findUnique: vi.fn(),
		},
		project: {
			findMany: vi.fn().mockResolvedValue([]),
		},
	},
}));

describe('Security Tests', () => {
	describe('SQL Injection Prevention', () => {
		it('should treat SQL injection payloads as literal strings', async () => {
			const sqlPayload = "' OR '1'='1";
			(db.user.findUnique as any).mockResolvedValue(null);

			const res = await request('/api/auth/login', {
				method: 'POST',
				body: { email: sqlPayload, password: 'password123' },
			});

			expect(res.status).toBe(401);
			expect(db.user.findUnique).toHaveBeenCalledWith({
				where: { email: sqlPayload },
			});
		});
	});

	describe('XSS Payload Handling', () => {
		it('should handle XSS payloads as literal strings', async () => {
			const xssPayload = "<script>alert('xss')</script>";
			(db.user.findUnique as any).mockResolvedValue(null);

			const res = await request('/api/auth/login', {
				method: 'POST',
				body: { email: xssPayload, password: 'password123' },
			});

			expect(res.status).toBe(401);
			expect(db.user.findUnique).toHaveBeenCalledWith({
				where: { email: xssPayload },
			});
		});
	});

	describe('Authentication Enforcement', () => {
		it('should block access to protected routes without a token', async () => {
			const res = await request('/api/projects');
			expect(res.status).toBe(401);
		});

		it('should reject invalid tokens', async () => {
			const res = await request('/api/projects', {
				headers: { 'Authorization': 'Bearer invalid.token.here' }
			});
			expect(res.status).toBe(401);
		});
	});
});
