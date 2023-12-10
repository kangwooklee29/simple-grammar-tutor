import {textContents, user_lang} from "./common.js";

export class AnswerStream {
    constructor() {
        this.now_streaming = false;
        this.now_answer = "";
        this.result = "";
    }

    start() {
        if (this.now_streaming === false) {
            this.now_answer = "";
            this.result = "";
            this.now_streaming = true;
            document.querySelector("div.api_status").innerHTML = `${textContents[user_lang]["generating"]}...`;
        }
    }

    findPropertyValue(jsonString, propertyName, is_num=false) {
        var match = new RegExp('"' + propertyName + '"\\s*:\\s*"([^"]*)"').exec(jsonString);
        if (is_num)
            match = new RegExp('"' + propertyName + '"\\s*:\\s*([^,^\\s^}]+)[,\\s}]').exec(jsonString);
        return match ? match[1] : "";
    }

    async add_answer(answer_generated, is_verifying) {
        this.now_answer += answer_generated;

        const val_score = this.findPropertyValue(this.now_answer, "score", true);
        document.querySelector(`#score`).innerText = `Score: ${val_score} / 5`;
        const val_result = this.findPropertyValue(this.now_answer + `"`, "result");
        document.querySelector(`#regenerate_result`).innerHTML = `Result: <b>"${val_result}"</b>`;
        const val_pronun = this.findPropertyValue(this.now_answer + `"`, "description");
        document.querySelector(`#description`).innerText = `${val_pronun}`;
    }

    end() {
        this.now_streaming = false;
        document.querySelector("div.api_status").innerHTML = ``;
        document.querySelector("textarea.record_script").disabled = false;
        document.querySelector("div.record_button button").disabled = false;
    }
}
