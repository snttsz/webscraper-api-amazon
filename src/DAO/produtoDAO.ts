
import { DAO } from './DAO';
import { DynamoDB } from 'aws-sdk';

export interface Produto
{
    id : string,
    nome : string,
    preco : string,
    estrelas : string
};

export class ProdutoDAO extends DAO<Produto>
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
        super('Produto');
    }

    /**
     * 
     * 
     * @param
     * @param 
     * @returns 
     */
    async create(produto: Produto): Promise<void> 
    {
        const params: DynamoDB.DocumentClient.PutItemInput = {
            TableName: this.tableName,
            Item: produto
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
    async create_from_list(produto: Produto[]): Promise<void> 
    {
        // const params: DynamoDB.DocumentClient.PutItemInput = {
        //     TableName: this.tableName,
        //     Item: produto
        // };

        // await this.dynamoDB.put(params).promise();
    }

    /**
     * 
     * 
     * @param
     * @param 
     * @returns 
     */
    async update(id: string, updatedProduct: Produto): Promise<void> 
    {
        
        const params: DynamoDB.DocumentClient.UpdateItemInput = {
            
            TableName: this.tableName,
            
            Key: { id },
            
            UpdateExpression: 'set #nome = :nome, #preco = :preco, #estrelas = :estrelas',
            
            ExpressionAttributeNames: {
                '#nome': 'nome',
                '#preco': 'preco',
                '#estrelas' : 'estrelas'
            }, 
            
            ExpressionAttributeValues: {
                ':nome': updatedProduct.nome,
                ':preco': updatedProduct.preco,
                ':estrelas': updatedProduct.estrelas
            }
        };

        await this.dynamoDB.update(params).promise();
    }
}