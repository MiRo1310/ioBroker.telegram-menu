![Logo](../../admin/telegram-menu.png)

## ioBroker telegram-menu adapter

Erstelle ganz einfach Telegrammmenüs
Der Adapter dient dazu per Telegrammenu mit dem Iobroker zu kommunizieren, Datenpunkt zu schalten oder Werte von Datenpunkte abzufragen. Hierzu kann man verschiedene Gruppen erstellen in denen man Menus erstellen kann. Diese kann man dann Benutzer zuordnen.

Let´s get started!

### Navigation

![Navigation](../pic/nav.png)<br>
Hier sieht die Navigation.

-   Zeile 1 (grün) ist die Startnavigation, diese wird gesendet wenn der Adapter gestartet bzw. neu gestartet wird. Man kann dies aber über einen Button wieder aufrufen.
-   Der Text auf der rechten Seite "Wähle eine Aktion" ist frei wählbar, darf aber nicht leer sein.
-   Buttons in einer Reihe werden mit einem `,` getrennt
-   Eine neue Zeile erreicht man mit dem Trenner `&&`.

![Buttons in Telegram](../pic/image-1.png)<br>
Hier, das gesendete Menu in Telegram. Wenn ich jetzt z.B. auf Heizung drücke wird "Heizung" als Text an den Adapter gesendet, dieser sucht nach dem passenden Call Text, dieser muss genau so geschrieben sein, siehe im oberen Bild.&nbsp;
**Ganz wichtig, jede Bezeichnung des Call Text darf nur einmal vorkommen, d.h. er muss einzigartg sein**

-   Es können verschiedene vordefinierte Untermenus verwendet werden, z.B. on-off , Prozent oder Nummern für z.B. die Rolladensteuerung, hierzu wird in den Aktionen automatosch ein neuer Trigger erstellt, aber dazu unten mehr.

-   Es ist möglich, von einem Menü zu einem anderen Menü zu wechseln. Dies ergibt Sinn, wenn zwei Personen dasselbe Menü gemeinsam verwenden, aber wenn User1 ein zusätzliches Menü erhält, auf das User2 keinen Zugriff haben soll. In beiden Gruppen ist der entsprechende Button sichtbar, jedoch mit einer Funktionalität, die nur für User1 relevant ist. Damit dies funktioniert, muss der jeweilige Benutzer in beiden Gruppen spezifiziert sein.
-   Damit das Zweite Menu, also ein Untermenu funktioniert muss der Call Text der Startseite deaktiviert werden. Dieses wird erreicht indem man ein `-` einträgt. Jetzt kann User1 von Menu1 auf Menu2 zugreifen indem er auf den entsprechenden Button drückt.&nbsp;**Wichtig!! Auch wenn es zwei Menus sind, darf jeder Call Text nur einmal vorkommen!**
-   Bei zwei Menus die nicht den gleichen User haben, darf natürlich jedes Menu einen Eintrag z.B. Licht haben, aber nicht wenn von einem zum anderen gesprungen wird.

### Allgemein

-   Alle im Anschluss vorgestellten Submenüs und speziellen Einstellungen sind direkt im Adapter zu finden . Diese Einstellungen sind sortiert und genau dort platziert, wo sie eingesetzt werden können.
    Über diesen Button kann man die "HelperText"aufrufen ![Button HelperText](../pic/btnHelperTexte.png)

#### Verlauf löschen

Um alle Nachrichten zu löschen (ähnlich "Verlauf löschen" im Client) fügt man bei einen Menupunkt `menu:deleteAll:Navigation` -&nbsp;**Navigation**&nbsp; ist der Menu-Name, der anschliessend aufgerufen werden soll (z.b. Startseite)

#### Status

Um den Status einer ID anzuzeigen, beim Aufruf einer Navigation oder eines Submenus, kann folgender Eintrag im Textfeld genutzt werden.<br>
![Config for Status](../pic/statusConfig.png)
Das Ergebnis wäre dann dieses!<br>
![Telegram Status](../pic/TelegramStatus.png)

#### Icons in den Menu-Buttons

![Icon1](../pic/heizung-icon1.png)

-   möchte man spezielle Icons in den Menu-buttons haben, kopiert man sich ein Emoji (z.B. https://www.getemojis.net/html/#Emoji-Liste ) und setzt es wie ein Schriftzeichen ein. Es wird nicht der Code des Emoji's kopiert, sondern das Emoji direkt!

![Icon2](../pic/heizung-icon2.png)

### Submenus

![Submenus](../pic/image10.png)

-   Die Menus werden in die Navigation eingetragen um sie aufzurufen
-   Der name muss immer ein einzigartiger Name sein, darf also immer nur einmal vorkommen und verweist dann auf den Trigger in Aktion, wo die ID angegeben wird.

```
 menu:switch-on.true-off.false:name:
```

-   Es kann jeder Wert ersetzt werden, on und off sind die Buttons, true und false werden automatisch zu booleans gewandelt, kann aber auch durch Text ersetzt werden

```
menu:percent10:name:
```

-   Die 10 ist variabel und gibt die Schritte an, diese kann einfach durch eine andere Zahl ersetzt werden.

```
menu:number1-20-2-unit:name:
```

-   Die 1,20 gibt die Spanne an, diese kann auch umgedreht sein 20,1, die 2 die Schritte, und Unit die Einheit, alles ist variabel ersetzbar. z.B. `menu:number16-36-4-°C:temperaturXY:`

```
menu:back
```

-   Wechselt zur jeweils davor aufgerufenen Seite zurück, es können maximal 20 Seiten zurück gegangen werden

    <br>
    <img src="../pic/menu_percent10_r2.png" width="800"/>
    <img src="../pic/submenu_setstate.png" width="800"/>

### SetState

![SetState](../pic/setState.png)

-   Die Checkbox Schalten rechts, schaltet nur booleans, es wechselt zwischen true und false beim aufrufen des Auslösers. Der Auslöser hat genau den Namen, wie der Button der die Aktion triggern soll.
-   Unter Wert kann man andere Werte eintragen, damit diese gesetzt werden, für jeden Wert muss ein seperates Setstate erstellt werden
-   Es ist möglich sich das Setzen des Wertes bestätigen zu lassen,&nbsp;**sobald `ack:true`gesetzt wurde**. Platzhalter für den Wert ist &&. Grundsätzlich werde alle states mit `ack:false` gesetzt ,dieses ist grundsätzlich erforderlich wenn man damit Adapter steuern möchte. Eine Bestätigung erfolgt immer erst dann wenn der angesprochene Adapter den Wert auf `ack:true` gesetzt hat. Möchte man aber `ack:true` manuell setzen, setzt man einfach den Haken bei Ack.<br>

-   Wenn man den gesetzten Wert nicht mit geschickt bekommen möchte, trägt man in den Rückgabetext einfach `{novalue}` ein<br>
    ![novalue](../pic/image5.png)<br>
-   Möchte man Values verändern die als Rückgabetext geschickt werden, z.B. von true zu an und false zu aus ,trägtman im Text `change{"true":"an", "false":"aus"}` ein.<br>
    ![change](../pic/image6.png)<br>
-   Möchte man einen State setzen, aber die Änderung eines anderen States danach erhalten, fügt man `{"id":"id","text":"Wert wurde gesetzt:"}` in den Rückgabetext ein. ID durch die gewünschte ID ersetzen, der Text kann auch angepasst werden
    Die Änderung wird aber nur gesendet wenn der State auf ack:true gesetzt wurde
-   **Einen Text- oder Zahl-Datenpunkt setzen:**&nbsp;Möchte man z.b einen Text in einen Datenpunkt setzen, wartet die Instanz nach Drücken eines Buttons auf eine Eingabe. Anschliessend wird der ausgewählte Datenpunkt mit dem Text beschrieben. Erreichen kann man das durch das Setzen von `{setDynamicValue:RequestText:Type:ConfirmText:}` im Rückgabefeld. "RequestText"-Aufforderungstext zur Eingabe, "Type"-boolean, number, string und "ConfirmText"-Bestätigungstext des Datenpunkt setzen, kann mit eigenen Text ersetzt werden.

### GetState

-   Mit && als Platzhalter kann man den Wert im Text platzieren, ebenso wie bei setState kann man das Value beinflussen mit `change{"true":"an", "false":"aus"}`.
-   Wenn ich einen Wert aus einem Datenpunkt auslesen möchte, das Value aber umrechnen muss, kann ich in den Rückgabetext `{math:/10}` zum Beispiel wird hier durch 10 geteilt
    ![math](../pic/image9.png)<br>
-   Möchte man das Value runden geht folgendes `{round:2}`
-   Wenn man gleichzeitig mit einer Abfrage mehrere Werte abrufen möchte, kann man die Checkbox Newline aktivieren um für jede Abfrage den Rückgabetext in einer neuen Zeile angezeigt zu bekommen.
-   Möchte man einen Wert einen States mit Unix-Zeitstempel zu einer lokalen Zeit umwandeln und gesendet bekommen fügt man in den Rückgabetext `{time}` an der gewünschten Stelle ein

#### Werte aus erstellten Funktionen

-   Um alle Werte der einstellbaren Funktionen zu bekommen, muss man anstatt der ID einfach functions=Licht z.B. schreiben.
-   Wenn man im Ausgabe Text den Namen des Datenpunkts haben möchte trägt man einfach an der gewünschten Position im Text `{common.name}` ein

![functions](../pic/functions.png)<br>

-   **Tabellen**<br>
    bzw ein JSON anzeigen anzeigen lassen: unter ID einen Datenpunkt auswählen, welches ein JSON enthält. Dazu im TextFeld `{json;[value-1-inJSON:NameTH-Col1,value-2-inJSON:NameTH-Col1];Header;}` eingeben.&nbsp;**Value-1**&nbsp; ist z.B. der erste Key des JSON's, welcher angezeigt werden soll.&nbsp; **NameTH-Col1**&nbsp; vergibt den dazugehörigen Spaltennamen (usw.).&nbsp; **Header**&nbsp; muss ausgefüllt sein und ist die Überschrift für die Tabelle. Ausgabe im Textformat (Parse-Mode deaktiviert): '{json;[value-1-inJSON:NameTH-Col1,value-2-inJSON:NameTH-Col1];Header;TextTable;}'. Die Spaltenzahl ist frei definierbar - dazu z.B. `value-3-inJSON:NameTH-Col3` hinzufügen.

![InlineTable](../pic/inlinetable-grafik.png)
![TextTable](../pic/textable-grafik.png)

### Send Picture

-   In den Einstellungen kann man ein Token für Grafana einfügen
-   Es muss ein Verzeichnis erstellt werden in dem man alle Schreibrechte hat z.B. `/opt/iobroker/grafana/` , um dort die Bilder zwischen speichern zu können
-   In Aktion muss man die Rendering URL angeben, diese findet man in Grafana auf das Diagramm -> teilen -> (Zeitbereich sperren herausnehmen, damit immer das aktuelle Diagramm geschickt wird) -> Direktlink zum gerenderten Bild
-   Wenn man mehrer Diagramm schickt, muss der Filename unterschiedlich sein, da sonst die Bilder sich gegenseitig überschreiben
-   Delay die Zeit zwischen der Anfrage und dem Senden des Bildes -> je nach Geschwindigkeit des Systems kann und muss ein anderer Wert genommen werden

    <img src="../pic/grafana.png" width="400">

### Send Location

-   als erstes Trigger auswählen
-   dann muss ein Datenpunkt für den Breitengrad ("latitude") und einer für den Längengrad ("longtitude") angegeben werden

### Events

-   integrierter Eventlistener: Wartet auf einen Datenpunkt - wird dieser Datenpunkt gesetzt (z.B. über Script oder Adapter), wird ein vordefiniertes Menu geöffnet. Es wird auf die Bedingung und auf Ack geprüft, welches man für jedes Event seperat eingeben kann.

### Echarts

-   hiermit ist es möglich sich Diagramme direkt aus dem Echarts Adapter schicken zu lassen.
-   Preset kann direkt aus der Objektstruktur übernommen werden.
-   Background , wie der Name schon sagt kann hier der Hintergrund eingestellt werden
-   Theme, es können verschieden Themes aus dem Echarts Adapter eingestellt werden, z.B.`auto, default, dark, dark-bold, dark-blue, gray, vintage, macarons, infographic, shine, roma, azul, blue, royal, tech-blue, red, red-velvet, green`
-   Dateiname, individueller Dateiname. &nbsp;**Wichtig ist das in den Einstellungen ein Verzeichnis angegeben ist mit voller Schreibberechtigung**
