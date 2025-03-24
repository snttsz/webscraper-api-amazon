import { DynamoDB } from 'aws-sdk';

import { Logger } from '../utils/logger';


/**
 * Classe abstrata DAO<T>
 * 
 * Esta classe fornece uma implementação genérica para interagir com o DynamoDB. 
 * Ela fornece métodos básicos para realizar operações CRUD (criar, ler, atualizar, deletar e listar) 
 * em uma tabela do DynamoDB, além de facilitar a criação de tabelas e aguardar a ativação da tabela.
 */
export abstract class DAO<T>
{
    protected dynamoDB: DynamoDB.DocumentClient;
    protected dynamoDBRaw: DynamoDB;
    protected tableName: string;
    protected log : Logger;
    protected ultimo_id : number = 0;

    /**
     * Construtor da classe DAO.
     * 
     * Inicializa a instância do DynamoDB, o logger e obtém o último id da tabela.
     * 
     * @param tableName Nome da tabela do DynamoDB que será manipulada
     * @param log Instância de Logger para registrar as operações realizadas
     */
    constructor(tableName: string, log: Logger)
    {
        this.dynamoDB = new DynamoDB.DocumentClient({ region : "sa-east-1" });
        this.dynamoDBRaw = new DynamoDB({ region: "sa-east-1" });
        this.tableName = tableName;
        this.log = log;

        (async () => {
            this.ultimo_id = (await this.listar()).length;
        });
    }

    /**
     * Retorna o último id utilizado na tabela.
     * 
     * @returns O último id utilizado para inserção de itens na tabela.
     */
    public getUltimoId() : number
    {
        return this.ultimo_id;
    }

    /**
     * Cria a tabela no DynamoDB se não existir.
     * 
     * A tabela terá uma chave primária baseada no atributo "id", que será do tipo numérico.
     * 
     * @returns Uma Promise que será resolvida quando a tabela for criada ou se já existir.
     */
    async criarTabela() : Promise<void>
    {
        const params: DynamoDB.CreateTableInput = 
        {
            TableName: this.tableName,

            KeySchema: [
              { AttributeName: "id", KeyType: "HASH" },
            ],

            AttributeDefinitions: [
              { AttributeName: "id", AttributeType: "N" },
            ],

            ProvisionedThroughput: {
              ReadCapacityUnits: 5,
              WriteCapacityUnits: 5,
            },
        };

        try
        {
            this.log.getLogger().info(`[DAO] createTable() -> Criando tabela ${this.tableName}...`);
            await this.dynamoDBRaw.createTable(params).promise();
            this.log.getLogger().info(`[DAO] createTable() -> Tabela ${this.tableName} criada com sucesso.`);
        }
        catch (error: any)
        {
            if (error.code === "ResourceInUseException") 
            {
                this.log.getLogger().error(`[DAO] createTable() -> Tabela ${this.tableName} já existe.`);
            } 
            else 
            {
                this.log.getLogger().error("[DAO] createTable() -> Erro ao criar a tabela:", error);
            }
        }
    }
    
    /**
     * Método abstrato para criar um novo item na tabela.
     * 
     * Este método deve ser implementado nas classes filhas para definir como criar um item específico.
     * 
     * @param item O item a ser inserido na tabela
     * @returns Uma Promise que será resolvida após a criação do item
     */
    abstract criar(item: T) : Promise<void>;

    /**
     * Cria múltiplos itens na tabela a partir de uma lista.
     * 
     * Este método chama o método `criar()` para cada item da lista.
     * 
     * @param itens A lista de itens a serem inseridos
     * @returns Uma Promise que será resolvida após a criação de todos os itens
     */
    async criarDeLista(itens: T[]): Promise<void> 
    {
        for (const item of itens)
        {
            await this.criar(item);
        }
    }

    /**
     * Lê um item da tabela com base no seu id.
     * 
     * @param id O id do item a ser lido
     * @returns O item encontrado, ou null se o item não for encontrado
     */
    async ler(id: string) : Promise<T | null>
    {
        const params: DynamoDB.DocumentClient.GetItemInput = {
            TableName: this.tableName,
            Key: { id }
        };
    
        const result = await this.dynamoDB.get(params).promise();
    
        return result.Item ? (result.Item as T) : null;
    }

    /**
     * Método abstrato para atualizar um item na tabela.
     * 
     * Este método deve ser implementado nas classes filhas para definir como atualizar um item específico.
     * 
     * @param id O id do item a ser atualizado
     * @param updatedItem O item com as atualizações a serem aplicadas
     * @returns Uma Promise que será resolvida após a atualização do item
     */
    abstract atualizar(id: string, updatedItem: T): Promise<void>;

    /**
     * Deleta um item da tabela com base no seu id.
     * 
     * @param id O id do item a ser deletado
     * @returns Uma Promise que será resolvida após a exclusão do item
     */
    async deletar(id: string): Promise<void> 
    {
        const params: DynamoDB.DocumentClient.DeleteItemInput = {
            TableName: this.tableName,
            Key: { id }
        };

        await this.dynamoDB.delete(params).promise();
    }

    /**
     * Lista todos os itens presentes na tabela.
     * 
     * @returns Uma Promise que resolve com a lista de itens da tabela
     */
    async listar() : Promise<T[]>
    {
        const params : DynamoDB.DocumentClient.ScanInput = {
            TableName : this.tableName
        };

        const result = await this.dynamoDB.scan(params).promise();

        return result.Items as T[];
    }

    /**
     * Aguarda até que a tabela esteja ativa.
     * 
     * Este método é útil para garantir que a tabela tenha sido criada e esteja disponível para operações.
     * 
     * @returns Uma Promise que será resolvida quando a tabela estiver ativa
     */
    async esperarTabelaEstarAtiva(): Promise<void> 
    {
        this.log.getLogger().info(`[DynamoDB] waitForTableActive() -> Aguardando a tabela ${this.tableName} ficar ativa...`);
        await this.dynamoDBRaw.waitFor('tableExists', { TableName: this.tableName }).promise();
        this.log.getLogger().info(`[DynamoDB] waitForTableActive() -> Tabela ${this.tableName} está ativa.`);
    }
}