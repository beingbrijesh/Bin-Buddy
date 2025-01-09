<script src="https://unpkg.com/html5-qrcode/minified/html5-qrcode.min.js"></script>
<script>
    document.addEventListener("DOMContentLoaded", function () {
        const qrScannerModal = document.getElementById("qr-scanner-modal");
        const qrReader = new Html5Qrcode("qr-reader");

        // Trigger the scanner modal
        document.getElementById("qr-scan-trigger").addEventListener("click", function (e) {
            e.preventDefault();
            qrScannerModal.style.display = "flex";

            // Start QR scanner
            qrReader.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText, decodedResult) => {
                    // Handle the scanned result
                    document.getElementById("qr-result").innerText = `Scanned QR Code: ${decodedText}`;
                    qrReader.stop();
                    qrScannerModal.style.display = "none";
                },
                (errorMessage) => {
                    console.warn(`Error: ${errorMessage}`);
                }
            );
        });

        // Close the scanner modal
        document.getElementById("qr-close-btn").addEventListener("click", function () {
            qrReader.stop(); // Stop the scanner
            qrScannerModal.style.display = "none";
        });
    });
</script>
