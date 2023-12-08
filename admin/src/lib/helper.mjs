const globalItems = [
	{ newline: "", places: ["text", "set", "get"], data: [{ text: "\\n", info: "Breakpoint for a new line, Only insert this in the Text" }] },
	{
		parse_Mode: "",
		places: ["text", "set", "get"],
		data: [
			{ text: "<b> </b>", info: "Text in Parse-Mode is Bold" },
			{ text: "<i> </i>", info: "Text in Parse-Mode is Italic" },
			{ text: "<code> </code>", info: "Text in Parse-Mode is Code" },
			{ text: "<a href=“URL“>Link</a>", info: "Text in Parse-Mode is Link" },
		],
	},
	{
		time: "",
		places: ["text", "get"],
		data: [{ text: "{time}", info: "Converts a Unix timestamp to a local time" }],
	},
	{
		textID: "",
		places: ["text", "set"],
		data: [
			{
				text: "",
				info: "To insert an ID, simply insert the block first, select the ID. This will then be automatically inserted in the appropriate place, even if the ID is to be changed. If the code does not recognize the block, the ID is appended to the end.",
			},
		],
	},
];

const helperText = {
	// Nav
	value: [
		{
			text: "menu:percent10:TRIGGER:",
			head: "<strong>Submenu Percent</strong><br>",
			info: "10 can be replaced and indicates the step size 0%, 10%, 20%...! Replace TRIGGER with a unique value. This is used in action SetState. Enter the desired ID. Below value ! insert",
		},
		{
			text: "menu:number0-6-1-UNIT:TRIGGER:",
			head: "<strong>Submenu Number</strong><br>",
			info: "The numbers can be completely exchanged. 0-6 indicates the range, and 1 the step size, UNIT is replaced by a unit, but can also be left empty. Replace TRIGGER with a unique value.",
		},
		{
			text: "menu:switch-ein.true-aus.false:TRIGGER:",
			head: "<strong>Submenu Switch</strong><br>",
			info: "Generates two buttons, in this case on and off with the respective values true and false. Replace TRIGGER with a unique value.",
		},

		{
			text: "menu:back",
			info: "When pressed, you jump back to the previous menu",
		},
	],
	text: [
		{
			text: "{status:'id':'ID'}",
			info: "Queries the value of the ID and then replaces it with the value, so text can be written around it, it is also possible to use it more than one time in a row",
		},
		{
			text: "{set:'id':'ID',val,ack}",
			info: "Sets the value of the ID to the val, with ack(confirmed)",
		},
		{
			text: "{time.lc,(DD MM YYYY hh:mm:ss:sss),id:'ID'}",
			info: "LastChange. Converts a Unix timestamp to a local time, the format can be changed, for example to DD.MM.YYYY YY hh:mm:ss:sss",
		},
		{
			text: "{time.ts,(DD MM YYYY hh:mm:ss:sss),id:'ID'}",
			info: "TimeStamp. Converts a Unix timestamp to a local time, the format can be changed, for example to DD.MM.YYYY YY hh:mm:ss:sss",
		},
		{
			text: 'change{"true":"an","false":"aus"}',
			info: "Changes the value in the return text, in this case from true to on and false to off",
		},
	],
	get: [
		{ text: "{math:/10}", info: "Converts the value, /10 can be replaced" },

		{ text: "{common.name}", info: "Outputs the name of the data point" },
		{ text: "&&", info: "Placeholder for the value" },
		{ text: "{round:2}", info: "Rounds the value for example to 2 decimal places" },
		{
			text: "{time.lc,(DD MM YYYY hh:mm:ss:sss)}",
			info: "LastChange. Converts a Unix timestamp to a local time, the format can be changed, for example to DD.MM.YYYY YY hh:mm:ss:sss",
		},
		{
			text: "{time.ts,(DD MM YYYY hh:mm:ss:sss)}",
			info: "TimeStamp. Converts a Unix timestamp to a local time, the format can be changed, for example to DD.MM.YYYY YY hh:mm:ss:sss",
		},
		{
			text: 'change{"true":"an","false":"aus"}',
			info: "Changes the value in the return text, in this case from true to on and false to off",
		},
		{
			text: '{var1:ID;var2:ID; var1 ==var2 ? "equal" : var1 < var2 ? "var1 is smaller" : "var1 is greater"}',
			info: "Bindings: First Var with id then the condition and the text.",
		},
	],
	set: [
		{ text: "{novalue}", info: "The Value is not specified in the return text" },
		{ text: "&&", info: "Placeholder for the value" },
		{
			text: "{'id':'ID','text':'Your Text'}",
			info: "If you want to be notified of the change of another data point after you have set the data point in the ID input field. The change will only be shared if it is set with ack:true. It is mandatory to specify a text outside the {}, otherwise it will be added automatically.",
		},
		{
			text: "{confirmSet:The value has been set:noValue}",
			info: "Attention. The value has only been set but not yet confirmed by the Adapter. You can remove noValue, then the value will displayed. Position && replaced by Value or will be pu at the End",
		},
	],
};
globalItems.forEach((element) => {
	element.data.forEach((data) => {
		if (element.places.includes("value")) helperText.value.push(data);
		if (element.places.includes("text")) helperText.text.push(data);
		if (element.places.includes("set")) helperText.set.push(data);
		if (element.places.includes("get")) helperText.get.push(data);
	});
});
export default helperText;
