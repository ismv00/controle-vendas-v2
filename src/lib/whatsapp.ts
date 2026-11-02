// Monta um link "clique para conversar" do WhatsApp (wa.me) — não depende de API nem de
// aprovação da Meta, só abre o WhatsApp (web ou app) com o número e a mensagem já preenchidos.
export function buildWhatsAppLink(phone: string | undefined | null, message: string): string | null {
  const digits = (phone ?? '').replace(/\D/g, '');

  if (digits.length < 10 || digits.length > 13) return null;

  const withCountryCode = digits.startsWith('55') && digits.length >= 12 ? digits : `55${digits}`;

  return `https://wa.me/${withCountryCode}?text=${encodeURIComponent(message)}`;
}
