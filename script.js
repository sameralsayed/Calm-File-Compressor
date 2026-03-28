// Simple, calm file compressor using pako (Gzip) and jQuery

$(function () {
  const $fileInput = $("#fileInput");
  const $compressBtn = $("#compressBtn");
  const $statusArea = $("#statusArea");
  const $resultArea = $("#resultArea");
  const $originalSize = $("#originalSize");
  const $compressedSize = $("#compressedSize");
  const $compressionRatio = $("#compressionRatio");
  const $downloadLink = $("#downloadLink");

  let originalFile = null;
  let compressedBlob = null;

  // Enable button when a file is selected
  $fileInput.on("change", function () {
    const files = this.files;
    if (files && files.length > 0) {
      originalFile = files[0];
      $compressBtn.prop("disabled", false);
      $statusArea.text(`Selected: ${originalFile.name} (${formatBytes(originalFile.size)})`);
      $resultArea.addClass("d-none");
    } else {
      originalFile = null;
      $compressBtn.prop("disabled", true);
      $statusArea.text("No file selected yet.");
      $resultArea.addClass("d-none");
    }
  });

  // Compress file on click
  $compressBtn.on("click", function () {
    if (!originalFile) return;

    $compressBtn.prop("disabled", true).text("Compressing...");
    $statusArea.text("Compressing file in your browser. Please wait...");

    const reader = new FileReader();

    reader.onload = function (e) {
      try {
        const arrayBuffer = e.target.result;
        const uint8Array = new Uint8Array(arrayBuffer);

        // Compress using pako (Gzip)
        const compressed = window.pako.gzip(uint8Array);

        compressedBlob = new Blob([compressed], { type: "application/gzip" });

        const originalSizeBytes = originalFile.size;
        const compressedSizeBytes = compressedBlob.size;
        const ratio = compressedSizeBytes / originalSizeBytes;

        // Update UI
        $originalSize.text(formatBytes(originalSizeBytes));
        $compressedSize.text(formatBytes(compressedSizeBytes));
        $compressionRatio.text(`${(ratio * 100).toFixed(1)}% of original`);

        const downloadName = `${originalFile.name}.gz`;
        const url = URL.createObjectURL(compressedBlob);
        $downloadLink.attr("href", url);
        $downloadLink.attr("download", downloadName);

        $resultArea.removeClass("d-none");
        $statusArea.text("Compression complete. You can now download your compressed file.");
      } catch (err) {
        console.error(err);
        $statusArea.text("An error occurred while compressing the file.");
        $resultArea.addClass("d-none");
      } finally {
        $compressBtn.prop("disabled", false).text("Compress File");
      }
    };

    reader.onerror = function () {
      $statusArea.text("Failed to read the file. Please try again.");
      $compressBtn.prop("disabled", false).text("Compress File");
      $resultArea.addClass("d-none");
    };

    reader.readAsArrayBuffer(originalFile);
  });

  function formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
});
