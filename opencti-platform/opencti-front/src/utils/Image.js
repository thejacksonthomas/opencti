import { jsPDF } from 'jspdf';
import * as htmlToImage from 'html-to-image';
import fileDownload from 'js-file-download';
import ThemeDark from '../components/ThemeDark';

const ignoredClasses = [
  'MuiDrawer-docked',
  'MuiIconButton-root',
  'MuiInputBase-root',
];

export const exportImage = (domElementId, name) => {
  const container = document.getElementById(domElementId);
  htmlToImage
    .toBlob(container, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: ThemeDark.palette.background.default,
      style: { margin: 0 },
      filter: (domNode) => {
        if (domNode.className) {
          for (const ignoredClass of ignoredClasses) {
            if (domNode.className.toString().includes(ignoredClass)) {
              return false;
            }
          }
        }
        return true;
      },
    })
    .then((blob) => {
      fileDownload(blob, `${name}.png`, 'image/png');
    });
};

export const exportPdf = (domElementId, name) => {
  const container = document.getElementById(domElementId);
  htmlToImage
    .toPng(container, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: ThemeDark.palette.background.default,
      style: { margin: 0 },
      filter: (domNode) => {
        if (domNode.className) {
          for (const ignoredClass of ignoredClasses) {
            if (domNode.className.toString().includes(ignoredClass)) {
              return false;
            }
          }
        }
        return true;
      },
    })
    .then((image) => {
      // eslint-disable-next-line new-cap
      let pdf = new jsPDF({ orientation: 'landscape', unit: 'px' });
      const imgProps = pdf.getImageProperties(image);
      if (imgProps.height > imgProps.width) {
        // eslint-disable-next-line new-cap
        pdf = new jsPDF({ orientation: 'portrait', unit: 'px' });
      }
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.setFillColor(ThemeDark.palette.background.default);
      pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
      const width = (imgProps.width * pdfHeight) / imgProps.height;
      const height = (imgProps.height * pdfWidth) / imgProps.width;
      if (height <= pdfHeight) {
        const marginX = (pdfWidth - pdfWidth) / 2;
        const marginY = (pdfHeight - height) / 2;
        pdf.addImage(image, 'PNG', marginX, marginY, pdfWidth, height);
      } else {
        const marginX = (pdfWidth - width) / 2;
        const marginY = (pdfHeight - pdfHeight) / 2;
        pdf.addImage(image, 'PNG', marginX, marginY, width, pdfHeight);
      }
      pdf.save(`${name}.pdf`);
    });
};
