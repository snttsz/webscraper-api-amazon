# Documentação da API

## Visão Geral

Esta API fornece endpoints para recuperar dados de departamentos e produtos de um banco de dados DynamoDB. Inclui operações para listar todos os departamentos, buscar produtos os 3 produtos mais vendidos da página principal e obter 3 produtos mais vendidos por departamento.

## URL Base

```
https://5p7ew83tf7.execute-api.sa-east-1.amazonaws.com/dev/
```

## Endpoints

### 1. Listar Departamentos

**Endpoint:**

```
GET /departamentos
```

**Descrição:**
Retorna uma lista de todos os departamentos da página principal de bestsellers da amazon.

```
{
  "statusCode": 200,
  "body": [
    {
      "id": 1,
      "nome": "Eletrônicos",
      "href": "eletronicos"
    },
    {
      "id": 2,
      "nome": "Eletrodomésticos",
      "href": "eletrodomesticos"
    }
  ]
}
```

**Códigos de Resposta:**

* 200: Sucesso
* 500: Erro no servidor

### 2. Listar 3 Produtos Mais Vendidos

**Endpoint:**

```
GET /produtos
```

**Descrição:**
Retorna 3 produtos mais vendidos na página principal de bestsellers.

**Resposta:**

```
{
  "statusCode": 200,
  "body": [
    {
      "id": 101,
      "nome": "Smartphone XYZ",
      "preco": "$699.99",
      "estrelas": "4.5",
      "tipo_tabela_pai": "Departamento : Eletrônicos",
      "id_tabela_pai": "3"
    }
  ]
}
```

**Códigos de Resposta:**

* 200: Sucesso
* 500: Erro no servidor

### 3. Listar 3 Produtos Mais Vendidos por Departamento

**Endpoint:**

```
GET /departamentos/{id_departamento}
```

**Descrição:**
Retorna os 3 produtos mais vendidos de um departamento específico.

**Parâmetros de URL:**

* `<span>id_departamento</span>` (string) - O ID do departamento

**Resposta:**

```
{
  "statusCode": 200,
  "body": [
    {
      "id": 202,
      "nome": "TV 4K Ultra HD",
      "preco": "$899.99",
      "estrelas": "4.8",
      "tipo_tabela_pai": "Departamento",
      "id_tabela_pai": "2"
    }
  ]
}
```

**Códigos de Resposta:**

* 200: Sucesso
* 400: ID do departamento ausente
* 500: Erro no servidor

## Respostas de Erro

Todas as respostas de erro seguem este formato:

```
{
  "statusCode": 400,
  "body": {
    "error": "Descrição do erro"
  }
}
```


## Tecnologias Utilizadas

* **AWS Lambda** para execução serverless
* **AWS DynamoDB** para armazenamento NoSQL
* **Node.js** com TypeScript para implementação da API
* **API Gateway** para exposição da API

## Estrutura do Banco de Dados

### Tabela de Produtos (`Produto`)

| Campo               | Tipo    | Descrição                                 |
| ------------------- | ------- | ------------------------------------------- |
| `id`              | Número | Identificador único                        |
| `nome`            | String  | Nome do produto                             |
| `preco`           | String  | Preço do produto                           |
| `estrelas`        | String  | Avaliação do cliente                      |
| `tipo_tabela_pai` | String  | Categoria (Página Inicial ou Departamento) |
| `id_tabela_pai`   | Número | ID de referência do departamento           |

### Tabela de Departamentos (`Departamento`)

| Campo    | Tipo    | Descrição            |
| -------- | ------- | ---------------------- |
| `id`   | Número | Identificador único   |
| `nome` | String  | Nome do departamento   |
| `href` | String  | Referência para a URL |



**Última Atualização:** Março de 2025
