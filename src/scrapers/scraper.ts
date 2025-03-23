import puppeteer, { Browser, Page } from 'puppeteer';
import * as dotenv from 'dotenv';

import Logger from '../utils/logger'

dotenv.config();

/**
 * Class description
 */
class AmazonScraper 
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
    
        await this.page.goto(url, { waitUntil: "load", timeout: 6000 });
    
        const departments: string[] = await this.page.evaluate(() => 
        {
            return Array.from(document.querySelectorAll('[role="treeitem"]'))
                .map((element, index) => 
                {

                    const anchor = element.querySelector("a"); 
                    if (!anchor) return null;
    
                    const href = anchor.getAttribute("href")?.trim() || "";
                    const text = anchor.textContent?.trim() || "";
                    const return_ = href && text ? `${href}:::${text}:::${index}` : null;
                    
                    return return_;
                })
                .filter((item): item is string => item !== null); 
        });
    
        return departments;
    }

    /**
     * 
     * 
     * @param
     * @param 
     * @returns 
     */
    private getOpcaoHref(departments: string[], id: number) : string | null
    {
        const department = departments.find(dept => 
        {
            const parts = dept.split(":::");
            return parseInt(parts[2], 10) === id;
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
    public async scrape_categorias_de_departamento(departamentos: string[], id_departamento: number) : Promise<string[]>
    {
        if (!this.page)
        {
            throw new Error("Page is not initialized.");
        }

        let href_departamento = this.getOpcaoHref(departamentos, id_departamento);
        let url = `${this.targetUrl}${href_departamento}`;

        let menu_categorias = await this.scrape_menu_opcoes(url);
        
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
    public async scrape_produtos_de_url(lista_com_links: string[], id_do_link: number) : Promise<string[]>
    {
        if (!this.page)
        {
            throw new Error("Page is not initialized.");
        }

        let link = this.getOpcaoHref(lista_com_links, id_do_link);
        let url = `${this.targetUrl}${link}`;

        let result = await this.scrape_paginas_redirecionadas(url);

        return result;
    }

    /**
     * 
     * 
     * @param
     * @param 
     * @returns 
     */
    private async scrape(url: string, selector: string) : Promise<string[]>
    {
        if (!this.page)
        {
            throw new Error("Page is not initialized.");
        }

        await this.page.goto(url, { waitUntil: 'load', timeout: 6000 });

        const products = await this.page.evaluate((selector: string) => {
            const items = Array.from(document.querySelectorAll(selector));
            return items.slice(0, 3).map(item => item.textContent?.trim() || '');
        }, selector);

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

        let result = await this.scrape(url, '.p13n-sc-truncated');

        return result;
    }

    /**
     * 
     * 
     * @param
     * @param 
     * @returns 
     */
    public async scrape_paginas_redirecionadas(url: string) : Promise<string[]>
    {
        if (!this.page)
        {
            throw new Error("Page is not initialized.");
        }

        let result = await this.scrape(url, '#gridItemRoot');

        return result;
    }

}

if (require.main == module) 
{
    const targetUrl = process.env.TARGET_URL || '';
    const amazonScraper = new AmazonScraper(targetUrl);

    /*
        Listar todos os departamentos -> feito
        Listar todas as categorias dentro do departamento -> feito

        Listar 3 itens mais vendidos -> feito
        Listar 3 itens mais vendidos dentro do departamento -> feito
        Listar 3 itens mais vendidos dentro da categoria -> feito


    */

    (async () => 
    {
        try 
        {
            await amazonScraper.iniciarBrowser();

            // const scraper = await amazonScraper.scrape_pagina_inicial(`${targetUrl}/bestsellers`);
            

            const departamentos = await amazonScraper.scrape_menu_opcoes(`${targetUrl}/bestsellers`);
            // console.log("Departamentos ->", departamentos);

            const categorias = await amazonScraper.scrape_categorias_de_departamento(departamentos, 23);
            // console.log("Categorias ->", categorias);

            const scraper = await amazonScraper.scrape_produtos_de_url(departamentos, 3);

            console.log("Produtos -> ", scraper);



            // let produtos = await amazonScraper.scrape_produtos_de_categoria(categorias, 3);
            
            // console.log("Produtos -> ", produtos);


            

            // const products = await amazonScraper.scrape(`${targetUrl}/bestsellers`);
        } 
        catch (error) 
        {
            console.error("Erro ao iniciar o browser:", error);
        } 
        finally 
        {
            await amazonScraper.finalizarBrowser();
        }

    })();
}