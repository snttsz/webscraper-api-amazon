# Amazon Web Scraper

Este projeto é um scraper para coletar dados de produtos e departamentos da Amazon, com foco nos 3 produtos mais vendidos (bestsellers) de diferentes departamentos. Os dados coletados são armazenados em um banco de dados na AWS e disponibilizados via API. A aplicação também conta com um sistema de logging para monitoramento e depuração.

Para informações sobre como usar a API, veja o arquivo documentation.md.

## Funcionalidades

* **Coleta de Produtos e Departamentos** : Scrapeia os produtos mais vendidos da página inicial e dos departamentos.
* **Armazenamento no Banco de Dados** : Envia os dados coletados para um banco de dados DynamoDB na AWS.
* **API de Exposição de Dados** : Expõe os dados armazenados via API.
* **Logging** : Registra todas as ações e erros durante a execução do scraper.

## Tecnologias Utilizadas

* **Node.js** : Para executar o backend e o scraping.
* **TypeScript** : Para garantir maior segurança no código e facilitar o desenvolvimento.
* **AWS DynamoDB** : Banco de dados NoSQL para armazenamento dos produtos e departamentos.
* **Winston** : Para logging e monitoramento da execução do scraper.
* **Puppeteer** : Para realizar o scraping das páginas da Amazon.
* **dotenv** : Para carregar as variáveis de ambiente de maneira segura.
* **Serverless Framework** : Criação e implantação de funções serverless na AWS, como Lambda e API Gateway.

## Pré-requisitos

Antes de rodar o projeto, você precisará de:

* **Node.js** : Instalado na versão 14 ou superior.
* **AWS Account** : Para utilizar o DynamoDB e outras ferramentas da AWS.
* **Variáveis de Ambiente** : Definir as variáveis necessárias (explicadas abaixo).
* **npm** ou  **yarn** : Para gerenciamento de dependências.

## Configuração do Ambiente

1. **Instale as dependências do projeto** :

   ```
   npm install
   ```
2. Configure seu ambiente da AWS com suas crediencias, utilizando a região "sa-east-1" (Ou você pode mudar a variável dentro de src/DAO/DAO.ts para a região de sua preferência):

   ```
   aws configure
   ```
3. **Criação de Tabelas no DynamoDB**:

   O scraper cria automaticamente as tabelas `Produto` e `Departamento` no DynamoDB durante a execução.
