import { DynamoDB } from 'aws-sdk';

import { DepartamentoDAO, Departamento } from '../DAO/departamentoDAO';
import { ProdutoDAO, Produto } from '../DAO/produtoDAO';

import { Logger } from '../utils/logger';

/**
 * Classe responsável por gerenciar as operações do banco de dados para os departamentos e produtos.
 */
export class DatabaseHandler
{
    private departamentoDAO : DepartamentoDAO | null = null;
    private produtoDao : ProdutoDAO | null = null;

    /**
     * Construtor da classe DatabaseHandler.
     * 
     * @param log Instância do Logger para registrar eventos e erros.
     */
    constructor(log: Logger)
    {
        this.departamentoDAO = new DepartamentoDAO(log);
        this.produtoDao = new ProdutoDAO(log);
    }

    /**
     * Retorna a instância do DAO de produtos.
     * 
     * @returns Instância de ProdutoDAO ou null se não estiver inicializada.
     */
    public getProdutoTable() : ProdutoDAO | null
    {
        return this.produtoDao;
    }

    /**
     * Retorna a instância do DAO de departamentos.
     * 
     * @returns Instância de DepartamentoDAO ou null se não estiver inicializada.
     */
    public getDepartamentoTable() : DepartamentoDAO | null
    {   
        return this.departamentoDAO;
    }

    /**
     * Converte uma lista de strings em objetos Produto.
     * 
     * @param lista Lista de strings representando produtos no formato "nome:::preco:::estrelas:::tipo_tabela_pai:::id_tabela_pai".
     * @param departamento_nome Nome do departamento ao qual os produtos pertencem (opcional).
     * @returns Lista de objetos Produto.
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
                id_tabela_pai : id_tabela_pai !== "null" ? parseInt(id_tabela_pai) : -1
            };
        });
    }

    /**
     * Converte uma lista de strings em objetos Departamento.
     * 
     * @param lista Lista de strings representando departamentos no formato "href:::nome:::id".
     * @returns Lista de objetos Departamento.
     */
    public parseDepartamentos(lista: string[]) : Departamento[]
    {
        return lista.map(item => {
            const [href, nome, id] = item.split(":::");
            return { id : parseInt(id), nome, href };
        });
    }
}