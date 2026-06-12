# TODO — setstate-Bereich

## 1. stateIdRegistry.ts — Duplikat-Detection testen (0% branch) ✅
- [x] Test: `addIds` mit derselben ID zweimal aufrufen → zweiter Call wird ignoriert, `log.debug` wird aufgerufen
- [x] Sicherstellen: `stateIdRegistry` enthält danach nur einen Eintrag

## 2. setstate.ts — modifiedValue klären ✅
- [x] Fallback bleibt erhalten — `modifiedValue` wird genutzt wenn `value` leer ist
- [x] `/* istanbul ignore next */` nur auf den unerreichbaren `{value}`-Replace-Branch verschoben (if-Block)
- [x] Test: `handleSetState` mit `value: ''` → setzt `valueFromSubmenu` als State

## 3. setstate.ts — Double-Send-Guard testen (Zeile 209) ✅
- [x] Test: `handleSetState` mit `confirm=true` aufrufen während ID bereits in `stateIdRegistry` registriert ist
- [x] Erwartung: `log.error` wird aufgerufen (Double-Send-Warnung)

## 4. dynamicValue.ts — leerer confirmText-Pfad (Zeile 67) ✅
- [x] Test: `setValue` mit `{setDynamicValue:question:type:}` → leerer confirmText → Rückgabe `{ confirmText: '', id: undefined }`

---

## 5. dynamicValue.ts — `isBraceDeleteEntry` entfernt ✅
- [x] `decomposeText` entfernt `}` bereits vor dem Split → `array[4]` kann nie `'}'` sein → Methode war totes Code, wurde gelöscht
