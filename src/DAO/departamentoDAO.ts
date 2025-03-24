
import { DAO } from './DAO';
import { DynamoDB } from 'aws-sdk';
import { Logger } from '../utils/logger';

/**
 * Interface que define a estrutura de um departamento.
 */
export interface Departamento
{
    id : number,
    nome : string,
    href : string
};

/**
 * Classe responsável pelo acesso e manipulação de dados da tabela "Departamento" no DynamoDB.
 */
export class DepartamentoDAO extends DAO<Departamento>
{
    /**
     * Construtor da classe DepartamentoDAO.
     * @param log Instância do Logger para registro de eventos e erros.
     */
    constructor(log: Logger) 
    {
        super('Departamento', log);
    }

     /**
     * Método para criar um novo departamento na tabela do DynamoDB.
     * @param departamento Objeto do tipo Departamento a ser adicionado.
     * @returns Promise<void> indicando a conclusão da operação.
     */
    async criar(departamento: Departamento): Promise<void> 
    {
        try
        {
            const params: DynamoDB.DocumentClient.PutItemInput = {
                TableName: this.tableName,
                Item: departamento
            };
    
            await this.dynamoDB.put(params).promise();

            this.ultimo_id += 1;

            this.log.getLogger().info(`[DepartamentoDAO] create() -> Departamento ${departamento.nome} adicionado com sucesso`);
        }
        catch (error : any)
        {
            this.log.getLogger().error(`[DepartamentoDAO] create() -> Ocorreu um erro ao adicionar o ${departamento.nome}: ${error}`)
        }
    }

    /**
     * Método para atualizar um departamento existente no DynamoDB.
     * @param id ID do departamento a ser atualizado.
     * @param updatedDepartment Objeto contendo os novos dados do departamento.
     * @returns Promise<void> indicando a conclusão da operação.
     */
    async atualizar(id: string, updatedDepartment: Departamento): Promise<void> 
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