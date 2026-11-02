// Gera um PDF de verdade a partir de um elemento da tela (captura visual + embute num PDF),
// pra poder compartilhar como arquivo anexado — o botão de impressão usa window.print(), que
// não produz um arquivo utilizável pelo navigator.share.
export async function generatePdfFile(element: HTMLElement, fileName: string): Promise<File> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF({
    orientation: canvas.width >= canvas.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [canvas.width, canvas.height],
  });

  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);

  const blob = pdf.output('blob');
  return new File([blob], fileName, { type: 'application/pdf' });
}

// Compartilha o arquivo pelo menu nativo do sistema (inclui WhatsApp, e-mail, etc.) quando
// disponível; senão, baixa o PDF direto — sempre dá pra fazer alguma coisa com o resultado.
export async function sharePdfFile(file: File, title: string, text: string) {
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title, text });
    return;
  }

  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
