export const tabValues = [
	// Danach noch generateActions anpassen in action.js
	{
		label: "SetState",
		value: "set",
		trigger: true, // Wenn Trigger true ist wird hierfür UsedTrigger gesucht
		entrys: [
			{ name: "trigger", val: "", headline: "Trigger", elementGetRows: "IDs", required: true },
			{ name: "IDs", val: "", headline: "ID", width: "20%", required: true },
			{ name: "values", val: "", headline: "Value", width: "10%", required: true, btnCircleAdd: true },
			{ name: "returnText", val: "", headline: "Return text", width: "40%", required: true, btnCircleAdd: true },
			{ name: "ack", val: "false", headline: "Ack", title: "Set Value with ack-Flag", checkbox: true, width: "3%", required: true },
			{ name: "confirm", val: "false", headline: "Con", title: "Confirm with message", checkbox: true, width: "3%", required: true },
			{ name: "switch_checkbox", val: "false", headline: "Swi", title: "Switch", checkbox: true, width: "3%", required: true },
			{ name: "parse_mode", val: "false", headline: "Par", title: "Parse Mode HTML", checkbox: true, width: "3%", required: true },
		],
		popupCard: { buttons: { add: true, remove: true }, width: "99%", height: "70%" },
	},
	{
		label: "GetState",
		value: "get",
		trigger: true,
		entrys: [
			{ name: "trigger", val: "", headline: "Trigger", width: "20%", elementGetRows: "IDs", required: true },
			{ name: "IDs", val: "", headline: "ID", width: "40%", required: true },
			{ name: "text", val: "", headline: "Text", width: "40%", required: true, btnCircleAdd: true },
			{ name: "newline_checkbox", val: "true", headline: "New", title: "Newline", checkbox: true, width: "3%", required: true },
			{ name: "parse_mode", val: "false", headline: "Par", title: "Parse Mode HTML", checkbox: true, width: "3%", required: true },
		],
		popupCard: { buttons: { add: true, remove: true }, width: "99%", height: "70%" },
	},

	{
		label: "Send Picture",
		value: "pic",
		trigger: true,
		entrys: [
			{ name: "trigger", val: "", headline: "Trigger", width: "20%", elementGetRows: "IDs", required: true },
			{ name: "IDs", val: "", headline: "ID", width: "40%", required: true },
			{ name: "fileName", val: "", headline: "Filename", width: "40%", required: true },
			{ name: "picSendDelay", val: "", headline: "Delay (ms)", width: "40%", type: "number", required: true },
		],
		popupCard: { buttons: { add: true, remove: true }, width: "99%", height: "70%" },
	},
	{
		label: "Send Location",
		value: "loc",
		trigger: true,
		entrys: [
			{ name: "trigger", val: "", headline: "Trigger", width: "20%", elementGetRows: "latitude", required: true },
			{ name: "latitude", val: "", headline: "Latitude", width: "20%", search: true, required: true },
			{ name: "longitude", val: "", headline: "Longitude", width: "20%", search: true, required: true },
			{ name: "parse_mode", val: "false", headline: "Par", title: "Parse Mode HTML", checkbox: true, width: "3%", required: true },
		],
		popupCard: { buttons: { add: true, remove: true }, width: "99%", height: "70%" },
	},
	{
		label: "Events",
		value: "events",
		trigger: false,
		entrys: [
			{ name: "ID", val: "", headline: "ID", width: "40%", search: true, required: true },
			{ name: "menu", val: "", headline: "Executed Menu", width: "20%", elementGetRows: "menu", required: true },
			{ name: "condition", val: "", headline: "Condition to open Menu", width: "20%", noIcon: true, required: true },
			{ name: "ack", val: "false", headline: "Ack", title: "Ack-Flag to open Menu", checkbox: true, width: "3%", required: true },
		],
		popupCard: { buttons: { add: false, remove: false }, width: "99%", height: "40%" },
	},
	{
		label: "Echarts",
		value: "echarts",
		searchRoot: { root: "echarts", type: ["chart"] }, // Search Root for SelectID
		trigger: true,
		entrys: [
			{ name: "trigger", val: "", headline: "Trigger", width: "20%", required: true },
			{ name: "preset", val: "", headline: "Preset", width: "40%", elementGetRows: "preset", search: true, required: true },
			{ name: "background", val: "#FFFFFF", headline: "Background", width: "10%", required: true },
			{ name: "theme", val: "light", headline: "Theme", width: "10%", required: true },
			{ name: "filename", val: "echarts-temp-photo.jpg", headline: "Filename", width: "20%", required: true },
		],
		popupCard: { buttons: { add: true, remove: true }, width: "99%", height: "70%" },
	},
	{
		label: "Http Request",
		value: "httpRequest",
		trigger: true,
		entrys: [
			{ name: "trigger", val: "", headline: "Trigger", width: "20%", required: true },
			{ name: "url", val: "", headline: "URL", width: "20%", elementGetRows: "url", search: true, required: true },
			{ name: "user", val: "", headline: "User", width: "20%" },
			{ name: "password", val: "", headline: "Password", password: true, width: "20%" },
			{ name: "filename", val: "http-request-photo.jpg", headline: "Filename", width: "20%", required: true },
			// { name: "delay", val: 5000, headline: "Delay (ms)", width: "20%", type: "number", required: true },
		],
		popupCard: { buttons: { add: true, remove: true }, width: "99%", height: "70%" },
	},
];
// Danach noch generateActions anpassen in action.js

export const navEntries: NavEntries[] = [
	{ name: "call", val: "", headline: "Trigger", width: "25%", editWidth: "98%" },
	{ name: "value", val: "", headline: "Navigation", width: "45%", editWidth: "98%" },
	{ name: "text", val: "Choose an action", headline: "Text", width: "35%", editWidth: "98%" },
	{ name: "parse_mode", val: "false", headline: "Par", title: "Parse Mode HTML", checkbox: true, width: "10%" },
];
