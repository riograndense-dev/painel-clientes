# A fazer:

- [x] baseie-se no novo campo de downloads de boletos do sicredi documentado em /docs/openapi.json para atualizar as tabelas de prestações para terem suporte a download de faturas. Destas, substituir a ultima coluna.
- [x] finalizar o botão de impressão de boletos: request sempre com `download=true`, tratamento de erros (401/403, JSON de erro, PDF vazio) e ocultar em faturas pagas.
