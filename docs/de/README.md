![Logo](../../admin/telegram-menu.png)

## ioBroker telegram-menu Adapter

Erstelle interaktive Telegram-Menüs für deinen ioBroker.

Der Adapter ermöglicht die Kommunikation mit dem ioBroker über Telegram: Datenpunkte schalten, Werte abfragen, Bilder und Diagramme senden, HTTP-Requests auslösen und vieles mehr. Menüs werden in Gruppen organisiert und einzelnen Telegram-Nutzern zugeordnet.

---

### Erste Schritte

Hilfe-Texte sind direkt im Adapter über diesen Button abrufbar: ![Button HelperText](../pic/btnHelperTexte.png)

**Wichtig:** Damit ein Menü genutzt werden kann, muss unter „Benutzer von Telegram" mindestens ein Menü aktiv gesetzt sein (Checkbox auf der rechten Seite).

---

## Navigation

![Navigation](../pic/nav.png)

- **Zeile 1 (grün)** ist die Startnavigation – sie wird beim Start bzw. Neustart des Adapters automatisch gesendet und kann jederzeit manuell aufgerufen werden.
- Der Text rechts (z. B. „Wähle eine Aktion") ist frei wählbar, darf aber nicht leer sein.
- Buttons innerhalb einer Zeile werden mit `,` getrennt.
- Eine neue Button-Zeile wird mit `&&` erzeugt.

![Buttons in Telegram](../pic/image-1.png)

Wenn der Benutzer einen Button drückt, sendet Telegram den Button-Text an den Adapter. Dieser sucht nach dem passenden Eintrag in der Konfiguration – der **Call-Text muss exakt übereinstimmen und darf nur einmal vorkommen** (über alle verknüpften Menüs hinweg).

- Es können verschiedene vordefinierte Untermenüs verwendet werden, z. B. Ein-/Aus, Prozent oder Nummern (etwa für die Rollladensteuerung). Für jedes Submenü wird in der Aktions-Konfiguration automatisch ein neuer Trigger erstellt – dazu weiter unten mehr.

### Mehrere Menüs

Es ist möglich, von einem Menü zu einem anderen zu wechseln. Sinnvoll wenn zwei Personen dasselbe Menü gemeinsam nutzen, aber einer der Nutzer Zugriff auf ein zusätzliches Menü haben soll, auf das der andere keinen Zugriff hat. In beiden Gruppen ist der entsprechende Button sichtbar, aber mit einer Funktion, die nur für einen der Nutzer relevant ist. Damit dies funktioniert, **muss der jeweilige Benutzer in beiden Gruppen eingetragen sein**.

Damit das zweite Menü (Untermenü) korrekt funktioniert, muss der Auslösetext der Startseite des Untermenüs deaktiviert werden: die Zelle „Auslösen" einfach leer lassen. Die Zeile wird dann **orange** dargestellt und ein Hinweis erscheint, dass es sich um ein Untermenü handelt. (Ein `-` als Platzhalter funktioniert ebenfalls weiterhin.)

**Wichtig:** Auch bei zwei verknüpften Menüs darf jeder Call-Text nur einmal vorkommen. Zwei Menüs, die keine gemeinsamen Nutzer haben und nicht miteinander verknüpft sind, dürfen hingegen dieselben Einträge verwenden (z. B. „Licht" in beiden).

### Icons in Menü-Buttons

![Icon1](../pic/heizung-icon1.png)

Emojis lassen sich direkt als Button-Text einsetzen – einfach ein Emoji kopieren (z. B. von https://www.getemojis.net/) oder per `Windows + .` einfügen. Es wird das Emoji selbst eingefügt, nicht sein HTML-Code.

![Icon2](../pic/heizung-icon2.png)

### Verlauf löschen

Um alle Nachrichten zu löschen (ähnlich „Verlauf löschen" im Client), trägt man bei einem Menüpunkt Folgendes ein:

```
menu:deleteAll:Startseite
```

`Startseite` ist der Menü-Name, der nach dem Löschen aufgerufen wird. Es können nur Nachrichten gelöscht werden, die jünger als 48 Stunden sind.

---

### Rückgabetext-Platzhalter

Diese Ausdrücke können in Navigation, SetState und GetState im Rückgabetext an beliebiger Stelle eingesetzt werden.

#### <span id="status"></span>Status eines Datenpunkts anzeigen

```
{status:'ID':true}
```

`ID` durch die gewünschte Datenpunkt-ID ersetzen. Der Ausdruck muss direkt an der Stelle stehen, an der der Status angezeigt werden soll. Der zweite Parameter (`true`/`false`) steuert, ob `change{...}` auf diesen Wert angewendet werden darf – relevant wenn mehrere `{status:...}`-Abfragen im selben Rückgabetext stehen.

#### Wert austauschen

```
change{"true":"an","false":"aus"}
```

Tauscht den zurückgegebenen Wert gegen einen lesbaren Text aus. Kann direkt hinter `{status:...}` oder dem `&&`-Platzhalter stehen.

#### Datenpunkt beim Öffnen setzen

```
{set:'id':'ID',val,ack}
```

Setzt beim Öffnen einer Navigation einen Datenpunkt. `ID` = Datenpunkt-ID, `val` = zu setzender Wert, `ack` = bestätigt (`true`) oder unbestätigt (`false`).

#### Zeitstempel senden

Für die letzte Änderung eines Datenpunkts:
```
{time.lc,(DD MM YYYY hh:mm:ss:sss),id:'ID'}
```

Für den letzten Zeitstempel eines Datenpunkts:
```
{time.ts,(DD MM YYYY hh:mm:ss:sss),id:'ID'}
```

Das Format in den Klammern ist frei anpassbar. Nicht benötigte Platzhalter können entfernt, aber nicht umbenannt werden. Ausnahme: `YYYY` kann als `YY` geschrieben werden.

#### Unix-Zeitstempel in Uhrzeit umwandeln

```
{time}
```

Wird dort im Rückgabetext eingesetzt, wo der umgewandelte Wert erscheinen soll.

#### Zeilenumbruch

```
\n
```

#### Parse Mode

Ermöglicht HTML-Formatierung in Telegram-Nachrichten:

| Tag | Darstellung |
|---|---|
| `<b>Text</b>` | **fett** |
| `<i>Text</i>` | *kursiv* |
| `<code>Text</code>` | `Code` |
| `<a href="URL">Link</a>` | Verlinkter Text |

Parse Mode in den Einstellungen der jeweiligen Zeile aktivieren und den Text zwischen die Tags einfügen. Weitere Tags können unterstützt werden.

---

## Submenüs

![Submenus](../pic/image10.png)

Submenüs werden in der Navigation eingetragen, um sie aufzurufen. Der `TRIGGER` muss einzigartig sein (darf also nur einmal vorkommen) und verweist auf den gleichnamigen Trigger in der Aktions-Konfiguration, wo die zu schaltende ID angegeben wird.

### Vordefinierte Submenüs

**Ein-/Aus-Schalter:**
```
menu:switch-on.true-off.false:TRIGGER:
```
`on` / `off` sind die Button-Beschriftungen. `true` / `false` werden automatisch als Boolean interpretiert, können aber durch beliebigen Text ersetzt werden.

---

**Prozent-Stufen:**
```
menu:percent10:TRIGGER:
```
Die `10` definiert die Schrittweite und ist variabel.

---

**Zahlenbereich:**
```
menu:number1-20-2-unit:TRIGGER:
```
`1`–`20` ist die Spanne (auch umgekehrt `20-1` möglich), `2` die Schrittweite, `unit` die Einheit. Für negative Schrittweiten `(-)` voranstellen. Beispiel: `menu:number16-36-4-°C:temperaturXY:`

---

**Dynamisches Menü:**
```
menu:dynSwitch[Name1|value1, Name2|value2, value3]:TRIGGER:LengthOfRow:
```
Erstellt ein Menü aus einem Array. `Name|Wert` definiert Beschriftung und Wert des jeweiligen Buttons. Wird nur ein Wert ohne `|` angegeben, dient er gleichzeitig als Beschriftung. `LengthOfRow` gibt die Anzahl der Buttons pro Zeile an. Dezimalzahlen als Wert sind möglich (z. B. `2.5`). Als Button-Name kann auch der aktuelle Wert eines Datenpunkts genutzt werden: `{status:'ID':true}` – [für weitere Infos siehe hier](#status).

---

**Zurück:**
```
menu:back
```
Wechselt zur zuletzt aufgerufenen Seite zurück (max. 20 Seiten).

<br>
<img src="../pic/menu_percent10_r2.png" width="800"/>
<img src="../pic/submenu_setstate.png" width="800"/>

---

## SetState

![SetState](../pic/setState.png)

- Die Checkbox **„Schalten"** (rechts) wechselt einen Boolean-Datenpunkt bei jedem Aufruf zwischen `true` und `false`. Der Trigger-Name muss exakt dem Button-Text entsprechen, der die Aktion auslösen soll.
- Unter **„Wert"** kann ein beliebiger Wert eingetragen werden. Für verschiedene Werte jeweils einen eigenen SetState-Eintrag anlegen.
- States werden standardmäßig mit `ack:false` gesetzt – das ist erforderlich, um andere Adapter damit zu steuern. Soll `ack:true` direkt gesetzt werden, die Checkbox **„Ack"** aktivieren.
- **Bestätigung nach `ack:true`:** Sobald der angesprochene Adapter den Wert mit `ack:true` bestätigt, wird der Rückgabetext gesendet. Platzhalter für den gesetzten Wert im Rückgabetext: `&&`.

### Rückgabetext-Optionen für SetState

**Gesetzten Wert nicht mitsenden:**
```
{novalue}
```
Wird im Rückgabetext eingetragen, wenn der Wert in der Bestätigung nicht erscheinen soll.<br>
![novalue](../pic/image5.png)

---

**Änderung eines anderen Datenpunkts abwarten:**
```json
{"foreignId":"ID","text":"Wert wurde gesetzt:"}
```
Wartet auf `ack:true` des angegebenen Datenpunkts und sendet dann den Rückgabetext. `ID` durch die gewünschte Datenpunkt-ID ersetzen. Der Text kann frei angepasst werden. Der Platzhalter `&&` steht für den Wert des überwachten Datenpunkts.

<details>
  <summary>Alte Version anzeigen (ausklappbar)</summary>

### Alte (veraltet)
```
 {'id':'ID','text':'Wert wurde gesetzt:'} 
```
</details>
---

**Sofortige Bestätigung (ohne auf `ack:true` zu warten):**
```
{confirmSet:Wert wurde gesetzt:noValue}
```
Sendet eine sofortige Rückmeldung. Dies bedeutet nicht, dass ein Adapter den Wert tatsächlich verarbeitet hat. `noValue` unterdrückt die Wertanzeige.

---

**Dynamischen Wert vom Benutzer eingeben lassen:**
```
{setDynamicValue:RequestText:Type:ConfirmText:ID}
```
Nach Drücken des Buttons wartet der Adapter auf eine Texteingabe des Nutzers und schreibt sie anschließend in den Datenpunkt. Wird im Rückgabefeld eingetragen.

| Parameter | Beschreibung |
|---|---|
| `RequestText` | Aufforderungstext, der an den Nutzer gesendet wird |
| `Type` | Datentyp: `boolean`, `number` oder `string` |
| `ConfirmText` | Bestätigungstext nach dem Setzen (eigener Text möglich) |
| `ID` | Optional: ID eines anderen Datenpunkts, dessen Wert (nach `ack:true`) im Bestätigungstext angezeigt wird. Platzhalter: `&&` |

---

**Parse Mode, change, Zeilenumbruch:** Siehe Abschnitt [Rückgabetext-Platzhalter](#rückgabetext-platzhalter).

### Wert aus einem Submenü übernehmen

Das Submenü wie gewohnt anlegen. Im Wert-Feld von SetState den statischen Teil eintragen und `{value}` als Platzhalter für den Wert aus dem Submenü verwenden.

### Statischen und dynamischen Wert kombinieren

Im Wert-Feld kann ein statischer Text mit dem aktuellen Wert eines Datenpunkts kombiniert werden:

```
{id:ID}
```

`ID` durch die gewünschte Datenpunkt-ID ersetzen. Der `&&`-Platzhalter im Rückgabetext gibt an, wo das Ergebnis eingefügt wird. Ohne `&&` wird das Ergebnis am Ende angehängt.

**Beispiele:**

| Eingabe | Datenpunkt-Wert | Ausgabe |
|---|---|---|
| `{id:0_userdata.0.Fenster_Status}` | `true` | `true` |
| `{id:0_userdata.0.Count} {math:*2}` | `5` | `10` |
| `Test {id:0_userdata.0.Count} {math:*2} Test` | `5` | `Test Test 10` |
| `Test && {id:0_userdata.0.Count} {math:*2} Test` | `5` | `Test 10 Test` |
| `Status && {id:0_userdata.0.Count} {math:*2} change{"10":"an","20":"aus"}` | `5` | `Status an` |

Das Ergebnis wird immer am Ende des Textes angehängt – es sei denn, `&&` ist gesetzt, dann wird es an der Position des Platzhalters eingefügt.

---

## GetState

- Platzhalter `&&` gibt an, wo der abgerufene Wert im Rückgabetext erscheint.
- `change{"true":"an","false":"aus"}` – tauscht den zurückgegebenen Wert gegen lesbaren Text aus.
- `{math:/10}` – mathematische Berechnung auf den Wert anwenden (z. B. `/10`, `*2`, `+5`).

  ![math](../pic/image9.png)

- `{round:2}` – Wert auf N Dezimalstellen runden.
- `{time}` – Unix-Zeitstempel in lokale Zeit umwandeln.
- Checkbox **„Newline"** – bei mehreren gleichzeitigen GetState-Abfragen wird der Rückgabetext jeder Abfrage in einer neuen Zeile ausgegeben.

### Alle Werte einer ioBroker-Funktion abrufen

Anstatt einer konkreten ID `functions=Licht` eingeben (Beispiel). Mit `{common.name}` wird an der gewünschten Position im Ausgabetext der Name des Datenpunkts angezeigt.

![functions](../pic/functions.png)

### Tabellen

**JSON als Texttabelle anzeigen:**

```json
{"tableData":[{"key":"value-1-inJSON","label":"Spalte 1"},{"key":"value-2-inJSON","label":"Spalte 2"}],"tableLabel":"Überschrift","type":"TextTable"}
```

1. Unter „ID" einen Datenpunkt auswählen, der ein JSON enthält.
2. Das JSON wie oben anpassen: `key` entspricht dem Schlüssel im JSON des Datenpunkts, `label` ist der Spaltenname (wird `label` weggelassen, wird `key` als Spaltenname verwendet).
3. `tableLabel` ist die Tabellenüberschrift (leerer String = keine Überschrift).
4. `type` muss `"TextTable"` sein und darf nicht verändert werden.

---

**Alexa Shopping-Liste anzeigen:**

```json
{"tableData":[{"key":"name"}],"tableLabel":"Einkaufsliste","listName":"SHOP","type":"alexaShoppingList"}
```

Erstellt eine Liste mit Buttons für den `alexa-shoppinglist`-Adapter. Die Buttons entfernen das jeweilige Item aus der Alexa-Liste. `listName` muss mit dem in Alexa angelegten Listennamen übereinstimmen (z. B. `SHOP` oder `TOBUY`). Der Datenpunkt muss vom `alexa-shoppinglist`-Adapter stammen.

![InlineTable](../pic/inlinetable-grafik.png)
![TextTable](../pic/textable-grafik.png)

---

## Send Picture (Grafana)

- In den Einstellungen ein Grafana-Token hinterlegen.
- Ein Verzeichnis mit vollen Schreibrechten anlegen (z. B. `/opt/iobroker/grafana/`), um Bilder zwischenspeichern zu können.
- In der Aktion die Rendering-URL eintragen. Diese findet man in Grafana unter: Diagramm → Teilen → Direktlink zum gerenderten Bild. Die Option „Zeitbereich sperren" deaktivieren, damit immer das aktuelle Diagramm gesendet wird.
- Bei mehreren Diagrammen muss jeder Dateiname eindeutig sein, da sich die Bilder sonst gegenseitig überschreiben.
- Delay `0` → Bild wird sofort gesendet. Delay > 0 → Bild wird um den angegebenen Wert in Sekunden verzögert gesendet.

<img src="../pic/grafana.png" width="400"/>

---

## Send Location

1. Trigger auswählen.
2. Datenpunkt für den Breitengrad (`latitude`) und den Längengrad (`longitude`) angeben.

---

## Events

Integrierter Eventlistener: Wartet auf die Zustandsänderung eines Datenpunkts – wird dieser gesetzt (z. B. über ein Script oder einen Adapter), öffnet sich automatisch ein vordefiniertes Menü.

- Es wird auf die angegebene Bedingung geprüft. Unterstützte Operatoren: `=`, `!=`, `<`, `>`, `<=`, `>=`. Ist kein Operator ausgewählt, wird standardmäßig auf Gleichheit geprüft.
- Es wird auf `ack` des Datenpunkts geprüft.

---

## Echarts

Diagramme direkt aus dem Echarts-Adapter senden lassen.

| Feld | Beschreibung |
|---|---|
| **Preset** | Kann direkt aus der ioBroker-Objektstruktur übernommen werden |
| **Background** | Hintergrundfarbe des Diagramms |
| **Theme** | `auto`, `default`, `dark`, `dark-bold`, `dark-blue`, `gray`, `vintage`, `macarons`, `infographic`, `shine`, `roma`, `azul`, `blue`, `royal`, `tech-blue`, `red`, `red-velvet`, `green` |
| **Dateiname** | Individueller Dateiname für das Bild |

**Wichtig:** In den Einstellungen muss ein Verzeichnis mit voller Schreibberechtigung angegeben sein.

---

## HTTP Request

Sendet einen HTTP-Request – mit oder ohne Authentifizierung.

- **URL** – Pflichtfeld.
- **User / Passwort** – Optional, bei Bedarf leer lassen.
- **Dateiname** – kann auf dem voreingestellten Wert belassen werden.

---

## Einstellungen

| Einstellung | Beschreibung |
|---|---|
| **Telegram-Instanz** | Auswahl der Telegram-Instanz bei mehreren installierten Instanzen |
| **Text bei keinem Eintrag** | Wird gesendet, wenn kein passender Menü-Eintrag gefunden wurde. Kann über die Checkbox daneben deaktiviert werden |
| **Resize Keyboard** | Passt die Tastaturhöhe dynamisch an die Anzahl der Zeilen an. Standard: `false` ([Telegram API](https://core.telegram.org/bots/api#replykeyboardmarkup)) |
| **One Time Keyboard** | Blendet die Tastatur nach einmaliger Verwendung aus. Kann über eine spezielle Schaltfläche im Eingabefeld wieder eingeblendet werden. Standard: `false` ([Telegram API](https://core.telegram.org/bots/api#replykeyboardmarkup)) |
| **Token Grafana** | Optional – wird für den Abruf von Grafana-Diagrammen benötigt |
| **Verzeichnis** | Zwischenspeicher für Bilder und Diagramme (Grafana und Echarts). Volle Schreibrechte erforderlich |
| **Menü nach Neustart senden** | Kann deaktiviert werden. Bei deaktivierter Option muss das Menü beim ersten Start manuell über das Eingabefeld in der Telegram-App aufgerufen werden |
