window.jsPDF = window.jspdf.jsPDF;

document.getElementById('convertBtn').addEventListener('click', convertToPDF);

function convertToPDF() {
  const imageInput = document.getElementById('imageInput');
  const pageSpread = document.getElementById('pageSpread').checked;
  const borderSize = parseInt(document.getElementById('borderSize').value);
  const pageOrientation = document.getElementById('pageOrientation').value;

  if (imageInput.files.length === 0) {
    alert('Please upload at least one image.');
    return;
  }

  const images = Array.from(imageInput.files);
  const pdf = new jsPDF({
    orientation: pageOrientation,
    unit: 'mm',
    format: 'a4'
  });

  let promises = images.map((image) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = function (event) {
        const img = new Image();
        img.src = event.target.result;

        img.onload = function () {
          const imgWidth = img.width;
          const imgHeight = img.height;
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();

          let widthRatio = pageWidth / imgWidth;
          let heightRatio = pageHeight / imgHeight;
          let ratio = Math.min(widthRatio, heightRatio);

          let finalWidth = imgWidth * ratio - borderSize * 2;
          let finalHeight = imgHeight * ratio - borderSize * 2;

          pdf.addImage(img, 'JPEG', borderSize, borderSize, finalWidth, finalHeight);

          if (pageSpread) {
            pdf.addPage();
          }
          resolve();
        };
      };
      reader.readAsDataURL(image);
    });
  });

  Promise.all(promises).then(() => {
    const downloadLink = document.getElementById('downloadLink');
    downloadLink.href = pdf.output('bloburl');
    downloadLink.download = 'converted.pdf';
    downloadLink.style.display = 'block';
  });
}