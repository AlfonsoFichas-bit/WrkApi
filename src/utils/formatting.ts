export const formatDate = (date: Date): string => {
	return date.toISOString().split('T')[0];
};

export const truncateString = (str: string, length: number): string => {
	if (str.length <= length) return str;
	return str.slice(0, length) + '...';
};
