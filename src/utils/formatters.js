/**
 * Formata CPF (000.000.000-00) ou CNPJ (00.000.000/0000-00) enquanto digita.
 * Retorna sempre apenas os caracteres de máscara sobre os dígitos informados.
 */
export function formatDoc(val) {
  const digits = String(val || '').replace(/\D/g, '').slice(0, 14);
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

/** Remove máscara, deixando apenas os dígitos (usado nas chamadas da API). */
export function onlyDigits(val) {
  return String(val || '').replace(/\D/g, '');
}
