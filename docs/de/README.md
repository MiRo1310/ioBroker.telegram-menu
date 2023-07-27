![Logo](../../admin/telegram-menu.png)

## ioBroker telegram-menu adapter

Erstelle ganz einfach Telegrammmenüs

Man kann verschiedene Gruppen erstellen mit separaten Menüs, und diesen dann Benutzer zuordnen.

### Navigation

![Navigation](../pic/nav.png)

-   Die Navigation muss gespeichert werden, damit die Trigger in Aktionen aktualisiert werden
-   Der Calltext wird über die Schaltfläche aufgerufen, beide müssen den gleichen Namen haben
-   Schaltflächen müssen durch ein `,` und Zeilen durch `&&` getrennt sein
-   Alle Benutzer müssen genau so geschrieben werden, wie sie in Telegram erstellt wurden
-   Jeder Button darf nur einmal vorkommen
-   Es können verschiedene vordefinierte Untermenus verwendet werden, z.B. on-off , yes-no oder Prozent für z.B. die Rolladensteuerung
    -   Als erstes legt man ganz normal einen Button an in der Navigation
    -   Dann eine neue Zeile mit dem Namen des Buttons als Call-Text und in die Navigationsspalte schreibt man z.B. `menu:on-off:name:` oder `menu:percent10:name:`. **name** muss ersetzt werden durch einen eindeutigen einmal vorkommenden namen, z.B. Rollo1, danach speichern
    -   Durch das speichern wird in den Aktionen ein neuer Trigger erstellt , diesen muss man bei SetState auswählen und dann sucht man die passende ID raus die gesetzt werden soll, als Wert einfach ein `!` rein

### SetState

-   Switch schaltet nur Booleans, es wechselt zwischen true und false
-   Wenn man einen Wert angibt kann man diesen setzen
-   Es ist möglich sich das Setzen des Wertes bestätigen zu lassen, Platzhalter für den Wert ist &&. Wenn man den gesetzten Wert nicht mit geschickt bekommen möchte, trägt man in den Rückgabetext einfach `{novalue}` ein
-   Um Values zu ändern , z.B. von true zu an und false zu aus , im Text `change{"true":"an", "false":"aus"}` eingeben
-   Grundsätzlich werde alle states mit `ack:true` gesetzt , möchte man aber `ack:false` setzen, dieses ist grundsätzlich erforderlich wenn man damit Adapter steuern möchte, trägt man dieses einfach in den Rückgabetext ein. Eine Bestätigung erfolgt dann erst wenn der angesprochene Adapter den Wert auf ack:true gesetzt hat.

### GetState

-   Mit && als Platzhalter kann man den Wert im Text platzieren

#### Werte aus erstellten Funktionen

-   Um alle Werte der einstellbaren Funktionen zu bekommen, muss man anstatt der ID einfach functions=Licht z.B. schreiben.
-   Wenn man im Ausgabe Text den Namen des Datenpunkts haben möchte trägt man einfach an der gewünschten Position im Text `{common.name}` ein

![functions](../pic/functions.png)

### Send Picture

-   In den Einstellungen kann man ein Token für Grafana einfügen
-   Es muss ein Verzeichnis erstellt werden in dem man alle Rechte hat z.B. `/opt/iobroker/grafana/` , um dort die Bilder zwischen speichern zu können
-   In Aktion muss man die Rendering URL angeben, diese findet man in Grafana auf das Diagramm -> teilen -> (Zeitbereich sperren herausnehmen, damit immer das aktuelle Diagramm geschickt wird) -> Direktlink zum gerenderten Bild
-   Wenn man mehrer Diagramm schickt, muss der Filename unterschiedlich sein, da sonst die Bilder sich gegenseitig überschreiben
-   Delay die Zeit zwischen der Anfrage und dem Senden des Bildes -> je nach Geschwindigkeit des Systems kann und muss ein anderer Wert genommen werden

### Submenus

-   `menu:on-off:name:` Der name muss immer ein einzigartiger Name sein, dieser wird als Trigger in Aktion eingesetzt.
-   `menu:yes-no:name:`
-   `menu:percent10:name:` Die 10 ist variabel und gibt die Schritte an, diese kann einfach durch eine andere Zahl ersetzt werden.
-   `menu:number1-20-2-unit:name:` Die 1,20 ist variabel und gibt die Spanne an, die 2 die Schritte, und Unit die Einheit

![Grafana](../pic/grafana.png)
