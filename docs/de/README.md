![Logo](../../admin/telegram-menu.png)

## ioBroker telegram-menu adapter

Erstelle ganz einfach Telegrammmenüs

Du kannst für jeden Benutzer ein separates Menü erstellen oder den globalen Benutzer verwenden, um dasselbe Menü für alle eingestellten Benutzer zu generieren.

### Navigation

![Navigation](../pic/nav.png)

-   Die Navigation muss gespeichert werden, damit die Trigger in Aktionen aktualisiert werden
-   Der calltext wird über die Schaltfläche aufgerufen, beide müssen den gleichen Namen haben
-   Schaltflächen müssen durch ein , und Zeilen durch && getrennt sein
-   Alle Benutzer müssen genau so geschrieben werden, wie sie in Telegram erstellt wurden
-   Jeder Button darf nur einmal vorkommen

### SetState

-   Switch schaltet nur Booleans, von true auf false auf true usw.
-   Wenn man einen Wert angibt kann man diesen setzen

### GetState

-   Mit && als Platzhalter kannst du den Wert im Text platzieren

### Send Picture

-   In den Einstellungen kann man ein Token für Grafana einfügen
-   Es muss ein Verzeichnis erstellt werden in dem man alle Rechte hat z.B. /opt/iobroker/grafana/ , um dort die Bilder zwischen speichern zu können
-   In Aktion muss man die Rendering URL angeben, diese findet man in Grafana auf das Diagramm -> teilen -> (Zeitbereich sperren herausnehmen, damit immer das aktuelle Diagramm geschickt wird) -> Direktlink zum gerenderten Bild
-   Wenn man mehrer Diagramm schickt, muss der Filename unterschiedlich sein, da sonst die Bilder sich gegenseitig überschreiben
-   Delay die Zeit zwischen der Anfrage und dem Senden des Bildes -> je nach Geschwindigkeit des Systems kann und muss ein anderer Wert genommen werden

![Grafana](../pic/grafana.png)
