const tableBody = document.getElementById("documents-body");
const errorMessage = document.getElementById("error-message");
const statusMessage = document.getElementById("status-message");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const resetButton = document.getElementById("reset-button");

function renderRows(documents) {
	tableBody.innerHTML = "";

	documents.forEach((item, index) => {
		const row = document.createElement("tr");
		row.style.animationDelay = `${index * 45}ms`;

		const idCell = document.createElement("td");
		idCell.textContent = item.id;

		const documentCell = document.createElement("td");
		documentCell.textContent = item.document;

			const distanceCell = document.createElement("td");
			if (typeof item.distance === "number") {
				distanceCell.textContent = item.distance.toFixed(4);
			} else {
				distanceCell.textContent = "-";
			}

		row.appendChild(idCell);
		row.appendChild(documentCell);
			row.appendChild(distanceCell);
		tableBody.appendChild(row);
	});
}

async function loadDocuments() {
	errorMessage.hidden = true;
	statusMessage.textContent = "Loading documents...";

	try {
		const response = await fetch("/documents");
		if (!response.ok) {
			throw new Error("Failed to fetch documents");
		}

		const documents = await response.json();
		renderRows(documents);
		statusMessage.textContent = `Showing ${documents.length} documents`;
	} catch (error) {
		statusMessage.textContent = "Could not load the archive.";
		errorMessage.hidden = false;
	}
}

async function searchDocuments(query) {
	errorMessage.hidden = true;
	statusMessage.textContent = `Searching for "${query}"...`;

	try {
		const response = await fetch(`/search?query=${encodeURIComponent(query)}`);
		if (!response.ok) {
			throw new Error("Failed to search documents");
		}

		const documents = await response.json();
		renderRows(documents);

		if (documents.length === 0) {
			statusMessage.textContent = `No results for "${query}"`;
			return;
		}

		statusMessage.textContent = `Found ${documents.length} result(s) for "${query}"`;
	} catch (error) {
		statusMessage.textContent = "Search failed. Try again.";
		errorMessage.hidden = false;
	}
}

searchForm.addEventListener("submit", async (event) => {
	event.preventDefault();
	const query = searchInput.value.trim();

	if (!query) {
		loadDocuments();
		return;
	}

	await searchDocuments(query);
});

resetButton.addEventListener("click", () => {
	searchInput.value = "";
	loadDocuments();
});

loadDocuments();
