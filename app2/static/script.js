const form = document.getElementById("chunk-form");
const textInput = document.getElementById("text-input");
const chunkSizeInput = document.getElementById("chunk-size");
const chunkOverlapInput = document.getElementById("chunk-overlap");
const submitButton = document.getElementById("submit-button");
const statusMessage = document.getElementById("status-message");
const errorMessage = document.getElementById("error-message");
const resultSummary = document.getElementById("result-summary");
const chunksBody = document.getElementById("chunks-body");

function renderEmptyState(message) {
    chunksBody.innerHTML = `
        <tr>
            <td colspan="3" class="empty">${message}</td>
        </tr>
    `;
}

function renderChunks(chunks) {
    if (!chunks || chunks.length === 0) {
        renderEmptyState("No chunks were produced.");
        return;
    }

    chunksBody.innerHTML = "";

    chunks.forEach((chunk, idx) => {
        const row = document.createElement("tr");
        row.style.animationDelay = `${idx * 50}ms`;

        const indexCell = document.createElement("td");
        indexCell.textContent = String(chunk.index ?? idx + 1);

        const textCell = document.createElement("td");
        textCell.textContent = chunk.text ?? chunk.chunk ?? "";

        const lengthCell = document.createElement("td");
        lengthCell.textContent = String(chunk.length);

        row.appendChild(indexCell);
        row.appendChild(textCell);
        row.appendChild(lengthCell);
        chunksBody.appendChild(row);
    });
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorMessage.hidden = true;

    const text = textInput.value.trim();
    const chunk_size = Number(chunkSizeInput.value);
    const chunk_overlap = Number(chunkOverlapInput.value);

    if (!text) {
        errorMessage.textContent = "Please enter text before submitting.";
        errorMessage.hidden = false;
        return;
    }

    if (chunk_size <= 0) {
        errorMessage.textContent = "Chunk size must be greater than 0.";
        errorMessage.hidden = false;
        return;
    }

    if (chunk_overlap < 0 || chunk_overlap >= chunk_size) {
        errorMessage.textContent = "Chunk overlap must be between 0 and chunk size - 1.";
        errorMessage.hidden = false;
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Processing...";
    statusMessage.textContent = "Creating chunks...";

    try {
        const response = await fetch("/chunk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ text, chunk_size, chunk_overlap }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Chunking request failed.");
        }

        // Accept both response formats:
        // 1) { chunks: [...], total_chunks: n }
        // 2) [ { chunk/text: "...", length: n }, ... ]
        const chunks = Array.isArray(data) ? data : data.chunks;
        const totalChunks = Array.isArray(data)
            ? data.length
            : (data.total_chunks ?? (Array.isArray(data.chunks) ? data.chunks.length : 0));

        renderChunks(chunks);
        resultSummary.textContent = `Total chunks: ${totalChunks}`;
        statusMessage.textContent = "Chunking complete.";
    } catch (error) {
        renderEmptyState("Unable to produce chunks.");
        resultSummary.textContent = "No chunks yet.";
        statusMessage.textContent = "Request failed.";
        errorMessage.textContent = error.message;
        errorMessage.hidden = false;
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Create Chunks";
    }
});
