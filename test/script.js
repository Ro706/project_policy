document.addEventListener("DOMContentLoaded", () => {
    const pdfForm = document.getElementById("pdfForm");
    const pdfFile = document.getElementById("pdfFile");
    const fileName = document.getElementById("fileName");
    const submitButton = pdfForm.querySelector("button");
    const loader = document.getElementById("loader");
    const resultDiv = document.getElementById("result");
    const summaryText = document.getElementById("summaryText");
    const themeSwitcher = document.querySelector(".theme-switcher");

    themeSwitcher.addEventListener("click", () => {
        document.body.classList.toggle("dark-theme");
        themeSwitcher.textContent = document.body.classList.contains("dark-theme") ? "☀️" : "🌙";
    });

    pdfFile.addEventListener("change", () => {
        if (pdfFile.files.length > 0) {
            fileName.textContent = pdfFile.files[0].name;
            submitButton.disabled = false;
        } else {
            fileName.textContent = "";
            submitButton.disabled = true;
        }
    });

    pdfForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!pdfFile.files.length) {
            alert("Please select a PDF file first!");
            return;
        }

        loader.classList.remove("hidden");
        resultDiv.classList.add("hidden");
        summaryText.textContent = "";
        submitButton.disabled = true;

        const formData = new FormData();
        formData.append("data", pdfFile.files[0]);

        try {
            const response = await fetch(
                "https://iu62rqhpva9xlemjm553xgaw.hooks.n8n.cloud/webhook-test/7104db72-dd00-413f-8132-fddf6a0f4bf7",
                {
                    method: "POST",
                    body: formData,
                    mode: "cors",
                    headers: {
                        "Accept": "application/json, text/plain",
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }

            const contentType = response.headers.get("content-type");
            let data;
            if (contentType && contentType.includes("application/json")) {
                const json = await response.json();
                data = json.output || JSON.stringify(json, null, 2);
            } else {
                data = await response.text();
            }

            summaryText.textContent = data.trim();
            resultDiv.classList.remove("hidden");

        } catch (err) {
            alert("Error: " + err.message + "\n\nCould not connect to the summarization service. Please check your connection and try again.");
        } finally {
            loader.classList.add("hidden");
            submitButton.disabled = false;
            pdfFile.value = ""; // Reset file input
            fileName.textContent = "";
        }
    });
});
