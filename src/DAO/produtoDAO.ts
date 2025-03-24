
import { DAO } from './DAO';
import { DynamoDB } from 'aws-sdk';

import { Logger } from '../utils/logger';

export enum PastaPai
{
    PAGINA_INICIAL = "Página Inicial",
    DEPARTAMENTO = "Departamento"
}

export interface Produto
{
    id : number,
    nome : string,
    preco : string,
    estrelas : string,
    tipo_tabela_pai : string,
    id_tabela_pai : string
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
    constructor(log: Logger) 
    {
        super('Produto', log);
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
        try
        {
            produto.id = this.ultimo_id;

            const params: DynamoDB.DocumentClient.PutItemInput = {
                TableName: this.tableName,
                Item: produto
            };
    
            await this.dynamoDB.put(params).promise();

            this.ultimo_id += 1;
            
            this.log.get_logger().info(`[ProdutoDAO] create() -> Produto ${produto.nome} adicionado com sucesso`);
        }
        catch (error : any)
        {
            this.log.get_logger().error(`[ProdutoDAO] create() -> Ocorreu um erro ao adicionar o ${produto.nome}: ${error}`)
        }
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
            
            UpdateExpression: 'set #nome = :nome, #preco = :preco, #estrelas = :estrelas, #tipo_tabela_pai = :tipo_tabela_pai, #id_tabela_pai = :id_tabela_pai',
            
            ExpressionAttributeNames: {
                '#nome': 'nome',
                '#preco': 'preco',
                '#estrelas' : 'estrelas',
                '#tipo_tabela_pai' : 'tipo_tabela_pai',
                '#id_tabela_pai' : 'id_tabela_pai'
            }, 
            
            ExpressionAttributeValues: {
                ':nome': updatedProduct.nome,
                ':preco': updatedProduct.preco,
                ':estrelas': updatedProduct.estrelas,
                ':tipo_tabela_pai' : updatedProduct.tipo_tabela_pai,
                ':id_tabela_pai' : updatedProduct.id_tabela_pai 
            }
        };

        await this.dynamoDB.update(params).promise();
    }

    /**
     * Retorna os produtos de um determinado departamento.
     * 
     * @param idDepartamento O ID do departamento para filtrar os produtos.
     * @returns Lista de produtos do departamento.
     */
    async getProdutosByDepartamento(idDepartamento: string, tipoDepartamento: string): Promise<Produto[]> 
    {
        try 
        {
            if (tipoDepartamento === PastaPai.PAGINA_INICIAL)
            {
                idDepartamento = "Página Inicial - Sem ID";
            }

            const params: DynamoDB.DocumentClient.ScanInput = {
                
                TableName: this.tableName,
                
                FilterExpression: '#id_tabela_pai = :idDepartamento',
                
                ExpressionAttributeNames: {
                    '#id_tabela_pai': 'id_tabela_pai',
                },

                ExpressionAttributeValues: {
                    ':idDepartamento': idDepartamento,
                },
            };

            const result = await this.dynamoDB.scan(params).promise();

            return result.Items as Produto[];
        } 
        catch (error: any) 
        {
            this.log.get_logger().error(`[ProdutoDAO] getProdutosByDepartamento() -> Erro ao buscar produtos para o departamento ${idDepartamento}: ${error}`);
            return [];
        }
    }
}