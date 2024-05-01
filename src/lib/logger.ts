import { createLogger, format, transports, Logger as WLogger } from "winston";

class Logger {
    private static errorLogger: WLogger;

    public static error(errorName: string, errorMessage: string) {
        if(!Logger.errorLogger) {
            Logger.initializeErrorLogger();
        }
        
        Logger.errorLogger.error({ label: errorName, message: errorMessage });
    }

    private static initializeErrorLogger() {
        const errorFormat = format.printf(({ level, message, label, timestamp }) => {
            return `[${level}] ${timestamp} ${label}: ${message}`;
        });

        Logger.errorLogger = createLogger({
            format: format.combine(
                format.timestamp(),
                errorFormat
            ),
            transports: [
                new transports.File({ filename: "logs.log" }),
            ],
        });
    }
}

export default Logger;