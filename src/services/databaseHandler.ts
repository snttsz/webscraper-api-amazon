import { DynamoDB } from 'aws-sdk';

import { DepartamentoDAO, Departamento } from '../DAO/departamentoDAO';
import { ProdutoDAO, Produto } from '../DAO/produtoDAO';

import { Logger } from '../utils/logger';

export class DatabaseHandler
{
    private departamentoDAO : DepartamentoDAO | null = null;
    private produtoDao : ProdutoDAO | null = null;

    /**
     * 
     * 
     * @param
     * @param 
     * @returns 
     */
    constructor(log: Logger)
    {
        this.departamentoDAO = new DepartamentoDAO(log);
        this.produtoDao = new ProdutoDAO(log);
    }

    /**
     * 
     * 
     * @param
     * @param 
     * @returns 
     */
    public getProdutoTable() : ProdutoDAO | null
    {
        return this.produtoDao;
    }

    /**
     * 
     * 
     * @param
     * @param 
     * @returns 
     */
    public getDepartamentoTable() : DepartamentoDAO | null
    {   
        return this.departamentoDAO;
    }

    /**
     * 
     * 
     * @param
     * @param 
     * @returns 
     */
    public parseProdutos(lista: string[], departamento_nome : string = "") : Produto[]
    {
        return lista.map(item => {
            const [nome, preco, estrelas, tipo_tabela_pai, id_tabela_pai] = item.split(":::");
            
            return { 
                id : -1, 
                nome : nome, 
                preco : preco, 
                estrelas : estrelas,
                tipo_tabela_pai : `${tipo_tabela_pai} : ${departamento_nome}`,
                id_tabela_pai : id_tabela_pai !== "null" ? id_tabela_pai : "Página Inicial - Sem ID"
            };
        });
    }

    /**
     * 
     * 
     * @param
     * @param 
     * @returns 
     */
    public parseDepartamentos(lista: string[]) : Departamento[]
    {
        return lista.map(item => {
            const [href, nome, id] = item.split(":::");
            return { id : parseInt(id), nome, href };
        });
    }
}