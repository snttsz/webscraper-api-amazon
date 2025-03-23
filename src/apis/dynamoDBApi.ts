import { DynamoDB } from 'aws-sdk';

import * as dotenv from 'dotenv';

import { CategoriaDAO, Categoria } from '../DAO/categoriaDAO';
import { DepartamentoDAO, Departamento } from '../DAO/departamentoDAO';
import { ProdutoDAO, Produto } from '../DAO/produtoDAO';

dotenv.config();

export class DynamoDBApi
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
    public getDepartamentoTable() : CategoriaDAO | null
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
    public converter_para_lista_de_categorias(lista: string[]) : Categoria[]
    {
    }

    /**
     * 
     * 
     * @param
     * @param 
     * @returns 
     */
    public converter_para_lista_de_produtos(lista: string[]) : Produto[]
    {
    }

    /**
     * 
     * 
     * @param
     * @param 
     * @returns 
     */
    public converter_para_lista_de_departamentos(lista: string[]) : Departamento[]
    {
    }
}