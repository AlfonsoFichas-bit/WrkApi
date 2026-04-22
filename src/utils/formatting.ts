// Formatear fecha a formato ISO (YYYY-MM-DD)
export const formatDate = (date: Date): string => {
	return date.toISOString().split("T")[0];
};

// Truncar una cadena de texto a una longitud específica
export const truncateString = (str: string, length: number): string => {
	if (str.length <= length) return str;
	return str.slice(0, length) + "...";
};
