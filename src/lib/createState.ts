const createState = async (_this: any): Promise<void> => {
	await _this.setObjectNotExistsAsync("communication.requestIds", {
		type: "state",
		common: {
			name: "RequestIds",
			type: "string",
			role: "state",
			read: true,
			write: false,
			def: "",
		},
		native: {},
	});
};
export { createState };
