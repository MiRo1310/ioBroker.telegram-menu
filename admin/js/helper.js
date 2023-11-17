/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "helperText"}]*/

const globalText = {
	text1: "<span class='translate'>Replace TRIGGER with a unique value.</span>",
	textID: "<span class='translate'>To insert an ID, simply insert the block first, select the ID. This will then be automatically inserted in the appropriate place, even if the ID is to be changed. If the code does not recognize the block, the ID is appended to the end.</span>",
};

const helperText = {
	nav: [
		{
			text: "menu:percent10:TRIGGER:",
			info:
				"<strong>Submenu Percent</strong><br> <span class='translate'>10 can be replaced and indicates the step size 0%, 10%, 20%...!</span> " +
				// @ts-ignore
				globalText.text1 +
				" " +
				"<span class='translate'>This is used in action under SetState. Enter the desired ID. Below value! insert</span>",
		},
		{
			text: "menu:number0-6-1-UNIT:TRIGGER:",
			info:
				"<strong>Submenu Number</strong><br><span class='translate'>The numbers can be completely exchanged. 0-6 indicates the range, and 1 the step size, UNIT is replaced by a unit, but can also be left empty.</span>  " +
				globalText.text1,
		},
		{
			text: "menu:switch-ein.true-aus.false:TRIGGER:",
			info:
				"<strong>Submenu Switch</strong><br> <span class='translate'>Generates two buttons, in this case on and off with the respective values ​​true and false.</span> " +
				globalText.text1,
		},
		{
			text: "menu:back",
			info: " <span class='translate'>When pressed, you jump back to the previous menu</span> ",
		},
	],
	navText: [
		{
			text: "{status:'id':'ID'}",
			info: "<span class='translate'>Queries the value of the ID and then replaces it with the value, so text can be written around it</span>",
		},
		{
			text: "{set:'id':'ID',val,ack}",
			info: "<span class='translate'>Sets the value of the ID to the val, with ack(confirmed)</span>",
		},
		{ text: "", info: globalText.textID },
	],
	getText: [
		{ text: "{math:/10}", info: " <span class='translate'>Converts the value, /10 can be replaced</span>  " },
		{ text: "{time}", info: "<span class='translate'>Converts a Unix timestamp to a local time</span> " },
		{ text: "{common.name}", info: " <span class='translate'>Outputs the name of the data point</span> " },
		{ text: "&&", info: "<span class='translate'>Placeholder for the value</span>" },
		{ text: "{round:2}", info: "<span class='translate'>Rounds the value for example to 2 decimal places</span>" },
		{
			text: 'change{"true":"an","false":"aus"}',
			info: "<span class='translate'>Changes the value in the return text, in this case from true to on and false to off</span>",
		},
	],
	setText: [
		{ text: "{novalue}", info: "<span class='translate'>The Value is not specified in the return text</span>" },
		{ text: "ack:true", info: " <span class='translate'>Confirms the value</span> " },

		{ text: "&&", info: "<span class='translate'>Placeholder for the value</span>" },
		{
			text: "{'id':'ID','text':'Your Text'}",
			info: "<span class='translate'>If you want to be notified of the change of another data point after you have set the data point in the ID input field. The change will only be shared if it is set with ack:true. It is mandatory to specify a text outside the {}, otherwise it will be added automatically.</span>",
		},
		{ text: "", info: globalText.textID },
	],
};
