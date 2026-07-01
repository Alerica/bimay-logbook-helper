const script = document.createElement("script");

script.src = chrome.runtime.getURL("page.js");

document.documentElement.appendChild(script);

script.onload = () => script.remove();

console.log("Content script loaded");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.action === "getRows") {

        sendResponse({
            rows: getRows()
        });

    }

    if (message.action === "runAutomation") {

        console.log("Automation Started");

        runAutomation(message);

    }

});

function getRows() {

    const result = [];

    const rows = document.querySelectorAll("#logBookTable tbody tr");

    rows.forEach((row, index) => {

        const btn = row.querySelector(".detailsbtn");

        if (!btn)
            return;

        result.push({

            index,

            date: row.cells[0].innerText.trim(),

            button: btn.innerText.trim()

        });

    });

    return result;

}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function runAutomation(data) {

    console.log("Automation Started");

    if (data.rows.length === 0)
        return;

    for (const index of data.rows) {

        const rows = document.querySelectorAll("#logBookTable tbody tr");
        const row = rows[index];
        const btn = row.querySelector(".detailsbtn");

        btn.click();

        await sleep(1000);

        setValue("editClockIn", data.clockIn);
        setValue("editClockOut", data.clockOut);
        setValue("editActivity", data.activity);
        setValue("editDescription", data.description);

        const submitBtns = document.querySelectorAll(
            "#logBookEditPopup a-encoded.button.button-primary"
        );

        if (submitBtns.length > 1) {
            submitBtns[1].click(); 
        } else {
            console.error("Second submit button not found");
        }

        await waitPopupClosed();

        await sleep(1000);

    }
}

async function waitPopupClosed() {

    while (true) {

        const popup = document.querySelector("#editActivity");

        if (!popup || popup.offsetParent === null)
            return;

        await sleep(200);
    }

}

function setValue(id, value) {
    const el = document.getElementById(id);

    if (!el) {
        console.error(id + " not found");
        return;
    }

    el.value = value;

    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
}