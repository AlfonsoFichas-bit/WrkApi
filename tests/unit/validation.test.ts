import { describe, expect, it } from "vitest";
import { isValidEmail, isValidPassword } from "../../src/utils/validation";

describe("Validation Utilities", () => {
	describe("isValidEmail", () => {
		it("should return true for valid emails", () => {
			expect(isValidEmail("test@example.com")).toBe(true);
			expect(isValidEmail("user.name+tag@domain.co.uk")).toBe(true);
		});

		it("should return false for invalid emails", () => {
			expect(isValidEmail("invalid-email")).toBe(false);
			expect(isValidEmail("@example.com")).toBe(false);
			expect(isValidEmail("user@")).toBe(false);
			expect(isValidEmail("user@domain")).toBe(false);
		});
	});

	describe("isValidPassword", () => {
		it("should return true for passwords with 8+ chars, letters and numbers", () => {
			expect(isValidPassword("password123")).toBe(true);
			expect(isValidPassword("Abcdefg8")).toBe(true);
		});

		it("should return false for short passwords", () => {
			expect(isValidPassword("pass1")).toBe(false);
		});

		it("should return false for passwords without numbers", () => {
			expect(isValidPassword("onlyletters")).toBe(false);
		});

		it("should return false for passwords without letters", () => {
			expect(isValidPassword("12345678")).toBe(false);
		});
	});
});
