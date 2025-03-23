import * as winston from 'winston';

export class Logger
{
    private log_filepath: string = "";
    private log_level: string = "";
    private logger: winston.Logger;

    constructor(log_filepath: string, log_level: string = "info")
    {
        this.log_filepath = log_filepath;
        this.log_level = log_level;

        this.logger = winston.createLogger
        (
            {
                // 
                //  Pode ser -> info, warn, error
                //
                level: this.log_level, 
                format: winston.format.combine
                (
                    winston.format.timestamp(),
                    winston.format.printf
                    (
                        ({ timestamp, level, message }) => { return `${timestamp} [${level}]: ${message}`; }
                    )
                ),
            
                transports: 
                [
                    new winston.transports.Console({ format: winston.format.simple() }),
                    new winston.transports.File({ filename: this.log_filepath }) 
                ],
        
            }
        );
    }

    public get_logger() : winston.Logger
    {
        return this.logger;
    }
}