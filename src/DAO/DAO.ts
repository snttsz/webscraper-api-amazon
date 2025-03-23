import { DynamoDB } from 'aws-sdk';

export abstract class DAO<T>
{
    protected dynamoDB: DynamoDB.DocumentClient;
    protected tableName: string;

    /**
     * 
     * 
     * @param
     * @param 
     * @returns 
     */
    constructor(tableName: string)
    {
        this.dynamoDB = new DynamoDB.DocumentClient();
        this.tableName = tableName;
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
    abstract create_from_list(item: T[]) : Promise<void>;

    /**
     * 
     * 
     * @param
     * @param 
     * @returns 
     */
    async read(id: string) : Promise<T | null>
    {
        const params : DynamoDB.DocumentClient.GetItemInput = {
            TableName : this.tableName,
            Key : { id }
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
}