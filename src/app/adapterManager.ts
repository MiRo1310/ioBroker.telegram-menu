import { adapter as mainAdapter } from '../main'; // Importiere den Adapter aus der Hauptdatei
import { adapter as mockAdapter } from '../../test/setup';
import type { Adapter } from '../types/types'; // Importiere den Mock-Adapter aus der Test-Setup-Datei

export let adapter: Adapter;

if (mainAdapter) {
    adapter = mainAdapter; // Verwende den Haupt-Adapter, wenn er definiert ist
} else {
    adapter = mockAdapter; // Verwende den Mock-Adapter, wenn der Haupt-Adapter nicht verfügbar ist
}
