type ProzessTimeValue = (text: string, val: string | number) => string;

interface Timeouts {
    key: string;
    timeout: ioBroker.Timeout;
}
