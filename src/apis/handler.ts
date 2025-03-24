import { APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda';
import { DatabaseHandler } from '../services/databaseHandler';
import { Logger } from '../utils/logger';
import { PastaPai } from '../DAO/produtoDAO';

const log : Logger = new Logger("log_teste.log");
const databasehandler : DatabaseHandler = new DatabaseHandler(log);

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