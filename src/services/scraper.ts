import puppeteer, { Browser, Page } from 'puppeteer';
import * as dotenv from 'dotenv';

import { PastaPai } from '../DAO/produtoDAO';

dotenv.config();

/**
 * Classe responsável por realizar o scraping de dados do site Amazon.
 * Utiliza o Puppeteer para navegar na página e extrair informações sobre produtos e departamentos.
 */
export class AmazonScraper 
{

    private targetUrl: string;
    private browser : Browser | null = null;
    private page : Page | null = null

    /**
     * Construtor da classe `AmazonScraper`.
     * 
     * @param targetUrl URL de base do site para o qual as requisições de scraping serão feitas.
     */
    constructor(targetUrl: string)
    {
        this.targetUrl = targetUrl;
    }   

    /**
     * Inicia o navegador Puppeteer.
     * Cria uma instância de `browser` e `page`.
     * 
     * @returns Promise que resolve quando o browser for iniciado.
     */
    public async iniciarBrowser()
    {
        this.browser = await puppeteer.launch(
            {
                headless: true,
            }
        );
        
        this.page = await this.browser.newPage();
    }

    /**
     * Finaliza o navegador Puppeteer.
     * 
     * @returns Promise que resolve quando o browser for fechado.
     */
    public async finalizarBrowser()
    {
        if (this.browser)
        {
            await this.browser.close();
        }
    }

    /**
     * Realiza o scraping das opções de menu de departamentos da Amazon.
     * 
     * @param url URL adicional para acessar a página de departamentos.
     * @returns Uma lista de strings representando as opções de menu dos departamentos.
     */
    public async scrape_menu_opcoes(url: string) : Promise<string[]>
    {
        if (!this.page) 
        {
            throw new Error("Page is not initialized.");
        }
    
        await this.page.goto(`${this.targetUrl}${url}`, { waitUntil: "load", timeout: 20000 });

        let index : number = 1;
    
        const departments: string[] = await this.page.evaluate((index : number) => 
        {
            return Array.from(document.querySelectorAll('[role="treeitem"]'))
                .map((element) => 
                {

                    const anchor = element.querySelector("a"); 
                    if (!anchor) return null;
    
                    const href = anchor.getAttribute("href")?.trim() || "";
                    const text = anchor.textContent?.trim() || "";
                    const return_ = href && text ? `${href}:::${text}:::${index}` : null;

                    index += 1;
                    
                    return return_;
                })
                .filter((item): item is string => item !== null); 
        }, index);
    
        return departments;
    }

    /**
     * Retorna o `href` do departamento com base no ID.
     * 
     * @param departments Lista de departamentos extraída da página.
     * @param id ID do departamento.
     * @returns O `href` do departamento ou `null` se não encontrado.
     */
    private getOpcaoHref(departments: string[], id: string) : string | null
    {
        const department = departments.find(dept => 
        {
            const parts = dept.split(":::");
            return parts[2] === id;
        });
    
        return department ? department.split(":::")[0] : null;
    }

    /**
     * Realiza o scraping de uma página de produtos da Amazon.
     * 
     * @param url URL da página a ser acessada.
     * @param selector Seletor CSS para localizar os produtos na página.
     * @param tipo_tabela Tipo de tabela pai, usado para identificar o tipo de página.
     * @param id_tabela ID da tabela pai.
     * @returns Lista de strings contendo os detalhes dos produtos encontrados.
     */
    public async scrape(url: string, selector: string, tipo_tabela: string | null, id_tabela : string) : Promise<string[]>
    {
        if (!this.page)
        {
            throw new Error("Page is not initialized.");
        }

        await this.page.goto(`${this.targetUrl}${url}`, { waitUntil: 'load', timeout: 20000 });

        const products = await this.page.evaluate((selector: string, tipo_tabela: string | null, id_tabela: string) => 
        {
            const items = Array.from(document.querySelectorAll(selector));
        
            return items.slice(0, 3).map(item => 
            {
                const nome_selector : string = tipo_tabela === "Página Inicial" ? ".p13n-sc-truncate-desktop-type2" : "._cDEzb_p13n-sc-css-line-clamp-2_EWgCb";
                const nome_selector_2 : string = "._cDEzb_p13n-sc-css-line-clamp-3_g3dy1";
                const nome_selector_3 : string = "._cDEzb_p13n-sc-css-line-clamp-1_1Fn1y";
                const nome_selector_4 : string = "._cDEzb_p13n-sc-css-line-clamp-4_2q2cc";
 
                const nome = item.querySelector(nome_selector)?.textContent?.trim() || item.querySelector(nome_selector_2)?.textContent?.trim() || item.querySelector(nome_selector_3)?.textContent?.trim() || item.querySelector(nome_selector_4)?.textContent?.trim();
                const estrelas = item.querySelector(".a-icon-alt")?.textContent?.trim() || "N/A";
                const preco = item.querySelector("._cDEzb_p13n-sc-price_3mJ9Z")?.textContent?.trim() || "N/A";

                let return_statement : string = `${nome}:::${preco}:::${estrelas}:::${tipo_tabela}:::${id_tabela}`
                
                return return_statement;
            });
        
        }, selector, tipo_tabela, id_tabela);
        

        return products;
    }

    /**
     * Realiza o scraping da página inicial da Amazon.
     * 
     * @param url URL da página de início.
     * @returns Lista de produtos encontrados na página inicial.
     */
    public async scrape_pagina_inicial(url: string) : Promise<string[]>
    {
        if (!this.page)
        {
            throw new Error("Page is not initialized.");
        }

        let result = await this.scrape(url, '.a-carousel-card', PastaPai.PAGINA_INICIAL, "null");

        return result;
    }

    /**
     * Realiza o scraping das páginas redirecionadas a partir dos links dos departamentos.
     * 
     * @param lista_com_links Lista de links dos departamentos.
     * @param id_do_link ID do link que será seguido.
     * @param tipo_tabela Tipo de tabela pai (página inicial ou departamento).
     * @returns Lista de produtos encontrados nas páginas redirecionadas.
     */
    public async scrape_paginas_redirecionadas(lista_com_links: string[], id_do_link: string, tipo_tabela: string) : Promise<string[]>
    {
        if (!this.page)
        {
            throw new Error("Page is not initialized.");
        }

        let link = this.getOpcaoHref(lista_com_links, id_do_link);
        if (!link) throw Error("[Scraper] scrape_paginas_redirecionadas() -> Não foi possível extrair o link para este id.");

        let result = await this.scrape(link, '#gridItemRoot', tipo_tabela, id_do_link);

        return result;
    }

}