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
            elem.innerHTML = /^[!.,;:?(){}[\]"'`~@#$%^&*+=<>-_\\/|]+$/g.test(elem.innerText) ? "" : "&nbsp;";
        });

        target_elem.innerHTML = `<b>"${result}"</b>`;
        target_elem.querySelectorAll("del").forEach(elem => {
            elem.innerHTML = "";
        });
    }

    disable_elements() {
        document.querySelector("div.api_status").innerHTML = `${textContents[user_lang]["waiting"]}...`;
        document.querySelector("div.record_script").contenteditable = true;
        document.querySelector("div.record_button button").disabled = true;
    }

    async send_chatgpt(content) {
        let prompt = [{role: "user", content: ""}];
        document.querySelector("#score").innerHTML = '';
        document.querySelector("#regenerate_result").innerHTML = '';
        document.querySelector("#regenerate_result").style.display = '';
        document.querySelector("#translate_result").innerHTML = '';
        document.querySelector("#description").innerHTML = '';
        document.querySelector("#suggestion").innerHTML = '';

        var is_translate_mode = localStorage.getItem("is_translate_mode");
        if (is_translate_mode && JSON.parse(is_translate_mode)) {
            prompt.push({role: "user", content: `Text: "${content}" // Translate this text into ${language_dict[document.querySelector("#source_language").value].English} and write the result to a JSON message which has a single attribute named 'translated_result'.`});
            this.disable_elements();
            document.querySelector("div.answer_wrapper").style.display = '';
            await chatgpt_api(prompt, "gpt-3.5-turbo-1106");
            document.querySelector("div.record_upper_buttons button").click();
            return;
        }

        prompt.push({role: "user", content: `Text: "${content}" // Write a JSON message. First, rate how natural and correct the above text sounds on a scale from 1 to 5, and add the score to the 'score' attribute. Second, add the original text to the 'result' attribute if it sounds grammatically natural and sufficiently casual. Polish it otherwise.`});
        this.disable_elements();
        await chatgpt_api(prompt, "gpt-4-1106-preview");
        const polished_result = document.querySelector("#regenerate_result > span").innerText.replaceAll(`"`, ``);
        this.compare_prev_result(document.querySelector("div.record_script"), document.querySelector("#regenerate_result"), document.querySelector("div.record_script").innerText, polished_result);

        prompt = [{role: "user", content: ""}];
        prompt.push({role: "user", content: `{"original_text": "${content}", "polished_result": "${polished_result}"} // This JSON message shows the input to a polishing bot and its polished output. Write a JSON message that includes a single attribute named 'description', which explains the changes made in detail, as if written by the bot. Please suggest an expression which sounds more natural to native speakers and add it to the 'another_suggested_expression' attribute if it exists.`});
        this.disable_elements();
        await chatgpt_api(prompt, "gpt-3.5-turbo-1106");
    }
}
