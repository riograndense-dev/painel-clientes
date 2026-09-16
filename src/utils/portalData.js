// Os endpoints /portal possuem schemas de resposta abertos no OpenAPI. Na
// prática, alguns retornos podem vir como lista e outros como uma lista dentro
// de um envelope. Mantemos essa adaptação em um único lugar para a UI sempre
// trabalhar com coleções e com os nomes documentados em PrestacaoResponse.
const COLLECTION_KEYS = ['data', 'items', 'results', 'faturas', 'pedidos', 'prestacoes'];
const FIELD_ALIASES = {
  DUPLIC: ['duplicata', 'numduplic', 'numero_duplicata', 'numeroduplicata'],
  PREST: ['parcela', 'prestacao', 'numprest', 'numero_parcela', 'numeroparcela'],
  VALOR: ['valor_total', 'valorpagar', 'valor_pagar', 'valor_original', 'vlr'],
  DTEMISSAO: ['emissao', 'data_emissao', 'dataemissao', 'dt_emissao'],
  DTVENC: ['vencimento', 'data_vencimento', 'datavencimento', 'dt_vencimento', 'dt_venc'],
  DTBAIXA: ['baixa', 'data_baixa', 'databaixa', 'dt_baixa', 'data_pagamento'],
  CODBARRA: ['codigo_barras', 'codigobarras', 'linha_digitavel', 'linhadigitavel'],
  CODUSUR: ['cod_vendedor', 'codvendedor', 'codigo_vendedor', 'codusu', 'vendedor_codigo'],
  NOME: ['nome_vendedor', 'nomevendedor', 'vendedor', 'usuario', 'nome_usuario'],
  FONE: ['telefone', 'fone_vendedor', 'celular', 'numero_telefone'],
  NUMPED: ['numero', 'numero_pedido', 'numeropedido', 'pedido', 'numped'],
  CODFILIAL: ['filial', 'cod_filial', 'codigo_filial'],
  CODPROD: ['codigo_produto', 'codprod', 'produto_codigo'],
  DESCRPROD: ['descricao', 'descricao_produto', 'descricaoproduto'],
  QTVEN: ['quantidade', 'qtd', 'quantidade_vendida'],
  PVENDA: ['preco_unitario', 'precounitario', 'preco', 'valor_unitario'],
  UNIDADE: ['unidade', 'embalagem'],
  IMAGEM: ['imagem', 'image', 'url_imagem'],
};

function comparableKey(value) {
  return String(value).replace(/[^a-z0-9]/gi, '').toLowerCase();
}

export function collectionFromResponse(response) {
  if (Array.isArray(response)) return response;
  if (!response || typeof response !== 'object') return [];

  for (const key of COLLECTION_KEYS) {
    if (Array.isArray(response[key])) return response[key];
    if (Array.isArray(response[key.toUpperCase()])) return response[key.toUpperCase()];
  }
  return [];
}

export function apiField(record, field) {
  if (!record || typeof record !== 'object') return undefined;
  if (record[field] !== undefined) return record[field];
  const expected = new Set([field, ...(FIELD_ALIASES[field] || [])].map(comparableKey));
  const key = Object.keys(record).find((name) => expected.has(comparableKey(name)));
  return key ? record[key] : undefined;
}

export function decimalValue(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value !== 'string') return 0;
  const normalized = value.includes(',') ? value.replace(/\./g, '').replace(',', '.') : value;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}
