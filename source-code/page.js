console.log("Page script loaded!");

// This is not used, for certain browser, can`t directly access web functions, so we need to inject a script to the page to access them
window.testExtension = function () {
    console.log("Testing!");

    editSaveClick();
};