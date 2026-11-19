# API RESTful de Clientes

Rotas:
- GET /clientes
- POST /clientes
- PUT /clientes
- DELETE /clientes

## Rodar localmente
1. npm install
2. Defina a variável MONGODB_URI
3. npm start

## POST
Body:
{
  "nome": "João",
  "sobreNome": "da Silva"
}
Resposta: status 200, corpo vazio.

## PUT
Body:
{
  "_id": "ID_DO_CLIENTE",
  "sobreNome": "de Souza"
}
Resposta: registro atualizado.

## DELETE
Body:
{
  "_id": "ID_DO_CLIENTE"
}
Resposta: status 200, corpo vazio.

## GET
Retorna a lista de clientes.

## Deploy no Render
- Build Command: npm install
- Start Command: npm start
- Crie a variável MONGODB_URI no painel do Render.
- URL final: https://SEU-PROJETO.onrender.com/clientes
