import { keywords } from "./tokens";
import { tokenize } from "./utils";

export function format(sql: string): string {
    const stack = [];
    const formatted = [];
    const tokens: string[] = tokenize(sql);

    let indent = 0;
    while (tokens.length) {
        const token: string = tokens.shift()!;

        let currentState = undefined;
        if (stack.length)
            currentState = stack.slice(-1)[0].state;

        let nextState = undefined;
        if (tokens.length)
            nextState = tokens.slice(0, 1)[0].toLowerCase();

        /**
         * handling comments.
         */
        if (
            ['/*', '*/'].includes(token) ||
            (
                stack.length > 0 &&
                stack.slice(-1)[0].state === 'comment'
            )
        ) {
            if (token === '/*') {
                stack.push({
                    state: 'comment',
                    padding: 0
                });
            } else if (token === '*/') {
                stack.pop();
            }

            formatted.push(' ');
            formatted.push(token);

            continue;
        }

        /**
         * keyword
         */

        let isKeyword = keywords.hasOwnProperty(token.toLowerCase()); 
        let keyword = undefined;
        let attr = undefined;

        if (isKeyword){ // if the token is keyword
            keyword = keywords[token.toLowerCase()];

            attr = keyword.default;
            if (keyword.hasOwnProperty(currentState))
                attr = keyword[currentState];

            if (attr.hasOwnProperty("lineBreak")) {
                formatted.push('\n');
                formatted.push(' '.repeat(indent));
            }

            console.log();
            console.log("debug");
            console.log(attr.padding);
            formatted.push(' '.repeat(attr.padding));

        } else {
            formatted.push(' ');
        }
        formatted.push(token);

        /**
         * state
         */
        if (isKeyword && keyword.hasOwnProperty("popState")) {
            for (let cond of keyword.popState){
                if (cond.hasOwnProperty("current") && cond.current === currentState){
                    const poped = stack.pop();
                    indent -= poped?.padding;
                    break;
                }

                if (!cond.hasOwnProperty("current") && !cond.hasOwnProperty("next")){
                    const poped = stack.pop();
                    indent -= poped?.padding;
                    break;
                }
            }
        } else if (!isKeyword) {
            for (let cond of keywords["default"].popState){
                if (cond.hasOwnProperty("current") && cond.current === currentState){
                    const poped = stack.pop();
                    indent -= poped?.padding;
                    break;
                }
            }

        }

        if (isKeyword && keyword.hasOwnProperty("pushState")) {
            for (let cond of keyword.pushState){
                if (cond.hasOwnProperty("next") && cond.next === nextState){
                    stack.push({
                        state: cond.state,
                        padding: cond.padding
                    });
                    indent += cond.padding;
                    break;
                }

                if (cond.hasOwnProperty("current") && cond.current === currentState){
                    stack.push({
                        state: cond.state,
                        padding: cond.padding
                    });
                    indent += cond.padding;
                    break;
                }

                if (!cond.hasOwnProperty("current") && !cond.hasOwnProperty("next")){
                    stack.push({
                        state: cond.state,
                        padding: cond.padding
                    });
                    indent += cond.padding;
                    break;
                }
            }
        }

        /**
         * debug
         */
        console.log();
        console.log("token: ", token);
        console.log("indent: ", indent);
        console.log("stack:", JSON.stringify(stack, null, 2));
    }

    let result = formatted.join('');

    // result = result.replace(
    //     /\s\(select/g, '\(select'
    // ).replace(
    //     /\(\s/g, '\('
    // ).replace(
    //     /inner\n\s+join/g, 'inner join'
    // ).replace(
    //     /(\w+)\n\s+outer\n\s+join/g, '$1 outer join'
    // ).replace(
    //     /left\n\s+join/g, 'left join'
    // ).replace(
    //     /right\n\s+join/g, 'right join'
    // ).replace(
    //     /full\n\s+join/g, 'full join'
    // );

    return result;
}
