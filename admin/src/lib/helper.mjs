const globalText = {
	textID: "To insert an ID, simply insert the block first, select the ID. This will then be automatically inserted in the appropriate place, even if the ID is to be changed. If the code does not recognize the block, the ID is appended to the end.",
};
const parse_Mode = [
	{ text: "<b> </b>", info: "Text in Parse Mode is Bold" },
	{ text: "<i> </i>", info: "Text in Parse Mode is Italic" },
	{ text: "<code> </code>", info: "Text in Parse Mode is Code" },
	{ text: "<a href=“URL“>Link</a>", info: "Text in Parse Mode is Link" },
];

const helperText = {
	nav: [
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
			info: "Queries the value of the ID and then replaces it with the value, so text can be written around it",
		},
		{
			text: "{set:'id':'ID',val,ack}",
			info: "Sets the value of the ID to the val, with ack(confirmed)",
		},
		{
			text: 'change{"true":"an","false":"aus"}',
			info: "Changes the value in the return text, in this case from true to on and false to off",
		},
		{ text: "", info: globalText.textID },
	],
	get: [
		{ text: "{math:/10}", info: "Converts the value, /10 can be replaced" },
		{ text: "{time}", info: "Converts a Unix timestamp to a local time" },
		{ text: "{common.name}", info: "Outputs the name of the data point" },
		{ text: "&&", info: "Placeholder for the value" },
		{ text: "{round:2}", info: "Rounds the value for example to 2 decimal places" },
		{
			text: 'change{"true":"an","false":"aus"}',
			info: "Changes the value in the return text, in this case from true to on and false to off",
		},
	],
	set: [
		{ text: "{novalue}", info: "The Value is not specified in the return text" },
		{ text: "&&", info: "Placeholder for the value" },
		{
			text: "{'id':'ID','text':'Your Text'}",
			info: "If you want to be notified of the change of another data point after you have set the data point in the ID input field. The change will only be shared if it is set with ack:true. It is mandatory to specify a text outside the {}, otherwise it will be added automatically.",
		},
		{ text: "", info: globalText.textID },
	],
};
parse_Mode.forEach((element) => {
	helperText.text.push(element);
	helperText.get.push(element);
	helperText.set.push(element);
});

export default helperText;
