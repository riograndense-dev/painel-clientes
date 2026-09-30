# A fazer:

- [x] Implementar cores semelhantes ao site principal (./src/styles/site.css)
- [x] Retirar barra de rolagem inferior do menu lateral
- [x] *IMPORTANTE:* Verificar e corrigir os dados recebidos do json que não está sendo exibido corretamente nas tabelas e telas
- [x] Adicionar cobertura para um campo nas faturas que será adicionado futuramente às prestações(CODBARRA)
- [x] Coloque um botão que copia esse código e abra o site da fazenda para verificar a nota (https://www.nfe.fazenda.gov.br/portal/consultaRecaptcha.aspx?tipoConsulta=resumo&tipoConteudo=7PhJ+gAVw2g=)
- [x] Priorize um pouco mais a navegação mobile
- [x] Troca de senha do cliente (`PUT /portal/clientes/senha` logado e `PUT /portal/clientes/senha/recuperar` sem login)
- Mantenha o design e estilo utilizado

## Notas: 
API já documentada em docs/openapi.json; Basear-se nela para buscar os dados (principalmente nos endpoints com o prefixo portal)
A empresa de posse desse software é Distribuidora de Alimentos Riograndense LTDA