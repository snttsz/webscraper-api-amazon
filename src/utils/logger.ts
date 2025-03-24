import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Classe responsável por criar e configurar o logger para a aplicação.
 * Utiliza a biblioteca `winston` para registrar logs em arquivos e no console.
 * 
 * Pode ser configurado para diferentes níveis de log como `info`, `warn` e `error`.
 */
export class Logger
{
    private log_filepath: string = "";
    private log_level: string = "";
    private logger: winston.Logger;

    /**
     * Construtor da classe Logger.
     * Inicializa o logger com o caminho do arquivo de log e o nível do log.
     * Se o diretório do arquivo de log não existir, ele será criado.
     * 
     * @param log_filepath Caminho do arquivo onde os logs serão salvos.
     * @param log_level Nível do log. Pode ser "info", "warn", "error" (padrão é "info").
     */
    constructor(log_filepath: string, log_level: string = "info")
    {
        this.log_filepath = log_filepath;
        this.log_level = log_level;

        const logDir = path.dirname(this.log_filepath);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }

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

    /**
     * Retorna a instância do logger configurado.
     * 
     * @returns A instância do logger.
     */
    public get_logger() : winston.Logger
    {
        return this.logger;
    }
}