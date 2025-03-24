
import * as dotenv from 'dotenv';

import { AmazonScraper } from './scraper';
import { DatabaseHandler } from './databaseHandler';

import { PastaPai } from '../DAO/produtoDAO';
import { Logger } from '../utils/logger';

dotenv.config();

class ScraperService
{
    private webscraper : AmazonScraper | null = null;
    private databaseHandler : DatabaseHandler | null = null;
    private log : Logger | null = null;

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
        this.log = new Logger("/home/acso3d/Documents/webscraper-amazon-api/logs/log_teste.log");
        this.databaseHandler = new DatabaseHandler(this.log);
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
        if (!this.log)
        {
            throw new Error("[ScraperService] scrape_and_save() -> O objeto Logger não foi inicializado corretamente.");
        }

        if (!this.webscraper)
        {
            throw new Error("[ScraperService] scrape_and_save() -> O objeto AmazonScraper não foi inicializado corretamente.");
        }

        if (!this.databaseHandler)
        {
            throw new Error("[ScraperService] scrape_and_save() -> O objeto DatabaseHandler não foi inicializado corretamente.");
        }

        try
        {
    
            //
            //  Cria a tabela Produto
            //
            await this.databaseHandler.getProdutoTable()?.createTable();
            await this.databaseHandler.getProdutoTable()?.waitForTableActive();
    
            //
            //  Cria a tabela Departamento
            //
            await this.databaseHandler.getDepartamentoTable()?.createTable();
            await this.databaseHandler.getDepartamentoTable()?.waitForTableActive();



            await this.webscraper.iniciarBrowser();

            //
            //  Envia produtos da página principal para o BD
            //
            let produtos : string[] = await this.webscraper.scrape_pagina_inicial("/bestsellers");
            await this.databaseHandler.getProdutoTable()?.create_from_list(this.databaseHandler.parseProdutos(produtos));

            //
            //  Envia Departamentos para o BD
            //
            let departamentos = await this.webscraper.scrape_menu_opcoes("/bestsellers");
            let departamentos_list = this.databaseHandler.parseDepartamentos(departamentos);
            await this.databaseHandler.getDepartamentoTable()?.create_from_list(departamentos_list);

            //
            //  Envia os 3 bestsellers do departamento para o BD
            //
            for (const departamento of departamentos_list)
            {
                let produtos_departamento = await this.webscraper.scrape_paginas_redirecionadas(departamentos, departamento.id.toString(), PastaPai.DEPARTAMENTO);
                await this.databaseHandler.getProdutoTable()?.create_from_list(this.databaseHandler.parseProdutos(produtos_departamento, departamento.nome));
            }
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