// Monta o "Pix copia e cola" (BR Code / EMV) a partir da chave Pix do usuário.
// Referência: Manual de Padrões para Iniciação do Pix (Bacen).

const DIACRITICS_REGEX = new RegExp('[̀-ͯ]', 'g');

function tlv(id: string, value: string): string {
  const length = value.length.toString().padStart(2, '0');
  return `${id}${length}${value}`;
}

function sanitize(text: string, maxLength: number, fallback: string): string {
  const cleaned = text
    .normalize('NFD')
    .replace(DIACRITICS_REGEX, '')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .trim();

  return (cleaned || fallback).slice(0, maxLength);
}

function crc16(payload: string): string {
  let crc = 0xffff;

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;

    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) !== 0 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

type PixPayloadInput = {
  key: string;
  merchantName: string;
  amount: number;
  txid: string;
  merchantCity?: string;
};

export function buildPixPayload({
  key,
  merchantName,
  amount,
  txid,
  merchantCity = 'BRASIL',
}: PixPayloadInput): string {
  const merchantAccountInfo = tlv('00', 'br.gov.bcb.pix') + tlv('01', key.trim());
  const additionalData = tlv('05', sanitize(txid, 25, '***').toUpperCase());

  const payloadWithoutCrc =
    tlv('00', '01') +
    tlv('01', '12') +
    tlv('26', merchantAccountInfo) +
    tlv('52', '0000') +
    tlv('53', '986') +
    tlv('54', amount.toFixed(2)) +
    tlv('58', 'BR') +
    tlv('59', sanitize(merchantName, 25, 'RECEBEDOR')) +
    tlv('60', sanitize(merchantCity, 15, 'BRASIL')) +
    tlv('62', additionalData) +
    '6304';

  return payloadWithoutCrc + crc16(payloadWithoutCrc);
}
