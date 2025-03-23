import { DynamoDB } from 'aws-sdk';

import { CategoriaDAO, Categoria } from '../DAO/categoriaDAO';
import { DepartamentoDAO, Departamento } from '../DAO/departamentoDAO';
import { ProdutoDAO, Produto } from '../DAO/produtoDAO';

export class DatabaseHandler
{
    private categoriaDAO : CategoriaDAO | null = null;
    private departamentoDAO : DepartamentoDAO | null = null;
    private produtoDao : ProdutoDAO | null = null;

    /**
     * 
     * 
     * @param
     * @param 
     * @returns 
     */
    constructor()
    {
        this.categoriaDAO = new CategoriaDAO();
        this.departamentoDAO = new DepartamentoDAO();
        this.produtoDao = new ProdutoDAO();
    }

    /**
     * 
     * 
     * @param
     * @param 
     * @returns 
     */
    public getCategoriaTable() : CategoriaDAO | null
    {
        return this.categoriaDAO;
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
    public parseCategorias(lista: string[]) : Categoria[]
    {
        return lista.map(item => {
            const [href, nome, id] = item.split(":::");
            return { id, nome, href };
        });
    }

    // /**
    //  * 
    //  * 
    //  * @param
    //  * @param 
    //  * @returns 
    //  */
    public parseProdutos(lista: string[]) : Produto[]
    {
        return lista.map(item => {
            const [id, nome, preco, estrelas, num_avaliacoes, tipo_tabela_pai, id_tabela_pai] = item.split(":::");
            
            return { 
                id, 
                nome, 
                preco, 
                estrelas, 
                num_avaliacoes, 
                tipo_tabela_pai, 
                id_tabela_pai : id_tabela_pai !== "null" ? id_tabela_pai : "Página Inicial - Sem ID"
            };
        });
    }

    // /**
    //  * 
    //  * 
    //  * @param
    //  * @param 
    //  * @returns 
    //  */
    public parseDepartamentos(lista: string[]) : Departamento[]
    {
        return lista.map(item => {
            const [href, nome, id] = item.split(":::");
            return { id, nome, href };
        });
    }
}