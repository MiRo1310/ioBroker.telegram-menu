const globalItems = [
	{
		status: "",
		places: ["text", "value"],
		data: [
			{
				text: "{status:'ID':true}",
				info: "statusMenu",
			},
		],
	},
	{ newline: "", places: ["text", "set", "get"], data: [{ text: "\\n", info: "breakpointNewline" }] },
	{
		parse_Mode: "",
		places: ["text", "set", "get"],
		data: [
			{ text: "<b> </b>", info: "parseModeBold" },
			{ text: "<i> </i>", info: "parseModeItalic" },
			{ text: "<code> </code>", info: "parseModeCode" },
			{ text: "<a href=“URL“>Link</a>", info: "parseModeLink" },
		],
	},
	{
		time: "",
		places: ["text", "get"],
		data: [{ text: "{time}", info: "convertsUnixTimestamp" }],
	},
	{
		change: "",
		places: ["text", "set", "get"],
		data: [
			{
				text: 'change{"true":"an","false":"aus"}',
				info: "changeFunction",
			},
		],
	},
	{
		textID: "",
		places: ["text", "set"],
		data: [
			{
				text: "",
				info: "insertID",
			},
		],
	},
];
export interface HelperText {
	nav: {
		value: { text: string; head?: string; info: string }[];
		text: { text: string; info: string }[];
	};
	get: { text: { text: string; info: string }[] };
	set: {
		returnText: { text: string; info: string }[];
		values: { text: string; info: string }[];
	};
}
const helperText: HelperText = {
	// Nav
	nav: {
		value: [
			{
				text: "menu:percent10:TRIGGER:",
				head: "<strong>Submenu Percent</strong><br>",
				info: "menuPercent",
			},
			{
				text: "menu:number0-6-1-UNIT:TRIGGER:",
				head: "<strong>Submenu Number</strong><br>",
				info: "menuNumber",
			},
			{
				text: "menu:switch-ein.true-aus.false:TRIGGER:",
				head: "<strong>Submenu Switch</strong><br>",
				info: "menuSwitch",
			},
			{
				text: "menu:dynSwitch[Name1|value1, Name2|value2, value3]:TRIGGER:LengthOfRow:",
				head: "<strong>Submenu Dynamic Switch</strong><br>",
				info: "menuDynamicSwitch",
			},
			{
				text: "menu:deleteAll:Navigation",
				head: "<strong>Submenu Delete All</strong><br>",
				info: "menuDeleteAll",
			},

			{
				text: "menu:back",
				info: "menuBack",
			},
		],
		text: [
			{
				text: "{set:'id':'ID',val,ack}",
				info: "setID",
			},
			{
				text: "{time.lc,(DD MM YYYY hh:mm:ss:sss),id:'ID'}",
				info: "lcTimestamp",
			},
			{
				text: "{time.ts,(DD MM YYYY hh:mm:ss:sss),id:'ID'}",
				info: "tsTimestamp",
			},
		],
	},
	get: {
		text: [
			{ text: "{math:/10}", info: "math" },

			{ text: "{common.name}", info: "commonName" },
			{ text: "&&", info: "placeholderValue" },
			{ text: "{round:2}", info: "valueRound" },
			{
				text: "{time.lc,(DD MM YYYY hh:mm:ss:sss)}",
				info: "lcTimeStamp",
			},
			{
				text: "{time.ts,(DD MM YYYY hh:mm:ss:sss)}",
				info: "tsTimeStamp",
			},

			{
				text: '{var1:ID;var2:ID; var1 ==var2 ? "equal" : var1 < var2 ? "var1 is smaller" : "var1 is greater"}',
				info: "binding",
			},
			{
				text: "{json;[value-1-inJSON:NameTH-Col1,value-2-inJSON:NameTH-Col1];Header;}",
				info: "jsonTable",
			},
			{
				text: "{json;[name:Name];Header;shoppinglist;}",
				info: "jsonShoppingList",
			},
			{
				text: "{json;[value-1-inJSON:NameTH-Col1,value-2-inJSON:NameTH-Col1];Header;TextTable;}",
				info: "jsonTable",
			},
		],
	},
	set: {
		returnText: [
			{ text: "{novalue}", info: "noValue" },
			{ text: "&&", info: "placeholderValue" },
			{
				text: "{'id':'ID','text':'Your Text'}",
				info: "notifiedByChangeOfAnotherState",
			},
			{
				text: "{confirmSet:The value has been set:noValue}",
				info: "confirmSet",
			},
			{
				text: "{setDynamicValue:RequestText:Type:ConfirmText:ID:}",
				info: "setDynamicValue",
			},
		],
		values: [
			{
				text: "{id:ID}",
				info: "manuallyValue",
			},
			{
				text: "{value}",
				info: "modifiedSubmenuValue",
			},
		],
	},
};
globalItems.forEach((element) => {
	element.data.forEach((data) => {
		if (element.places.includes("value")) {
			helperText.nav.value.push(data);
		}
		if (element.places.includes("text")) {
			helperText.nav.text.push(data);
		}
		if (element.places.includes("set")) {
			helperText.set.returnText.push(data);
		}
		if (element.places.includes("get")) {
			helperText.get.text.push(data);
		}
	});
});
export default helperText;
