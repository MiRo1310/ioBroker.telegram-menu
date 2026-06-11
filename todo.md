# Refactoring: setstate.ts — ReturnText-Pipeline & Handler-Zerlegung

## Schritt 1 — `resolveIdReferences()` aus `exchangeValueAndSendToTelegram` extrahieren

**Problem:** Die `while (textToSend.includes('{id:') && i < 20)`-Schleife in `exchangeValueAndSendToTelegram` ist anonym, hat eine Magic-Number (20) und gibt keinen Hinweis wenn sie das Limit erreicht.

```ts
// Vorher — inline in exchangeValueAndSendToTelegram:
let i = 0;
while (textToSend.includes('{id:') && i < 20) {
    textToSend = String(await _getDynamicValueIfIsIn(appContext, textToSend));
    i++;
}

// Nachher:
export async function resolveIdReferences(
    appContext: AppContext,
    text: string,
    maxIterations = 20,
): Promise<string>
```

- [x] Funktion `resolveIdReferences` mit `maxIterations`-Parameter (Default 20)
- [x] `log.warn` wenn Iteration-Limit erreicht (stilles Abbrechen ist schwer debugbar)
- [x] `exchangeValueAndSendToTelegram` ruft `resolveIdReferences` auf statt while-Schleife
- [x] Tests: normaler Fall (ein `{id:}`), mehrfach verschachtelt, Limit-Warning

---

## Schritt 2 — `buildReturnText()` — Text-Auflösungs-Pipeline kapseln

**Problem:** `exchangeValueAndSendToTelegram` macht zwei Dinge: Text auflösen und senden. Die Textauflösung (`singleQuotesToDoubleQuotes` + `exchangeValue` + `resolveIdReferences`) ist nicht isoliert testbar.

```ts
// Neue Funktion (pure pipeline, kein sendToTelegram):
export async function buildReturnText(
    appContext: AppContext,
    rawReturnText: string,
    value: string | number | null | boolean,
): Promise<string>

// exchangeValueAndSendToTelegram wird zum dünnen Orchestrator:
const textToSend = await buildReturnText(appContext, returnText, valueToTelegram);
await sendToTelegram({ instance, userToSend, textToSend, appContext, parse_mode });
```

- [x] Funktion `buildReturnText` extrahieren
- [x] `exchangeValueAndSendToTelegram` delegiert an `buildReturnText` + `sendToTelegram`
- [x] Tests für `buildReturnText` ohne `sendToTelegram`-Stub
- [x] Bestehende `exchangeValueAndSendToTelegram`-Tests prüfen ob sie noch passen

---

## Schritt 3 — `parseForeignId()` aus `handleSetState` extrahieren

**Problem:** Die foreignId-JSON-Verarbeitung im `handleSetState`-Loop ist eingebettet (Substring-Parsing + JSON-Validierung + Textersatz) — nicht isoliert testbar.

```ts
// Eingebettet in handleSetState, ca. 15 Zeilen:
const { substring } = decomposeText(returnText, foreignIdStart, '}');
const { json, isValidJson } = parseJSON<{ text: string; foreignId: string }>(substring);
if (!isValidJson) return;
if (json.foreignId) { idToGetValueFrom = json.foreignId; returnText = returnText.replace(...) }

// Nachher:
export function parseForeignId(
    returnText: string,
): { foreignId: string; text: string } | null
```

- [x] Funktion `parseForeignId(returnText)` — gibt `null` bei ungültigem JSON zurück
- [x] `handleSetState` nutzt `parseForeignId` statt eingebetteter Logik
- [x] Tests: valides JSON, ungültiges JSON, fehlendes `foreignId`-Feld, kein `{foreignId`-Marker

---

## Schritt 4 — `handleSwitchItem` aus dem `for...of`-Body in `handleSetState` extrahieren

**Problem:** Der `for...of`-Body in `handleSetState` ist ~80 Zeilen mit 4 unabhängigen Zweigen (dynamicValue, foreignId, toggle, setValue+confirm) — nicht isoliert testbar, schwer lesbar.

```ts
// Nachher:
async function handleSwitchItem(
    appContext: AppContext,
    instance: string,
    switchDef: SwitchDefinition,   // ein Element aus part.switch
    userToSend: string,
    valueFromSubmenu: null | string | number | boolean,
): Promise<Telegram | undefined>

// handleSetState:
for (const switchDef of part.switch) {
    const result = await handleSwitchItem(appContext, instance, switchDef, userToSend, valueFromSubmenu);
    if (result) return result;
}
```

- [x] `SwitchDefinition`-Typ aus `part.switch[number]` ableiten (oder eigener Type-Alias) — nutzt bestehenden `Switch`-Typ aus `types.ts`
- [x] `handleSwitchItem` als private/interne Funktion — enthält die 4 Zweige
- [x] `handleSetState` wird zum schlanken Dispatcher
- [x] Tests für `handleSwitchItem` mit je einem Test pro Zweig

---

## Schritt 5 — `_getDynamicValueIfIsIn` umbenennen & Rückgabetyp vereinfachen

**Problem:** `_getDynamicValueIfIsIn` ist schlecht benannt (Underscore-Präfix, kein beschreibendes Verb), gibt `string | number | boolean` zurück, obwohl alle Aufrufer das Ergebnis sofort mit `String(...)` casten.

```ts
// Vorher:
export const _getDynamicValueIfIsIn = async (appContext, text): Promise<string | number | boolean>

// Nachher:
export async function resolveIdExpression(appContext: AppContext, text: string): Promise<string>
```

- [x] Umbenennen zu `resolveIdExpression`
- [x] Rückgabetyp zu `Promise<string>` vereinfachen (interne `String()`-Casts entfernen)
- [x] Alle Aufrufer anpassen: `setValue`, `resolveIdReferences` (aus Schritt 1)
- [x] Export-Name in Tests aktualisieren

---

## Schritt 6 — `DynamicValueHandler.setValue` — Parameter-Objekt einführen

**Problem:** `dynamicValue.setValue(instance, returnText, ack, id, userToSend, appContext, parse_mode, confirm)` hat 8 Positional-Parameter — fehleranfällig bei Aufruf, schwer lesbar.

```ts
// Nachher:
public async setValue(params: {
    instance: string;
    returnText: string;
    ack: boolean;
    id: string;
    userToSend: string;
    appContext: AppContext;
    parse_mode: boolean;
    confirm: boolean;
}): Promise<{ confirmText: string; id: string | undefined }>
```

- [x] `setValue` auf Parameter-Objekt umstellen
- [x] Aufrufer in `handleSetState` / `handleSwitchItem` anpassen
- [x] Tests aktualisieren

---

## Abschluss-Check (Schritt 1–6)

- [x] `npm run tsc` → keine TypeScript-Fehler
- [x] `npm run test:ts` → alle Tests grün
- [ ] `npm run lint:backend` → keine Lint-Fehler
