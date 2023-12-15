const createState = async (_this) => {
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
module.exports = { createState };
