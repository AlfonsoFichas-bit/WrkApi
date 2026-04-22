// Validación de correo electrónico
export const isValidEmail = (email: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

// Validación de contraseña (mínimo 8 caracteres, al menos una letra y un número)
export const isValidPassword = (password: string): boolean => {
	// Minimum 8 characters, at least one letter and one number
	return (
		password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password)
	);
};
