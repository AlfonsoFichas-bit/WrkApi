export type UserPayload = {
	id: string;
	email: string;
	globalRole: string;
};

export type Variables = {
	user: UserPayload;
	projectRole?: string;
};

export type Env = {
	Variables: Variables;
};
