import { chatgpt_api, language_dict, textContents, user_lang } from "./common.js";
import { diff_match_patch } from "./diff_match_patch.js";

export class Messages{
    constructor() {
    }

    compare_prev_result(source_elem, target_elem, source_text, target_text) {
        var dmp = new diff_match_patch();
        var d = dmp.diff_main(source_text, target_text);
        dmp.diff_cleanupEfficiency(d);

        const result = dmp.diff_prettyHtml(d);

        source_elem.innerHTML = result;
        source_elem.querySelectorAll("ins").forEach(elem => {
            elem.innerHTML = "&nbsp;";
        })

        target_elem.innerHTML = `Result: <b>"${result}"</b>`;
        target_elem.querySelectorAll("del").forEach(elem => {
            elem.innerHTML = "";
        });
    }

    disable_elements() {
        document.querySelector("div.api_status").innerHTML = `${textContents[user_lang]["waiting"]}...`;
        document.querySelector("div.record_script").contenteditable = true;
        document.querySelector("div.record_button button").disabled = true;
    }

    async send_chatgpt(content, is_translate=false) {
        let prompt = [{role: "user", content: ""}];
        document.querySelector("#score").innerHTML = '';
        document.querySelector("#regenerate_result").innerHTML = '';
        document.querySelector("#description").innerHTML = '';

        if (is_translate) {
            prompt.push({role: "user", content: `Text: "${content}" // Translate this text into ${language_dict[document.querySelector("#source_language").value].English} and write the result to a JSON message which has a single attribute named 'translated_result'.`});
            this.disable_elements();
            await chatgpt_api(prompt, "gpt-3.5-turbo-1106");
            return;
        }

        prompt.push({role: "user", content: `Text: "${content}" // Write a JSON message. First, rate how natural and correct the above text sounds on a scale from 1 to 5, and add the score to the 'score' attribute. Second, polish the text to make it sound natural and correct and add the result to the 'result' attribute only when it is too awkward to understand. Add the original text to the 'result' attribute otherwise.`});
        this.disable_elements();
        await chatgpt_api(prompt, "gpt-4-1106-preview");
        const polished_result = document.querySelector("#regenerate_result > span").innerText.replaceAll(`"`, ``);
        this.compare_prev_result(document.querySelector("div.record_script"), document.querySelector("#regenerate_result"), document.querySelector("div.record_script").innerText, polished_result);

        prompt = [{role: "user", content: ""}];
        prompt.push({role: "user", content: `{"original_text": "${content}", "polished_result": "${polished_result}"} // This JSON message shows the input to a polishing bot and its polished output. Write a JSON message that includes a single attribute named 'description', which explains the changes made, as if written by the bot.`});
        this.disable_elements();
        await chatgpt_api(prompt, "gpt-3.5-turbo-1106");
    }
}
