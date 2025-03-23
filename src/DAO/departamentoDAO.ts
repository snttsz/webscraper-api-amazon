
import { DAO } from './DAO';
import { DynamoDB } from 'aws-sdk';

export interface Departamento
{
    id : string,
    nome : string,
    href : string
};

export class DepartamentoDAO extends DAO<Departamento>
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
        super('Departamento');
    }

    /**
     * 
     * 
     * @param
     * @param 
     * @returns 
     */
    async create(departamento: Departamento): Promise<void> 
    {
        const params: DynamoDB.DocumentClient.PutItemInput = {
            TableName: this.tableName,
            Item: departamento
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
    async create_from_list(departamento: Departamento[]): Promise<void> 
    {
        // const params: DynamoDB.DocumentClient.PutItemInput = {
        //     TableName: this.tableName,
        //     Item: departamento
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
    async update(id: string, updatedDepartment: Departamento): Promise<void> 
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
                ':nome': updatedDepartment.nome,
                ':href': updatedDepartment.href
            }
        };

        await this.dynamoDB.update(params).promise();
    }
}