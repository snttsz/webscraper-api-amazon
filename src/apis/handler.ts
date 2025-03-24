/**
 * @fileoverview Módulo que contém handlers para a API Gateway na AWS Lambda.
 * Esses handlers permitem listar departamentos, obter os produtos mais vendidos
 * e obter produtos mais vendidos por departamento a partir de um banco de dados DynamoDB.
 */

import { APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda';
import { DatabaseHandler } from '../services/databaseHandler';
import { Logger } from '../utils/logger';
import { PastaPai } from '../DAO/produtoDAO';

/**
 * Instância do Logger para registrar eventos e erros.
 */
const log : Logger = new Logger("log_teste.log");

/**
 * Instância do DatabaseHandler para interagir com o banco de dados.
 */
const databasehandler : DatabaseHandler = new DatabaseHandler(log);

/**
 * Handler para listar todos os departamentos disponíveis no banco de dados.
 * @returns {Promise<{statusCode: number, body: string}>} Resposta da API com a lista de departamentos ou mensagem de erro.
 */
export const listarDepartamentos: APIGatewayProxyHandler = async () => 
{
    try
    {
        const departamentos = await databasehandler.getDepartamentoTable()?.list();

        console.log(departamentos)

        return {
            statusCode: 200,
            body: JSON.stringify(departamentos)
        };
    }
    catch (error : any)
    {
        return {
            statusCode : 500,
            body: JSON.stringify({error : `Erro ao listar departamentos: ${error}`})
        };
    }
};

/**
 * Handler para listar os 3 produtos mais vendidos na página principal de bestsellers.
 * @returns {Promise<{statusCode: number, body: string}>} Resposta da API com a lista de produtos ou mensagem de erro.
 */
export const listarMaisVendidos: APIGatewayProxyHandler = async () => 
{
    try
    {
        const produtos = await databasehandler.getProdutoTable()?.getProdutosByDepartamento("-1", PastaPai.PAGINA_INICIAL);

        return {
            statusCode : 200,
            body : JSON.stringify(produtos)
        }
    }
    catch (error : any)
    {
        return {
            statusCode : 500,
            body: JSON.stringify({error : `Erro ao listar mais vendidos: ${error}`})
        };
    }
};

/**
 * Handler para listar os 3 produtos mais vendidos dentro de um departamento específico.
 * @param {APIGatewayProxyEvent} event - Evento da AWS Lambda contendo os parâmetros da requisição.
 * @returns {Promise<{statusCode: number, body: string}>} Resposta da API com a lista de produtos ou mensagem de erro.
 */
export const listarMaisVendidosPorDepartamento: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => 
{
    try
    {
        const idDepartamento = event.pathParameters?.id_departamento;

        if (!idDepartamento)
        {
            return {
                statusCode : 400,
                body : JSON.stringify({error : 'ID do departamento é obrigatório.'})
            };
        }

        const produtos = await databasehandler.getProdutoTable()?.getProdutosByDepartamento(idDepartamento, PastaPai.DEPARTAMENTO);

        return {
            statusCode : 200,
            body: JSON.stringify(produtos)
        }
    }
    catch (error : any)
    {
        return {
            statusCode : 500,
            body : JSON.stringify({error : `Erro ao listar mais vendidos por departamento: ${error}`})
        }
    }
};