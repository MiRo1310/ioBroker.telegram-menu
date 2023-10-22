/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "helperText"}]*/

const globalText = {
	text1: "TRIGGER durch einen eindeutigen Wert ersetzen.",
	textID: "",
};
const helperText = {
	nav: [
		{
			text: "menu:percent10:TRIGGER:",
			info:
				"<strong>Submenu Prozent</strong><br> 10 kann ersetzt werden und gibt die Schrittweite an 0%, 10%, 20%...! " +
				globalText.text1 +
				" Dieser wird in Aktion unter SetState genutzt. Die gewünschte ID eintragen. Unter Wert ein ! einfügen",
		},
		{
			text: "menu:number0-6-1-UNIT:TRIGGER:",
			info:
				"<strong>Submenu Number</strong><br> Die Zahlen können komplett ausgetauscht werden. 0-6 gibt die Spanne an, und 1 die Schrittweite, UNIT wird durch eine Einheit ersetzt, kann aber auch leer bleiben. " +
				globalText.text1,
		},
		{
			text: "menu:switch-ein.true-aus.false:TRIGGER:",
			info:
				"<strong>Submenu Switch</strong><br> Generiert zwei Buttons, in diesem Fall ein und aus mit den jeweiligen Werten true und false. " +
				globalText.text1,
		},
		{ text: "menu:back", info: "Beim Betätigen springt man in das vorherige Menu zurück." },
	],
	navText: [
		{
			text: "{status:'id':'ID'}",
			info: "Fragt den Wert der ID ab, und wird dann durch den Wert ersetzt, so kann Text runtherum geschrieben werden.",
		},
		{
			text: "{set:'id':'ID',val,ack}",
			info: "Setzt den Wert der ID auf den val, mit ack(bestätigt)",
		},
	],
	getText: [
		{ text: "{math:/10}", info: "Rechnet den Wert um, /10 kann ersetzt werden" },
		{ text: "{time}", info: "Wandelt einen Unix-Zeitstempel zu einer lokalen Zeit um" },
		{ text: "{common.name}", info: "Gibt den Namen des Datenpunkts aus" },
		{ text: "&&", info: "Platzhalter für das Value" },
	],
	setText: [
		{ text: "{novalue}", info: "Das Value wird im Rückgabetext nicht angegeben" },
		{ text: "ack:true", info: "Bestätigt den Wert" },
		{
			text: 'change{"true":"an","false":"aus"}',
			info: "Ändert den Wert in dem RückgabeText, in diesem Fall von true zu an und false zu aus",
		},
		{ text: "&&", info: "Platzhalter für das Value" },
		{
			text: "{'id':'ID','text':'Wert wurde gesetzt:'}",
			info: "Wenn man die Änderung eines anderen Datenpunkts mitgeteilt bekommmen möchte nachdem man den Datenpunkt im ID Input Feld gesetzt hat. Die Änderung wird nur dann mit geteilt wenn diese mit ack:true gesetzt wird. Es muss zwingend ein Text ausserhalb der {} angegeben werden, ansonsten wird dieser automatisch hinzugefügt.",
		},
	],
};
