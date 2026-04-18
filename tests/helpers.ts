import app from "../src/index";

// Helper to make requests to the Hono app
export const request = async (
	path: string,
	options: {
		method?: string;
		headers?: Record<string, string>;
		body?: any;
	} = {},
) => {
	const res = await app.request(path, {
		method: options.method || "GET",
		headers: options.headers,
		body: options.body ? JSON.stringify(options.body) : undefined,
	});

	// Try to parse JSON, if it fails return the text
	const text = await res.text();
	try {
		return {
			status: res.status,
			body: JSON.parse(text),
			headers: res.headers,
		};
	} catch {
		return {
			status: res.status,
			body: text,
			headers: res.headers,
		};
	}
};
