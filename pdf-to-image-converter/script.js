// script.js
document.getElementById('convert-btn').addEventListener('click', convertPDFtoImage);

async function convertPDFtoImage() {
  const pdfInput = document.getElementById('pdf-input');
  const imageContainer = document.getElementById('image-container');
  const convertBtn = document.getElementById('convert-btn');
  const pageSpread = document.getElementById('page-spread').checked;
  const borderSize = parseInt(document.getElementById('border-size').value);
  const imageFormat = document.getElementById('image-format').value;

  if (!pdfInput.files[0]) {
    alert('Please upload a PDF file.');
    return;
  }

  const pdfFile = pdfInput.files[0];
  const pdfData = await pdfFile.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

  imageContainer.innerHTML = ''; // Clear previous images

  const zip = new JSZip(); // Create a new ZIP file
  const imageFolder = zip.folder("converted_images"); // Create a folder for images

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport: viewport }).promise;

    // Add border if specified
    if (borderSize > 0) {
      const tempCanvas = document.createElement('canvas');
      const tempContext = tempCanvas.getContext('2d');
      tempCanvas.width = canvas.width + borderSize * 2;
      tempCanvas.height = canvas.height + borderSize * 2;
      tempContext.fillStyle = 'white';
      tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      tempContext.drawImage(canvas, borderSize, borderSize);
      canvas.width = tempCanvas.width;
      canvas.height = tempCanvas.height;
      context.drawImage(tempCanvas, 0, 0);
    }

    // Convert canvas to image
    const imageData = canvas.toDataURL(`image/${imageFormat}`);
    const image = new Image();
    image.src = imageData;

    // Add image to the container
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'image-wrapper';
    imageWrapper.appendChild(image);
    imageContainer.appendChild(imageWrapper);

    // Add image to the ZIP file
    const base64Data = imageData.split(',')[1]; // Extract base64 data
    imageFolder.file(`page-${i}.${imageFormat}`, base64Data, { base64: true });
  }

  // Replace the "Convert to Image" button with the "Download All Images as ZIP" button
  const downloadBtn = document.createElement('button');
  downloadBtn.innerText = 'Download All Images as ZIP';
  downloadBtn.className = 'download-btn';
  downloadBtn.addEventListener('click', () => {
    zip.generateAsync({ type: "blob" }).then((content) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = 'converted_images.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  });

  // Replace the button
  convertBtn.replaceWith(downloadBtn);
}