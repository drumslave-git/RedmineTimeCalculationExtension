const observer = new MutationObserver(mutations => {
    if(mutations.find(mutation => mutation.target.id === 'report')){
        magic();
    }
});
observer.observe(document, { childList: true, subtree: true });
magic();

function magic(){
    let loggedHours = 0;
    let totalHoursEl = null;
    try{
        totalHoursEl = document.querySelector('#time_entries_report > .total-hours');
        loggedHours = Number(totalHoursEl.querySelector(':scope > p').innerText.match(/\d+\.?\d*/)[0])
    }catch (e){
        loggedHours = 0;
        totalHoursEl = null;
    }

    if(!totalHoursEl){
        return;
    }

    const existing = document.getElementById('time-calculation');
    if(existing){
        existing.remove();
    }
    const thing = document.createElement('div')
    thing.id = 'time-calculation';
    const upwork = document.createElement('a');
    upwork.href = 'https://www.upwork.com/ab/workdiary/freelancer';
    upwork.target = '_blank';
    const upworkLogo = document.createElement('img');
    upworkLogo.src = chrome.runtime.getURL("images/upwork.png");
    upwork.append(upworkLogo);
    thing.append(upwork);
    const input = document.createElement('input');
    thing.append(input);
    const left = document.createElement('span');
    left.id = 'time-calculation-left';
    thing.append(left);
    totalHoursEl.append(thing);

    input.addEventListener('keyup', function (e){
        calculate(e, loggedHours);
    });

    left.addEventListener('click', copy);

    chrome.storage.local.get(['time-calculation-worked'], function (result){
        input.value = result['time-calculation-worked'] || '8h00min';
        calculate({target: input}, loggedHours);
    })
}

function calculate(e, loggedHours){
    const value = e.target.value;
    chrome.storage.local.set({'time-calculation-worked': value});
    let h = value.match(/^\d+/);
    h = h? Number(h[0]) : 0;
    let m = value.match(/h.*?([1-9]+?\d?)/);
    m = m? Number(m[1]) : 0;
    const ms = h * 60 * 60 * 1000 + m * 60 * 1000;
    const loggedMS = Math.floor(loggedHours) * 60 * 60 * 1000 + (Math.floor(loggedHours * 60) % 60) * 60 * 1000
    document.getElementById('time-calculation-left').innerText = msToTime(ms - loggedMS);
}

//https://stackoverflow.com/a/19700358
function msToTime(duration) {
    const sign = Math.sign(duration);
    let minutes = Math.abs(Math.floor((duration / (1000 * 60)) % 60)),
        hours = Math.abs(Math.floor((duration / (1000 * 60 * 60))));
    minutes = (minutes < 10) ? "0" + minutes : minutes;

    return sign * hours + "h" + minutes + "min";
}

function copy() {
    selectText('time-calculation-left')
    document.execCommand("copy");
    window.getSelection().removeAllRanges();
    showSnackbar(`${document.getElementById('time-calculation-left').innerText} copied to clipboard`);
}

//https://stackoverflow.com/a/1173319
function selectText(containerId) {
    const range = document.createRange();
    range.selectNode(document.getElementById(containerId));
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
}

//SNACKBAR https://www.w3schools.com/howto/howto_js_snackbar.asp
function showSnackbar(msg) {
    const existing = document.getElementById('snackbar');
    if(existing){
        existing.remove();
    }
    const snackbar = document.createElement('div');
    snackbar.id = 'snackbar'
    snackbar.innerText = msg;
    document.body.append(snackbar);
    snackbar.className = "show";

    setTimeout(function(){
        snackbar.className = snackbar.className.replace("show", "hide");
        setTimeout(function (){
            snackbar.remove();
        }, 1000)
    }, 3000);
}
//!SNACKBAR