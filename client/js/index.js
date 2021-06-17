// Clear all cookies upon the loading of the page
function clearAllCookies() {
    $.cookie('AccToken', '');
    $.cookie('APIVer', '');
    $.cookie('InstURL', '');
    $.cookie('idURL', '');
    $.cookie('LoggeduserId', '');
}


function onload() {
    clearAllCookies();
}

window.onload = onload;
