import * as pdfToPngModule from 'pdf-to-png-converter';

export default function pdfToPngMocked() {
  return jest.spyOn(pdfToPngModule, 'pdfToPng').mockResolvedValue([{ content: 'Buffer' } as any]);
}
