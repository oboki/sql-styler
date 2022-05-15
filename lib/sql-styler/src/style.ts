import { keywords } from "./tokens";
import { tokenize } from "./utils";

export function format(sql: string): string {
    const stack = [];
    const formatted = [];
    const tokens: string[] = tokenize(sql);

    let indent = 0;
    while (tokens.length) {
        const token: string = tokens.shift()!;

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

        if (keywords.hasOwnProperty(token.toLowerCase())){ // if the token is keyword
            const attr = keywords[token.toLowerCase()];
            let poped = undefined;

            if (attr.hasOwnProperty("popState")) {
                for (let c of attr["popState"]){
                    if (!c.hasOwnProperty("when")){
                        poped = stack.pop();
                        indent -= poped?.padding;

                        break;
                    }

                    if (stack.length > 0) {
                        const currentState = stack.slice(-1)[0].state;
                        if (c.hasOwnProperty("when") && c["when"] === currentState){
                            poped = stack.pop();
                            indent -= poped?.padding;

                            break;
                        }
                    }
                }
            }

            if (attr.hasOwnProperty("pushState")) {
                for (let c of attr["pushState"]) {
                    if (!c.hasOwnProperty("when")){
                        stack.push({
                            state: c.state,
                            padding: c.padding
                        });
                        indent += c.padding;

                        break;
                    }

                    if (stack.length > 0) {
                        const currentState = stack.slice(-1)[0].state;
                        if (c.hasOwnProperty("when") && c["when"] === currentState){
                            stack.push({
                                state: c.state,
                                padding: c.padding
                            });
                            indent += c.padding;

                            break;
                        } else if (c.hasOwnProperty("when") && c.when === poped?.state && c.popedState){
                            stack.push({
                                state: c.state,
                                padding: c.padding
                            });
                            indent += c.padding;

                            break;
                        }
                    }
                }
            }

            if (stack.length > 0) {
                const currentState = stack.slice(-1)[0].state;
                if (attr.hasOwnProperty(currentState)) {
                    if (attr[currentState].lineBreak) {
                        formatted.push('\n');
                        formatted.push(' '.repeat(indent));
                    }
                    formatted.push(' '.repeat(attr[currentState].padding));
                } else if (poped && attr.hasOwnProperty(poped.state) && attr[poped.state].popedState) {
                    if (attr[poped.state].lineBreak) {
                        formatted.push('\n');
                        formatted.push(' '.repeat(indent));
                    }
                    formatted.push(' '.repeat(attr[poped.state].padding));
                } else {
                    if (attr.hasOwnProperty("default")) {
                        if (attr.default.lineBreak) {
                            formatted.push('\n');
                            formatted.push(' '.repeat(indent));
                        }
                        formatted.push(' '.repeat(attr.default.padding));
                    }

                }
            } else {
                if (poped && attr.hasOwnProperty(poped.state) && attr[poped.state].popedState) {
                    if (attr[poped.state].lineBreak) {
                        formatted.push('\n');
                        formatted.push(' '.repeat(indent));
                    }
                    formatted.push(' '.repeat(attr[poped.state].padding));
                } else if (attr.hasOwnProperty("default")) {
                    if (attr.default.lineBreak) {
                        formatted.push('\n');
                        formatted.push(' '.repeat(indent));
                    }
                    formatted.push(' '.repeat(attr.default.padding));
                }
            }
        } else {
            const attr = keywords["default"];

            if (stack.length > 0) {
                const currentState = stack.slice(-1)[0].state;

                if (attr.hasOwnProperty(currentState)) {
                    if (attr[currentState].lineBreak) {
                        formatted.push('\n');
                        formatted.push(' '.repeat(indent));
                    }
                    formatted.push(' '.repeat(attr[currentState].padding));
                } else {
                    if (attr.hasOwnProperty("default")) {
                        if (attr.default.lineBreak) {
                            formatted.push('\n');
                            formatted.push(' '.repeat(indent));
                        }
                        formatted.push(' '.repeat(attr.default.padding));
                    }
                }
            } else {
                formatted.push(' ');
            }
        }

        console.log('\n');
        console.log(indent);
        console.log(token);
        console.log(stack);

        formatted.push(token);
    }

    let result = formatted.join('');
    result = result.replace(
        /\s\(select/g, '\(select'
    ).replace(
        /\(\s/g, '\('
    ).replace(
        /inner\n\s+join/g, 'inner join'
    ).replace(
        /(\w+)\n\s+outer\n\s+join/g, '$1 outer join'
    ).replace(
        /left\n\s+join/g, 'left join'
    ).replace(
        /right\n\s+join/g, 'right join'
    ).replace(
        /full\n\s+join/g, 'full join'
    );

    return result;
}
