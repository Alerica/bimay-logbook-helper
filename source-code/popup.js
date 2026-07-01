async function getCurrentTab() {

    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    return tab;

}

async function loadRows() {
    const tab = await getCurrentTab();
    if (!tab) return;

    chrome.tabs.sendMessage(tab.id, { action: "getRows" }, response => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            const container = document.getElementById("rows");
            container.innerHTML = `<div class="loading"> Couldn't connect to the page. Please make sure you're opening the correct "month" page before opening the extension or check the guide on Github/Alerica/Bimaylogbook</div>`;
            return;
        }

        const container = document.getElementById("rows");
        container.innerHTML = "";

        if (!response || !response.rows || response.rows.length === 0) {
            container.innerHTML = `<div class="loading">No rows found.</div>`;
            return;
        }

        response.rows.forEach(r => {
            const rowDiv = document.createElement("div");
            rowDiv.className = "row";
            
            const statusClass = r.button ? r.button.toLowerCase() : "";

            rowDiv.innerHTML = `
                <input class="rowCheck" type="checkbox" value="${r.index}">
                <span>${r.date || "Unknown Date"}</span>
                <span class="status ${statusClass}">${r.button || "None"}</span>
            `;
            container.appendChild(rowDiv);
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {

    loadRows();

});

document.getElementById("run").addEventListener("click", async () => {

    const selected = [];

    document.querySelectorAll(".rowCheck:checked").forEach(cb => {
        selected.push(Number(cb.value));
    });

    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    chrome.tabs.sendMessage(tab.id, {
        action: "runAutomation",

        rows: selected,

        clockIn: document.getElementById("clockIn").value,
        clockOut: document.getElementById("clockOut").value,
        activity: document.getElementById("activity").value,
        description: document.getElementById("description").value
    });

});