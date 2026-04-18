import { describe, it, expect } from 'vitest';
import { formatDate, truncateString } from '../../src/utils/formatting';

describe('Formatting Utilities', () => {
	describe('formatDate', () => {
		it('should format date to YYYY-MM-DD', () => {
			const date = new Date('2026-04-17T12:00:00Z');
			expect(formatDate(date)).toBe('2026-04-17');
		});
	});

	describe('truncateString', () => {
		it('should truncate long strings', () => {
			expect(truncateString('Hello World', 5)).toBe('Hello...');
		});

		it('should not truncate short strings', () => {
			expect(truncateString('Hello', 10)).toBe('Hello');
		});
	});
});
