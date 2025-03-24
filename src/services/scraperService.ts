
import * as dotenv from 'dotenv';

import { AmazonScraper } from './scraper';
import { DatabaseHandler } from './databaseHandler';

import { PastaPai } from '../DAO/produtoDAO';
import { Logger } from '../utils/logger';

dotenv.config();

/**
 * Classe responsável por orquestrar a raspagem de dados da web e salvamento no banco de dados.
 * 
 * Ela inicializa o scraper da Amazon, o manipulador de banco de dados e o logger, 
 * e depois realiza o processo de raspagem e salvamento de dados de maneira sequencial.
 */
class ScraperService
{
    private webscraper : AmazonScraper | null = null;
    private databaseHandler : DatabaseHandler | null = null;
    private log : Logger | null = null;

    /**
     * Construtor da classe ScraperService.
     * Inicializa as instâncias necessárias do scraper, do banco de dados e do logger.
     * 
     * @throws Se algum dos objetos não for inicializado corretamente.
     */
    constructor()
    {
        const targetUrl = process.env.TARGET_URL || "";
        this.log = new Logger("/home/acso3d/Documents/webscraper-amazon-api/logs/log_teste.log");
        this.databaseHandler = new DatabaseHandler(this.log);
        this.webscraper = new AmazonScraper(targetUrl);
    }

    /**
     * Método que executa a raspagem de dados e os salva no banco de dados.
     * 
     * Este método realiza os seguintes passos:
     * 1. Cria as tabelas de produtos e departamentos no banco de dados, se não existirem.
     * 2. Inicia o browser e realiza a raspagem de produtos da página principal.
     * 3. Realiza a raspagem e o salvamento dos departamentos.
     * 4. Para cada departamento, realiza a raspagem dos três produtos mais vendidos e os salva no banco.
     * 
     * @throws Se ocorrer algum erro durante o processo de raspagem ou salvamento.
     */
    public async scrapeAndSave() : Promise<void>
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
            await this.databaseHandler.getProdutoTable()?.criarTabela();
            await this.databaseHandler.getProdutoTable()?.esperarTabelaEstarAtiva();
    
            //
            //  Cria a tabela Departamento
            //
            await this.databaseHandler.getDepartamentoTable()?.criarTabela();
            await this.databaseHandler.getDepartamentoTable()?.esperarTabelaEstarAtiva();



            await this.webscraper.iniciarBrowser();

            //
            //  Envia produtos da página principal para o BD
            //
            let produtos : string[] = await this.webscraper.scrapePaginaInicial("/bestsellers");
            console.log(await this.databaseHandler.getProdutoTable()?.listar())
            await this.databaseHandler.getProdutoTable()?.criarDeLista(this.databaseHandler.parseProdutos(produtos));



            //
            //  Envia Departamentos para o BD
            //
            let departamentos = await this.webscraper.scrape_menu_opcoes("/bestsellers");
            let departamentos_list = this.databaseHandler.parseDepartamentos(departamentos);
            await this.databaseHandler.getDepartamentoTable()?.criarDeLista(departamentos_list);

            //
            //  Envia os 3 bestsellers do departamento para o BD
            //
            for (const departamento of departamentos_list)
            {
                let produtos_departamento = await this.webscraper.scrapePaginasRedirecionadas(departamentos, departamento.id.toString(), PastaPai.DEPARTAMENTO);
                await this.databaseHandler.getProdutoTable()?.criarDeLista(this.databaseHandler.parseProdutos(produtos_departamento, departamento.nome));
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

        scraperService.scrapeAndSave();
    })();
}