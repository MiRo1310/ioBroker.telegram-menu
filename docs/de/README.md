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

### SetState

-   Switch schaltet nur Booleans, es wechselt zwischen true und false
-   Wenn man einen Wert angibt kann man diesen setzen
-   Es ist möglich sich das Setzen des Wertes bestätigen zu lassen, Platzhalter für den Wert ist &&. Wenn man den gesetzten Wert nicht mit geschickt bekommen möchte, trägt man in den Rückgabetext einfach `{novalue}` ein
-   Um Values zu ändern , z.B. von true zu an und false zu aus , im Text `change{"true":"an", "false":"aus"}` eingeben
-   Grundsätzlich werde alle states mit `ack:true` gesetzt , möchte man aber `ack:false` setzen, trägt man dieses einfach in den Rückgabetext ein. Eine Bestätigung erfolgt dann erst wenn der angesprochene Adapter den Wert auf ack:true gesetzt hat

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

![Grafana](../pic/grafana.png)
