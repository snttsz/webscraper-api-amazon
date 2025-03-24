
import { DAO } from './DAO';
import { DynamoDB } from 'aws-sdk';

import { Logger } from '../utils/logger';

/**
 * Enum que define os tipos de categorias de produtos.
 */
export enum PastaPai
{
    PAGINA_INICIAL = "Página Inicial",
    DEPARTAMENTO = "Departamento"
}

/**
 * Interface que representa um produto no sistema.
 */
export interface Produto
{
    id : number,
    nome : string,
    preco : string,
    estrelas : string,
    tipo_tabela_pai : string,
    id_tabela_pai : number
};

/**
 * Classe de acesso a dados (DAO) para a entidade Produto.
 * Estende a classe genérica DAO para operações com a tabela de produtos no DynamoDB.
 */
export class ProdutoDAO extends DAO<Produto>
{
    /**
     * Construtor da classe ProdutoDAO.
     * @param log Instância do logger para registrar operações.
     */
    constructor(log: Logger) 
    {
        super('Produto', log);
    }

    /**
     * Cria um novo produto e o adiciona ao banco de dados.
     * @param produto Objeto do tipo Produto a ser adicionado.
     */
    async criar(produto: Produto): Promise<void> 
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
            
            this.log.getLogger().info(`[ProdutoDAO] create() -> Produto ${produto.nome} adicionado com sucesso`);
        }
        catch (error : any)
        {
            this.log.getLogger().error(`[ProdutoDAO] create() -> Ocorreu um erro ao adicionar o ${produto.nome}: ${error}`)
        }
    }

    /**
     * Atualiza os detalhes de um produto existente no banco de dados.
     * @param id Identificador do produto a ser atualizado.
     * @param updatedProduct Objeto contendo os novos dados do produto.
     */
    async atualizar(id: string, updatedProduct: Produto): Promise<void> 
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
     * Obtém uma lista de produtos de um departamento específico.
     * @param idDepartamento ID do departamento para o qual deseja buscar produtos.
     * @param tipoDepartamento Tipo de departamento (página inicial ou departamento específico).
     * @returns Uma lista de produtos pertencentes ao departamento informado.
     */
    async getProdutosByDepartamento(idDepartamento: number, tipoDepartamento: string): Promise<Produto[]> 
    {
        try 
        {
            if (tipoDepartamento === PastaPai.PAGINA_INICIAL)
            {
                idDepartamento = -1;
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
            this.log.getLogger().error(`[ProdutoDAO] getProdutosByDepartamento() -> Erro ao buscar produtos para o departamento ${idDepartamento}: ${error}`);
            return [];
        }
    }
}