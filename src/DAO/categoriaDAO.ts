
import { DAO } from './DAO';
import { DynamoDB } from 'aws-sdk';

export interface Categoria
{
    id : string,
    nome : string,
    href : string
};

export class CategoriaDAO extends DAO<Categoria>
{
    /**
     * 
     * 
     * @param
     * @param 
     * @returns 
     */
    constructor() 
    {
        super('Categoria');
    }
    
    /**
     * 
     * 
     * @param
     * @param 
     * @returns 
     */
    async create(categoria: Categoria): Promise<void> 
    {
        const params: DynamoDB.DocumentClient.PutItemInput = {
            TableName: this.tableName,
            Item: categoria
        };

        await this.dynamoDB.put(params).promise();
    }

    /**
     * 
     * 
     * @param
     * @param 
     * @returns 
     */
    async create_from_list(categoria: Categoria[]): Promise<void> 
    {
        const params: DynamoDB.DocumentClient.PutItemInput = {
            TableName: this.tableName,
            Item: categoria
        };

        await this.dynamoDB.put(params).promise();
    }

    /**
     * 
     * 
     * @param
     * @param 
     * @returns 
     */
    async update(id: string, updatedCategory: Categoria): Promise<void> 
    {
        
        const params: DynamoDB.DocumentClient.UpdateItemInput = {
            
            TableName: this.tableName,
            
            Key: { id },
            
            UpdateExpression: 'set #nome = :nome, #href = :href',
            
            ExpressionAttributeNames: {
                '#nome': 'nome',
                '#href': 'href'
            }, 
            
            ExpressionAttributeValues: {
                ':nome': updatedCategory.nome,
                ':href': updatedCategory.href
            }
        };

        await this.dynamoDB.update(params).promise();
    }
}