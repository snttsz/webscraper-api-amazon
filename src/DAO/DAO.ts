import { DynamoDB } from 'aws-sdk';

import { Logger } from '../utils/logger';

export abstract class DAO<T>
{
    protected dynamoDB: DynamoDB.DocumentClient;
    protected dynamoDBRaw: DynamoDB;
    protected tableName: string;
    protected log : Logger;
    protected ultimo_id : number = 0;

    /**
     * 
     * 
     * @param
     * @param 
     * @returns 
     */
    constructor(tableName: string, log: Logger)
    {
        this.dynamoDB = new DynamoDB.DocumentClient({ region : "sa-east-1" });
        this.dynamoDBRaw = new DynamoDB({ region: "sa-east-1" });
        this.tableName = tableName;
        this.log = log;

        (async () => {
            this.ultimo_id = (await this.list()).length;
        });
    }

    public getUltimoId() : number
    {
        return this.ultimo_id;
    }

    /**
     * 
     * 
     * @param
     * @param 
     * @returns 
     */ 
    async createTable() : Promise<void>
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
            this.log.get_logger().info(`[DAO] createTable() -> Criando tabela ${this.tableName}...`);
            await this.dynamoDBRaw.createTable(params).promise();
            this.log.get_logger().info(`[DAO] createTable() -> Tabela ${this.tableName} criada com sucesso.`);
        }
        catch (error: any)
        {
            if (error.code === "ResourceInUseException") 
            {
                this.log.get_logger().error(`[DAO] createTable() -> Tabela ${this.tableName} já existe.`);
            } 
            else 
            {
                this.log.get_logger().error("[DAO] createTable() -> Erro ao criar a tabela:", error);
            }
        }
    }
    
    /**
     * 
     * 
     * @param
     * @param 
     * @returns 
     */
    abstract create(item: T) : Promise<void>;

    /**
     * 
     * 
     * @param
     * @param 
     * @returns 
     */
    async create_from_list(itens: T[]): Promise<void> 
    {
        for (const item of itens)
        {
            await this.create(item);
        }
    }

    /**
     * 
     * 
     * @param
     * @param 
     * @returns 
     */
    async read(id: string) : Promise<T | null>
    {
        const params: DynamoDB.DocumentClient.GetItemInput = {
            TableName: this.tableName,
            Key: { id }
        };
    
        const result = await this.dynamoDB.get(params).promise();
    
        return result.Item ? (result.Item as T) : null;
    }

    /**
     * 
     * 
     * @param
     * @param 
     * @returns 
     */
    abstract update(id: string, updatedItem: T): Promise<void>;

    /**
     * 
     * 
     * @param
     * @param 
     * @returns 
     */
    async delete(id: string): Promise<void> 
    {
        const params: DynamoDB.DocumentClient.DeleteItemInput = {
            TableName: this.tableName,
            Key: { id }
        };

        await this.dynamoDB.delete(params).promise();
    }

    /**
     * 
     * 
     * @param
     * @param 
     * @returns 
     */
    async list() : Promise<T[]>
    {
        const params : DynamoDB.DocumentClient.ScanInput = {
            TableName : this.tableName
        };

        const result = await this.dynamoDB.scan(params).promise();

        return result.Items as T[];
    }

    async waitForTableActive(): Promise<void> 
    {
        this.log.get_logger().info(`[DynamoDB] waitForTableActive() -> Aguardando a tabela ${this.tableName} ficar ativa...`);
        await this.dynamoDBRaw.waitFor('tableExists', { TableName: this.tableName }).promise();
        this.log.get_logger().info(`[DynamoDB] waitForTableActive() -> Tabela ${this.tableName} está ativa.`);
    }
}