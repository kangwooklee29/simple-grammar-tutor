import {Messages} from "./messages.js";
import {AnswerStream} from "./answer_stream.js";

export {whisper_api, chatgpt_api, answer_stream, messages, language_dict, textContents, user_lang, urlParams};

var answer_stream = new AnswerStream();
var messages = new Messages();

const user_lang = navigator.language || navigator.userLanguage;
const urlParams = new URLSearchParams(new URL(window.location.href).search);

const textContents = {
    "en": {"auto": "Auto", "save": "Save", "regenerate": "Regenerate", "api_key": "OpenAI API key", "generating": "Generating", "recording": "Recording", "waiting": "Waiting for response", "timeout": "Timeout! Retrying...", "no_message": "No messages. Check mic setup.", "language_to_learn": "Language to learn", "get_example_translation": "Get Example Translation", "another_suggested_expression": "Another Suggestion", "logout": "Logout", "click": "Click"},
    "ko": {"auto": "자동", "save": "저장", "regenerate": "결과 재생성", "api_key": "OpenAI API 키", "generating": "결과 생성 중", "recording": "녹음 중", "waiting": "응답 대기 중", "timeout": "응답이 없습니다. 재시도 중입니다...", "no_message": "녹음되지 않았습니다. 마이크를 확인하세요.", "language_to_learn": "학습할 언어", "get_example_translation": "예제 번역 생성하기", "another_suggested_expression": "추가 제안", "logout": "로그아웃", "click": "클릭"},
};

const language_dict = {
    "sq": {"English": "Albanian", "Native": "Shqip", "bcp-47": "sq-AL"},
    "ar": {"English": "Arabic", "Native": "العربية", "bcp-47": "ar-EG"},
    "hy": {"English": "Armenian", "Native": "Հայերեն", "bcp-47": "hy-AM"},
    "eu": {"English": "Basque", "Native": "Euskara", "bcp-47": "eu-ES"},
    "bn": {"English": "Bengali", "Native": "বাংলা", "bcp-47": "bn-IN"},
    "bg": {"English": "Bulgarian", "Native": "български", "bcp-47": "bg-BG"},
    "ca": {"English": "Catalan", "Native": "Català", "bcp-47": "ca-ES"},
    "zh": {"English": "Chinese (Mandarin)", "Native": "普通话", "bcp-47": "zh-CN"},
    "hr": {"English": "Croatian", "Native": "Hrvatski", "bcp-47": "hr-HR"},
    "cs": {"English": "Czech", "Native": "Čeština", "bcp-47": "cs-CZ"},
    "en": {"English": "English", "Native": "English", "bcp-47": "en-GB"},
    "et": {"English": "Estonian", "Native": "Eesti", "bcp-47": "et-EE"},
    "fi": {"English": "Finnish", "Native": "Suomi", "bcp-47": "fi-FI"},
    "fr": {"English": "French", "Native": "Français", "bcp-47": "fr-FR"},
    "ka": {"English": "Georgian", "Native": "ქართული", "bcp-47": "ka-GE"},
    "de": {"English": "German", "Native": "Deutsch", "bcp-47": "de-DE"},
    "el": {"English": "Greek", "Native": "Ελληνικά", "bcp-47": "el-GR"},
    "gu": {"English": "Gujarati", "Native": "ગુજરાતી", "bcp-47": "gu-IN"},
    "hi": {"English": "Hindi", "Native": "हिन्दी", "bcp-47": "hi-IN"},
    "hu": {"English": "Hungarian", "Native": "Magyar", "bcp-47": "hu-HU"},
    "id": {"English": "Indonesian", "Native": "Bahasa Indonesia", "bcp-47": "id-ID"},
    "ga": {"English": "Irish", "Native": "Gaeilge", "bcp-47": "ga-IE"},
    "it": {"English": "Italian", "Native": "Italiano", "bcp-47": "it-IT"},
    "ja": {"English": "Japanese", "Native": "日本語", "bcp-47": "ja-JP"},
    "jv": {"English": "Javanese", "Native": "Basa Jawa", "bcp-47": "jv-ID"},
    "ko": {"English": "Korean", "Native": "한국어", "bcp-47": "ko-KR"},
    "lv": {"English": "Latvian", "Native": "Latviešu", "bcp-47": "lv-LV"},
    "lt": {"English": "Lithuanian", "Native": "Lietuvių", "bcp-47": "lt-LT"},
    "mk": {"English": "Macedonian", "Native": "Македонски", "bcp-47": "mk-MK"},
    "ms": {"English": "Malay", "Native": "Bahasa Melayu", "bcp-47": "ms-MY"},
    "mt": {"English": "Maltese", "Native": "Malti", "bcp-47": "mt-MT"},
    "mr": {"English": "Marathi", "Native": "मराठी", "bcp-47": "mr-IN"},
    "mn": {"English": "Mongolian", "Native": "Монгол", "bcp-47": "mn-MN"},
    "ne": {"English": "Nepali", "Native": "नेपाली", "bcp-47": "ne-NP"},
    "no": {"English": "Norwegian", "Native": "Norsk", "bcp-47": "no-NO"},
    "fa": {"English": "Persian", "Native": "فارسی", "bcp-47": "fa-IR"},
    "pl": {"English": "Polish", "Native": "Polski", "bcp-47": "pl-PL"},
    "pt": {"English": "Portuguese", "Native": "Português", "bcp-47": "pt-PT"},
    "pa": {"English": "Punjabi", "Native": "ਪੰਜਾਬੀ", "bcp-47": "pa-IN"},
    "ro": {"English": "Romanian", "Native": "Română", "bcp-47": "ro-RO"},
    "ru": {"English": "Russian", "Native": "Русский", "bcp-47": "ru-RU"},
    "sr": {"English": "Serbian", "Native": "Српски", "bcp-47": "sr-RS"},
    "sk": {"English": "Slovak", "Native": "Slovenčina", "bcp-47": "sk-SK"},
    "sl": {"English": "Slovenian", "Native": "Slovenščina", "bcp-47": "sl-SI"},
    "es": {"English": "Spanish", "Native": "Español", "bcp-47": "es-ES"},
    "sw": {"English": "Swahili", "Native": "Kiswahili", "bcp-47": "sw-KE"},
    "sv": {"English": "Swedish", "Native": "Svenska", "bcp-47": "sv-SE"},
    "ta": {"English": "Tamil", "Native": "தமிழ்", "bcp-47": "ta-IN"},
    "tt": {"English": "Tatar", "Native": "татар теле", "bcp-47": "tt-RU"},
    "te": {"English": "Telugu", "Native": "తెలుగు", "bcp-47": "te-IN"},
    "th": {"English": "Thai", "Native": "ไทย", "bcp-47": "th-TH"},
    "tr": {"English": "Turkish", "Native": "Türkçe", "bcp-47": "tr-TR"},
    "uk": {"English": "Ukrainian", "Native": "Українська", "bcp-47": "uk-UA"},
    "ur": {"English": "Urdu", "Native": "اردو", "bcp-47": "ur-PK"},
    "uz": {"English": "Uzbek", "Native": "O‘zbek", "bcp-47": "uz-UZ"},
    "vi": {"English": "Vietnamese", "Native": "Tiếng Việt", "bcp-47": "vi-VN"},
    "cy": {"English": "Welsh", "Native": "Cymraeg", "bcp-47": "cy-GB"}
};

async function whisper_api(file) {
    let api_url = "https://api.openai.com/v1/audio/transcriptions";
    let api_key = localStorage.getItem("API_KEY");

    if (!api_key)
        api_url = "/api/audio";

    var formData = new FormData();
    formData.append('model', 'whisper-1');
    formData.append('file', file);
    var is_translate_mode = localStorage.getItem("is_translate_mode");
    is_translate_mode = is_translate_mode && JSON.parse(is_translate_mode);
    if (document.querySelector("#source_language").value !== "auto" && !is_translate_mode)
        formData.append('language', document.querySelector("#source_language").value);

    try {
        const response = await fetch(api_url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${api_key}`
            },
            body: formData
        });
        if (response.ok)
            return await response.json();
        else
            throw new Error(response.status);
    } catch (error) {
        document.querySelector("div.api_status").innerHTML = error.message;
    }
    document.querySelector("div.api_status").innerHTML = textContents[user_lang]["timeout"];
    await new Promise(resolve => setTimeout(resolve, 8000));
    return await whisper_api(file);
}

async function chatgpt_api(messages, model) {
    let api_url = "https://api.openai.com/v1/chat/completions";
    let api_key = localStorage.getItem("API_KEY");
    let processed_messages = messages;

    if (!api_key) {
        api_url = "/api/chat";

        console.log(messages);
        var first_ext = messages[1].content.match(/^Text: "(.*?)" \/\//);
        if (first_ext) {
            if (messages[1].content.includes("Translate"))
            processed_messages = [first_ext[1], language_dict[document.querySelector("#source_language").value].English];
            else
            processed_messages = [first_ext[1]];
        }
        else {
            var second_ext = messages[1].content.match(/^{(.*?)} \/\//);
            processed_messages = JSON.parse(`{${second_ext[1]}}`);
        }
    }

    const param = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${api_key}`,
            "type": "json_object"
        },
        body: JSON.stringify({model: model, messages: processed_messages, stream: true})
    };

    var timer = setTimeout(() => {
        document.querySelector("div.api_status").innerHTML = textContents[user_lang]["timeout"];
        chatgpt_api(messages, model);
    }, 8000);

    try {
        const response = await fetch(api_url, param).then(async response => {
            const reader = response.body.getReader();
            let buffer = '';

            return await reader.read().then(async function processResult(result) {
                if (answer_stream.signal) return "";
                buffer += new TextDecoder('utf-8').decode(result.value || new Uint8Array());

                var messages = buffer.split('\n\n')
                buffer = messages.pop();
                if (messages.length === 0) {
                    answer_stream.end();
                    console.log(answer_stream.now_answer);
                    return response;
                }

                for (var message of messages)
                    if (message.includes("data: ") && message.includes("[DONE]") === false) {
                        if (answer_stream.now_streaming === false)
                            clearTimeout(timer);
                        answer_stream.start();
                        const val = JSON.parse(message.replace("data: ", ""));
                        if (val.choices[0].delta.content)
                            await answer_stream.add_answer(val.choices[0].delta.content);
                    }

                return await reader.read().then(processResult);
            });
        })
        console.log(response);
        if (response.ok)
            clearTimeout(timer);
        else
            throw new Error(response.status);
    } catch(error) {
        document.querySelector("div.api_status").innerHTML = error.message;
    }
}
