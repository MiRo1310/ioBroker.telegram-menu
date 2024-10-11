import { TabValueEntries, TabValues } from "admin/app";

export const tabValues: TabValues[] = [
	// Danach noch generateActions anpassen in action.js
	{
		label: "SetState",
		value: "set",
		trigger: true, // Wenn Trigger true ist wird hierfür UsedTrigger gesucht
		entries: [
			{ name: "trigger", val: "", headline: "trigger", elementGetRows: "identification", required: true },
			{ name: "identification", val: "", headline: "identification", width: "20%", required: true },
			{ name: "values", val: "", headline: "value", width: "10%", required: true, btnCircleAdd: true },
			{ name: "returnText", val: "", headline: "returnText", width: "40%", required: true, btnCircleAdd: true },
			{ name: "ack", val: "false", headline: "Ack", title: "setWithAck", checkbox: true, width: "3%", required: true },
			{ name: "confirm", val: "false", headline: "Con", title: "confirmMessage", checkbox: true, width: "3%", required: true },
			{ name: "toggleCheckbox", val: "false", headline: "Tog", title: "toggle", checkbox: true, width: "3%", required: true },
			{ name: "parseMode", val: "false", headline: "Par", title: "parseMode", checkbox: true, width: "3%", required: true },
		],
		popupCard: { buttons: { add: true, remove: true, copy: true }, width: "99%", height: "70%" },
	},
	{
		label: "GetState",
		value: "get",
		trigger: true,
		entries: [
			{ name: "trigger", val: "", headline: "trigger", width: "20%", elementGetRows: "identification", required: true },
			{ name: "identification", val: "", headline: "identification", width: "40%", required: true },
			{ name: "text", val: "", headline: "text", width: "40%", required: true, btnCircleAdd: true },
			{ name: "newlineCheckbox", val: "true", headline: "New", title: "newlineCheckbox", checkbox: true, width: "3%", required: true },
			{ name: "parseMode", val: "false", headline: "Par", title: "parseMode", checkbox: true, width: "3%", required: true },
		],
		popupCard: { buttons: { add: true, remove: true, copy: true }, width: "99%", height: "70%" },
	},

	{
		label: "Send Picture",
		value: "pic",
		trigger: true,
		entries: [
			{ name: "trigger", val: "", headline: "trigger", width: "20%", elementGetRows: "identification", required: true },
			{ name: "identification", val: "", headline: "identification", width: "40%", required: true },
			{ name: "fileName", val: "", headline: "filename", width: "40%", required: true },
			{ name: "picSendDelay", val: "", headline: "delay", width: "40%", type: "number", required: true },
		],
		popupCard: { buttons: { add: true, remove: true }, width: "99%", height: "70%" },
	},
	{
		label: "Send Location",
		value: "loc",
		trigger: true,
		entries: [
			{ name: "trigger", val: "", headline: "trigger", width: "20%", elementGetRows: "latitude", required: true },
			{ name: "latitude", val: "", headline: "latitude", width: "20%", search: true, required: true },
			{ name: "longitude", val: "", headline: "longitude", width: "20%", search: true, required: true },
			{ name: "parseMode", val: "false", headline: "Par", title: "parseMode", checkbox: true, width: "3%", required: true },
		],
		popupCard: { buttons: { add: true, remove: true }, width: "99%", height: "70%" },
	},
	{
		label: "Events",
		value: "events",
		trigger: false,
		entries: [
			{ name: "identification", val: "", headline: "identification", width: "40%", search: true, required: true },
			{ name: "menu", val: "", headline: "executedMenu", width: "20%", elementGetRows: "menu", required: true },
			{ name: "condition", val: "", headline: "conditionMenu", width: "20%", noIcon: true, required: true },
			{ name: "ack", val: "false", headline: "Ack", title: "setAck", checkbox: true, width: "3%", required: true },
		],
		popupCard: { buttons: { add: false, remove: false }, width: "99%", height: "40%" },
	},
	{
		label: "Echarts",
		value: "echarts",
		searchRoot: { root: "echarts", type: ["chart"] }, // Search Root for SelectID
		trigger: true,
		entries: [
			{ name: "trigger", val: "", headline: "trigger", width: "20%", required: true },
			{ name: "preset", val: "", headline: "preset", width: "40%", elementGetRows: "preset", search: true, required: true },
			{ name: "background", val: "#FFFFFF", headline: "background", width: "10%", required: true },
			{ name: "theme", val: "light", headline: "theme", width: "10%", required: true },
			{ name: "filename", val: "echarts-temp-photo.jpg", headline: "filename", width: "20%", required: true },
		],
		popupCard: { buttons: { add: true, remove: true }, width: "99%", height: "70%" },
	},
	{
		label: "Http Request",
		value: "httpRequest",
		trigger: true,
		entries: [
			{ name: "trigger", val: "", headline: "trigger", width: "20%", required: true },
			{ name: "url", val: "", headline: "url", width: "20%", elementGetRows: "url", search: true, required: true },
			{ name: "user", val: "", headline: "user", width: "20%" },
			{ name: "password", val: "", headline: "password", password: true, width: "20%" },
			{ name: "filename", val: "http-request-photo.jpg", headline: "filename", width: "20%", required: true },
		],
		popupCard: { buttons: { add: true, remove: true }, width: "99%", height: "70%" },
	},
];
// Danach noch generateActions anpassen in action.js

export const navEntries: TabValueEntries[] = [
	{ name: "call", val: "", headline: "trigger", width: "25%", editWidth: "98%" },
	{ name: "value", val: "", headline: "navigation", width: "45%", editWidth: "98%" },
	{ name: "text", val: "chooseAction", headline: "text", width: "35%", editWidth: "98%" },
	{ name: "parseMode", val: "false", headline: "Par", title: "parseMode", checkbox: true, width: "10%" },
];
