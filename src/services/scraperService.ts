
import { AmazonScraper } from './scraper';
import { DatabaseHandler } from './databaseHandler';

import * as dotenv from 'dotenv';
import { PastaPai } from '../DAO/produtoDAO';
import { Departamento } from '../DAO/departamentoDAO';

dotenv.config();

class ScraperService
{
    private webscraper : AmazonScraper | null = null;
    private databaseHandler : DatabaseHandler | null = null;

    /**
     * 
     * 
     * @param
     * @param 
     * @returns 
     */
    constructor()
    {
        const targetUrl = process.env.TARGET_URL || "";
        this.databaseHandler = new DatabaseHandler();
        this.webscraper = new AmazonScraper(targetUrl);
    }

    /**
     * 
     * 
     * @param
     * @param 
     * @returns 
     */
    public async scrape_and_save() : Promise<void>
    {
        if (!this.webscraper || !this.databaseHandler)
        {
            throw new Error("[ScraperService] scrape_and_save() -> O objeto webscraper não foi inicializado corretamente.");
        }

        try
        {
            await this.webscraper.iniciarBrowser();

            
            //
            //  Cria uma lista de departamentos
            //
            // const departamentos = await this.webscraper.scrape_menu_opcoes(`/bestsellers`);
            // const departamentos_list = this.databaseHandler.parseDepartamentos(departamentos);
            // console.log("Departamentos -> ", departamentos);

            
            //
            //  Cria uma lista de categorias para cada departamento
            //
            // for (const departamento of departamentos_list)
            // {
            //     const categorias = await this.webscraper.scrape_categorias_de_departamento(departamentos, departamento.id);

            //     const categorias_list = this.databaseHandler.parseCategorias(categorias);

            //     console.log("categorias -> ", categorias_list);
            // }

            //
            //  Cria uma lista de produtos da página inicial
            //
            // const produtos_pag_inicial = await this.webscraper.scrape_pagina_inicial("/bestsellers");
            // const produtos_list = this.databaseHandler.parseProdutos(produtos_pag_inicial);
            // console.log("Produtos -> ", produtos_list)

            //
            //  Cria uma lista de produtos de um departamento
            //
            // const produtos_departamento = await this.webscraper.scrape_paginas_redirecionadas(departamentos, "1", PastaPai.DEPARTAMENTO);
            // const produtos_list = this.databaseHandler.parseProdutos(produtos_departamento);
            // console.log("Produtos Alimentos e Bebidas -> ", produtos_list);

            //
            //  Cria uma lista de produtos por categoria
            //
            // const categorias = await this.webscraper.scrape_categorias_de_departamento(departamentos, "1");
            // const produtos_categoria = await this.webscraper.scrape_paginas_redirecionadas(categorias, "1", PastaPai.CATEGORIA);
            // console.log("Produtos Alimentos Enlatados, em Conserva e em Pacotes -> ", produtos_categoria);
        }
        catch(error) 
        {
            console.error("Erro ao iniciar o browser:", error);
        }
        finally
        {
            this.webscraper.finalizarBrowser();
        }
    }
}

if (require.main == module) 
{
    (async () => 
    {

        console.log("iniciando...");

        let scraperService : ScraperService = new ScraperService();

        scraperService.scrape_and_save();

    })();
}