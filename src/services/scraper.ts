import puppeteer, { Browser, Page } from 'puppeteer';
import * as dotenv from 'dotenv';

import { PastaPai } from '../DAO/produtoDAO';

dotenv.config();

/**
 * Class description
 */
export class AmazonScraper 
{

    private targetUrl: string;
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

        let result = await this.scrape(url, '.a-carousel-card', PastaPai.PAGINA_INICIAL, "null");

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
        if (!link) throw Error("[Scraper] scrape_paginas_redirecionadas() -> Não foi possível extrair o link para este id.");

        let result = await this.scrape(link, '#gridItemRoot', tipo_tabela, id_do_link);

        return result;
    }

}