export default interface ILogger {
    debug(...messages: string[]): void;
    info(...messages: string[]): void;
    warn(...messages: string[]): void;
    error(message: string, error: any): void;
}
