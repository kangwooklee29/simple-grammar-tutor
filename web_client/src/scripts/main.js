import {whisper_api, messages, language_dict, textContents, user_lang, urlParams} from './common.js';

let mediaRecorder = null, chunks = [];
let recordTimer = null, timerTime = 0;
let start_recording_indicator = false;
let typingTimer = null;

const translate_text = urlParams.get('translate');
const lang = urlParams.get('lang');

async function start_recording() {
    if (mediaRecorder && mediaRecorder.state === "recording") return;
    document.querySelector("#score").innerHTML = '';
    document.querySelector("#regenerate_result").innerHTML = '';
    document.querySelector("#regenerate_result").style.display = '';
    document.querySelector("#translate_result").innerHTML = '';
    document.querySelector("#description").innerHTML = '';
    document.querySelector("#suggestion").innerHTML = '';
    document.querySelector("div.record_button button").classList.add("pushing");

    start_recording_indicator = new Date().getTime();
    document.querySelector("div.api_status").innerHTML = `${textContents[user_lang]["waiting"]}...`;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    timerTime = Date.now();
    recordTimer = setInterval(() => {
        document.querySelector("div.api_status").innerHTML = `${textContents[user_lang]["recording"]}... ${new Date(Date.now() - timerTime).toISOString().substr(14, 5)}`;
    }, 1000);

    mediaRecorder = new MediaRecorder(stream, {type: 'audio/webm'});
    mediaRecorder.ondataavailable = e => chunks.push(e.data);

    mediaRecorder.onstop = async () => {
        var blob = new Blob(chunks, { 'type' : 'audio/webm' });
        var file = new File([blob], "audio.webm", { type: "audio/webm;" });
        chunks = [];
        mediaRecorder = null;
        stream.getTracks().forEach(track => track.stop());
        clearInterval(recordTimer);
        document.querySelector("div.api_status").innerHTML = `${textContents[user_lang]["waiting"]}...`;
        document.querySelector("#regenerate_result").innerHTML = '';
        document.querySelector("#regenerate_result").style.display = '';
        document.querySelector("#translate_result").innerHTML = '';
        document.querySelector("#description").innerHTML = '';
        document.querySelector("#suggestion").innerHTML = '';
        document.querySelector("#score").innerHTML = '';
        var result = await whisper_api(file);
        if (result.text) {
            document.querySelector("div.record_script").innerHTML = result.text;
            messages.send_chatgpt(result.text);
        }
        else
            document.querySelector("div.api_status").innerHTML = `${textContents[user_lang]["no_message"]}`;
    };

    mediaRecorder.onstart = () => {
        start_recording_indicator = false;
    };
    mediaRecorder.start();
}

document.querySelector("div.record_button > button").addEventListener("touchstart", () => start_recording());

document.body.addEventListener("touchend", () => {
    let registerRecordingStopper = setInterval(() => {
        if (!mediaRecorder || start_recording_indicator) {
            if (new Date().getTime() - start_recording_indicator > 8000)
                clearInterval(registerRecordingStopper);
            return;
        }
        document.querySelector("div.record_button button").classList.remove("pushing");
        mediaRecorder.stop();
        clearInterval(registerRecordingStopper);
    }, 200);
});

document.querySelector("div.record_button > button").addEventListener("mousedown", e => {
    if (e.button === 0)
        start_recording();
});

document.body.addEventListener("mouseup", () => {
    let registerRecordingStopper = setInterval(() => {
        if (!mediaRecorder || start_recording_indicator) {
            if (new Date().getTime() - start_recording_indicator > 8000)
                clearInterval(registerRecordingStopper);
            return;
        }
        document.querySelector("div.record_button button").classList.remove("pushing");
        mediaRecorder.stop();
        clearInterval(registerRecordingStopper);
    }, 200);
});

document.querySelector("div.record_script").addEventListener("focus", e => {
    e.target.querySelectorAll("ins").forEach(elem => {
        elem.innerHTML = "";
    })
    e.target.innerHTML = e.target.innerText;
});

document.querySelector("div.record_script").addEventListener("input", e => {
    clearTimeout(typingTimer);
    typingTimer = setTimeout( () => {
        messages.send_chatgpt(e.target.innerText);
    }, 3000);
});

document.querySelector("div.record_script").addEventListener('paste', e => {
    e.preventDefault();
    var text = (e.originalEvent || e).clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
});

document.querySelector("div.record_upper_buttons > button").addEventListener("click", e => {
    e.target.classList.toggle("pushing");
    var is_translate_mode = localStorage.getItem("is_translate_mode");
    is_translate_mode = !is_translate_mode || !JSON.parse(is_translate_mode)
    localStorage.setItem("is_translate_mode", is_translate_mode);
    document.querySelector("div.answer_wrapper").style.display = is_translate_mode ? 'none' : '';
    if (is_translate_mode)
        document.querySelector("div.record_script").innerHTML = '';
});

document.querySelector("div.title button").addEventListener("click", () => {
    document.querySelector("#options").style.display = 'block';
});

document.querySelector("#options").addEventListener("click", e => {
    if (e.target === document.querySelector("div.API_KEY button"))
        localStorage.setItem("API_KEY", document.querySelector("#api_key").value);

    if (e.target.classList.contains("options-close")) {
        if (localStorage.getItem("API_KEY") || !window.location.href.includes("github"))
            document.querySelector("#options").style.display = 'none';
    }
});

document.querySelector("#source_language").addEventListener("change", e => localStorage.setItem("source_language_grammar", e.target.value));

document.addEventListener("DOMContentLoaded", () => {
    const source_lang_element = document.getElementById('source_language');

    for (const [key, value] of Object.entries(language_dict)) {
        const source_option = document.createElement('option');

        source_option.value = key;
        source_option.text = `${value.Native} (${value.English})`;

        source_lang_element.appendChild(source_option);
    }

    const source_language = localStorage.getItem("source_language_grammar");

    document.querySelector("#source_language").value = source_language ? source_language : "en";

    const API_KEY = localStorage.getItem("API_KEY");
    if (API_KEY)
        document.querySelector("div.API_KEY input").value = API_KEY;
    else if (window.location.href.includes("github"))
        document.querySelector("#options").style.display = 'block';

    document.querySelectorAll('[data-i18n]').forEach(element => {
        element.textContent = textContents[user_lang][element.getAttribute('data-i18n')];
    });

    var is_translate_mode = localStorage.getItem("is_translate_mode");
    if (is_translate_mode && JSON.parse(is_translate_mode))
        localStorage.setItem("is_translate_mode", "false");

    if (lang)
        document.querySelector("#source_language").value = lang;
    if (translate_text) {
        document.querySelector("div.record_script").innerHTML = translate_text;
        localStorage.setItem("is_translate_mode", "false");
        document.querySelector("div.record_upper_buttons > button").click();
        messages.send_chatgpt(translate_text);
    }
});
