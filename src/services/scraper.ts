import puppeteer, { Browser, Page } from 'puppeteer';
import * as dotenv from 'dotenv';

import {Logger} from '../utils/logger'
import { PastaPai } from '../DAO/produtoDAO';

dotenv.config();

/**
 * Class description
 */
export class AmazonScraper 
{

    private targetUrl: string;
    private log: Logger;
    private browser : Browser | null = null;
    private page : Page | null = null

    /**
     * 
     * 
     * @param
     * @param 
     * @returns 
     */
    constructor(targetUrl: string)
    {
        this.targetUrl = targetUrl;
        this.log = new Logger("../../logs/log_teste");
    }   

    /**
     * 
     * 
     * @param
     * @param 
     * @returns 
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
     * 
     * 
     * @param
     * @param 
     * @returns 
     */
    public async finalizarBrowser()
    {
        if (this.browser)
        {
            await this.browser.close();
        }
    }

    /**
     * 
     * 
     * @param
     * @param 
     * @returns 
     */
    public async scrape_menu_opcoes(url: string) : Promise<string[]>
    {
        if (!this.page) 
        {
            throw new Error("Page is not initialized.");
        }
    
        await this.page.goto(`${this.targetUrl}${url}`, { waitUntil: "load", timeout: 6000 });

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
     * 
     * 
     * @param
     * @param 
     * @returns 
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
     * 
     * 
     * @param
     * @param 
     * @returns 
     */
    public async scrape_categorias_de_departamento(departamentos: string[], id_departamento: string) : Promise<string[]>
    {
        if (!this.page)
        {
            throw new Error("Page is not initialized.");
        }

        let href_departamento = this.getOpcaoHref(departamentos, id_departamento);
        if (!href_departamento) throw Error("[Scraper] scrape_categorias_de_departamento() -> Não foi possível extrair o link para este id de departamento.");

        let menu_categorias = await this.scrape_menu_opcoes(href_departamento);
        
        let categorias = menu_categorias.map((item: string) => 
        {
            let partes = item.split(":::"); 

            return `${partes[0]}:::${partes[1]}:::${partes[2]}`;

        });

        return categorias;
    }

    /**
     * 
     * 
     * @param
     * @param 
     * @returns 
     */
    private async scrape(url: string, selector: string, tipo_tabela: string | null, id_tabela: string | null) : Promise<string[]>
    {
        if (!this.page)
        {
            throw new Error("Page is not initialized.");
        }

        await this.page.goto(url, { waitUntil: 'load', timeout: 6000 });

        let index : number = 0;

        const products = await this.page.evaluate((selector: string, tipo_tabela: string | null, id_tabela: string | null, index: number) => 
        {
            const items = Array.from(document.querySelectorAll(selector));
        
            return items.slice(0, 3).map(item => 
            {
                const nome_selector : string = tipo_tabela === "Página Inicial" ? ".p13n-sc-truncate-desktop-type2" : "._cDEzb_p13n-sc-css-line-clamp-2_EWgCb";

                const nome = item.querySelector(nome_selector)?.textContent?.trim() || "N/A";
                const estrelas = item.querySelector(".a-icon-alt")?.textContent?.trim() || "N/A";
                const numAvaliacoes = item.querySelector(".a-size-small")?.textContent?.trim() || "N/A";
                const preco = item.querySelector("._cDEzb_p13n-sc-price_3mJ9Z")?.textContent?.trim() || "N/A";

                let return_statement : string = `${index}:::${nome}:::${preco}:::${estrelas}:::${numAvaliacoes}:::${tipo_tabela}:::${id_tabela}`
                
                index += 1;
                
                return return_statement;
            });
        
        }, selector, tipo_tabela, id_tabela, index);
        

        return products;
    }

    /**
     * 
     * 
     * @param
     * @param 
     * @returns 
     */
    public async scrape_pagina_inicial(url: string) : Promise<string[]>
    {
        if (!this.page)
        {
            throw new Error("Page is not initialized.");
        }

        let result = await this.scrape(`${this.targetUrl}${url}`, '.a-carousel-card', PastaPai.PAGINA_INICIAL, null);

        return result;
    }

    /**
     * 
     * 
     * @param
     * @param 
     * @returns 
     */
    public async scrape_paginas_redirecionadas(lista_com_links: string[], id_do_link: string, tipo_tabela: string) : Promise<string[]>
    {
        if (!this.page)
        {
            throw new Error("Page is not initialized.");
        }

        let link = this.getOpcaoHref(lista_com_links, id_do_link);
        let url = `${this.targetUrl}${link}`;

        let result = await this.scrape(url, '#gridItemRoot', tipo_tabela, id_do_link);

        return result;
    }

}