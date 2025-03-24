
import { DAO } from './DAO';
import { DynamoDB } from 'aws-sdk';
import { Logger } from '../utils/logger';

export interface Departamento
{
    id : number,
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
    constructor(log: Logger) 
    {
        super('Departamento', log);
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
        try
        {
            const params: DynamoDB.DocumentClient.PutItemInput = {
                TableName: this.tableName,
                Item: departamento
            };
    
            await this.dynamoDB.put(params).promise();

            this.ultimo_id += 1;

            this.log.get_logger().info(`[DepartamentoDAO] create() -> Departamento ${departamento.nome} adicionado com sucesso`);
        }
        catch (error : any)
        {
            this.log.get_logger().error(`[DepartamentoDAO] create() -> Ocorreu um erro ao adicionar o ${departamento.nome}: ${error}`)
        }
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