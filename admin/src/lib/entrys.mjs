export const tabValues = [
	{
		label: "SetState",
		value: "set",
		entrys: [
			{ name: "trigger", val: "", headline: "Trigger", elementGetRows: "IDs" },
			{ name: "IDs", val: "", headline: "ID", width: "20%" },
			{ name: "values", val: "", headline: "Value", width: "10%" },
			{ name: "returnText", val: "", headline: "Return text", width: "40%" },
			{ name: "ack", val: "false", headline: "Ack", title: "Set Value with ack-Flag", checkbox: true, width: "3%" },
			{ name: "confirm", val: "false", headline: "Con", title: "Confirm with message", checkbox: true, width: "3%" },
			{ name: "switch_checkbox", val: "false", headline: "Swi", title: "Switch", checkbox: true, width: "3%" },
			{ name: "parse_mode", val: "false", headline: "Par", title: "Parse Mode HTML", checkbox: true, width: "3%" },
		],
		popupCard: { buttons: { add: true, remove: true }, width: "99%", height: "70%" },
	},
	{
		label: "GetState",
		value: "get",
		entrys: [
			{ name: "trigger", val: "", headline: "Trigger", width: "20%", elementGetRows: "IDs" },
			{ name: "IDs", val: "", headline: "ID", width: "40%" },
			{ name: "text", val: "", headline: "Text", width: "40%" },
			{ name: "newline_checkbox", val: "true", headline: "New", title: "Newline", checkbox: true, width: "3%" },
			{ name: "parse_mode", val: "false", headline: "Par", title: "Parse Mode HTML", checkbox: true, width: "3%" },
		],
		popupCard: { buttons: { add: true, remove: true }, width: "99%", height: "70%" },
	},

	{
		label: "Send Picture",
		value: "pic",
		entrys: [
			{ name: "trigger", val: "", headline: "Trigger", width: "20%", elementGetRows: "IDs" },
			{ name: "IDs", val: "", headline: "ID", width: "40%" },
			{ name: "fileName", val: "", headline: "Filename", width: "40%" },
			{ name: "picSendDelay", val: "", headline: "Delay", width: "40%", type: "number" },
		],
		popupCard: { buttons: { add: true, remove: true }, width: "99%", height: "70%" },
	},
	{
		label: "Send Location",
		value: "loc",
		entrys: [
			{ name: "trigger", val: "", headline: "Trigger", width: "20%", elementGetRows: "latitude" },
			{ name: "latitude", val: "", headline: "Latitude", width: "20%", search: true },
			{ name: "longitude", val: "", headline: "Longitude", width: "20%", search: true },
			{ name: "parse_mode", val: "false", headline: "Par", title: "Parse Mode HTML", checkbox: true, width: "3%" },
		],
		popupCard: { buttons: { add: true, remove: true }, width: "99%", height: "70%" },
	},
	{
		label: "Events",
		value: "events",
		entrys: [
			{ name: "ID", val: "", headline: "ID", width: "40%", search: true },
			{ name: "menu", val: "", headline: "Executed Menu", width: "20%", elementGetRows: "menu" },
			{ name: "condition", val: "", headline: "Condition to open Menu", width: "20%" },
			{ name: "ack", val: "false", headline: "Ack", title: "Ack-Flag to open Menu", checkbox: true, width: "3%" },
		],
		popupCard: { buttons: { add: false, remove: false }, width: "99%", height: "40%" },
	},
	{
		label: "Echarts",
		value: "echarts",
		searchRoot: { root: "echarts", type: ["chart"] },

		entrys: [
			{ name: "trigger", val: "", headline: "Trigger", width: "20%" },
			// { name: "echartInstance", val: "echarts.0", headline: "Echart Instance", width: "40%" },
			{ name: "preset", val: "", headline: "Preset", width: "40%", elementGetRows: "preset", search: true },
			{ name: "background", val: "#FFFFFF", headline: "Background", width: "10%" },
			{ name: "theme", val: "light", headline: "Theme", width: "10%" },
			{ name: "filename", val: "echarts-temp-photo.jpg", headline: "Filename", width: "20%" },
		],
		popupCard: { buttons: { add: true, remove: true }, width: "99%", height: "70%" },
	},
];

export const navEntrys = [
	{ name: "call", val: "", headline: "Trigger", width: "15%" },
	{ name: "value", val: "", headline: "Navigation", width: "45%" },
	{ name: "text", val: "Choose an action", headline: "Text", width: "35%" },
	{ name: "parse_mode", val: "false", headline: "Par", title: "Parse Mode HTML", checkbox: true, width: "3%" },
];
