type ProzessTimeValue = (textToSend: string, obj: ioBroker.State) => string;

interface Timeouts {
    key: string;
    timeout: ioBroker.Timeout;
}
