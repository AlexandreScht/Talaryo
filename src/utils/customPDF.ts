import { ServerException } from '@/exceptions';
import fs from 'fs';
import path from 'path';
import { PDFDocument, PDFName } from 'pdf-lib';
import zlib from 'zlib';

export default async function signedPDF(data: Buffer): Promise<string> {
  try {
    const pdfDoc = await PDFDocument.load(data);
    const pages = pdfDoc.getPages();

    const imagePath = path.resolve(__dirname, '../assets/Talaryo_Banner.jpg');
    const imageBytes = fs.readFileSync(imagePath);
    const image = await pdfDoc.embedJpg(imageBytes);

    for (const page of pages) {
      const { width, height } = page.getSize();
      const imageHeight = width / 7;
      const newHeight = height + imageHeight;

      page.setSize(width, newHeight);
      page.translateContent(0, imageHeight);

      const imageY = 0 - imageHeight;
      page.drawImage(image, {
        x: 0,
        y: imageY,
        width: width,
        height: imageHeight,
      });

      const linkAnnotation = pdfDoc.context.obj({
        Type: PDFName.of('Annot'),
        Subtype: PDFName.of('Link'),
        Rect: [0, imageY, width, imageHeight],
        A: pdfDoc.context.obj({
          Type: PDFName.of('Action'),
          S: PDFName.of('URI'),
          URI: 'https://talaryo.com',
        }),
      });

      const annotations = page.node.Annots ? page.node.Annots().asArray() : [];
      annotations.push(linkAnnotation);
      page.node.set(PDFName.of('Annots'), pdfDoc.context.obj(annotations));
    }

    const modifiedPdfBytes = await pdfDoc.save();
    const compressedPdfBytes = zlib.gzipSync(Buffer.from(modifiedPdfBytes));

    return compressedPdfBytes.toString('base64');
  } catch (error) {
    console.log('signedPDF', error);
    throw new ServerException();
  }
}
