import { chatgpt_api, language_dict, textContents, user_lang } from "./common.js";

export class Messages{
    constructor() {
    }

    async send_chatgpt(content, model, is_verifying=false) {
        document.querySelector("div.api_status").innerHTML = `${textContents[user_lang]["waiting"]}...`;
        document.querySelector("textarea.record_script").disabled = true;
        document.querySelector("div.record_button button").disabled = true;

        const prompt = [{role: "user", content: ""}];
        document.querySelector("#regenerate_result").innerHTML = '';
        document.querySelector("#description").innerHTML = '';
        document.querySelector("#score").innerHTML = '';
        prompt.push({role: "user", content: `Text: "${content}" // Write a JSON message. First, rate how natural and casual the above text sounds to a native speaker on a scale from 1 to 5, and add the score to the 'score' attribute. Second, polish the text to make it sound natural and casual to a native speaker and add the result to the 'result' attribute. Third, explain the changes made and add the explanation to the 'description' attribute in the JSON message. Add the original text to the 'result' attribute if it is natural and casual enough.`});
        await chatgpt_api(prompt, model, is_verifying);
    }
}
