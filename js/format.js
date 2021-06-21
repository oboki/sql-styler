function isReservedWord(word) {
    return [
        'SELECT', 'FROM', 'JOIN', 'AND',
        'WHERE', 'BETWEEN', 'GROUP BY',
        'ON', 'HAVING', 'ORDER BY', ';',
        '(', ')', ',', '/*', '*/', 'CASE',
        'WHEN', 'END', 'CREATE', 'ELSE',
        'THEN'
    ].includes(word.toUpperCase());
}

function peekNextKeyword(tokens) {
    if (tokens.length > 0 && isReservedWord(tokens[0])) {
        return tokens[0].toUpperCase();
    }
    return '';
}

function getPosOfKeywordPreviousLine(formatted, keyword) {
    for (let i = formatted.length - 1; i > 0; i--) {
        if (formatted[i] === '\n') {
            const position = formatted.slice(i + 1, formatted.length).join('').toUpperCase().indexOf(keyword);
            if (position > 0) {
                return position;
            }
        }
    }
    return 0;
}

function getMargin(stack) {
    let margin = 0;
    for (let i = 0; i < stack.length; i++) {
        margin += stack[i].margin;
    }
    return margin;
}

function tokenize(refinedSql) {

    let idx_end_of_sql = refinedSql.length;
    let idx_processed = 0;
    let idx_current = 0;

    const tokens = []

    while (idx_processed < idx_end_of_sql) {

        if (idx_current > idx_end_of_sql) {
            tokens.push(refinedSql.slice(idx_processed, idx_end_of_sql))
            break;
        }

        for (let i = 0; i < idx_current - idx_processed + 1; i++) {
            const word = refinedSql.slice(idx_current - i, idx_current)

            if (isReservedWord(word)) {
                if ((idx_current - i) - idx_processed > 0) {
                    const tmp = refinedSql.slice(idx_processed, idx_current - i).replace(/(^\s*|\s*$)/g, '');

                    if (tmp.split("'").length === 2 || tmp.split('"').length === 2) {
                        continue;
                    }

                    if (['/*', '*/', '(', ')', ',', ';'].includes(word)) { //pass
                    } else if (
                        (idx_current - i - 1 === -1 || [' ', '(', '*/', ';'].includes(refinedSql[idx_current - i - 1])) &&
                        (idx_current >= idx_end_of_sql || [' ', ')', '/*', ';'].includes(refinedSql[idx_current]))
                    ) { //pass
                    } else {
                        continue;
                    }

                    if (tmp.length > 0) {
                        tokens.push(tmp);
                    }
                }

                tokens.push(word);
                idx_processed = idx_current;
                break;
            }
        }
        idx_current += 1;

    }

    return tokens;
}


module.exports = function format(sql) {

    tokens = tokenize(sql);

    const stack = [];
    const formatted = [];

    let keyword = "";
    let last_keyword = "";

    while (tokens.length) {

        const word = tokens.shift();

        if (isReservedWord(word)) {
            keyword = word.toUpperCase();
        } else {
            keyword = '';
        }

        // pop stack when a block closed
        if (keyword !== 'AND') {
            if (last_keyword === 'ON' && keyword === '(') {
                // pass
            } else if (stack.length > 0 && stack.slice(-1)[0].type === 'ON') {
                stack.pop();
            }
        }

        if (keyword !== '' && keyword !== ',' && stack.length > 0 && stack.slice(-1)[0].type == 'BY') {
            stack.pop()
        }

        if (stack.length > 0 && stack.slice(-1)[0].type === 'BY' && keyword !== ',') {
            stack.pop();

        } else if (stack.length > 0 && stack.slice(-1)[0].type === 'COMMENT') {
            formatted.push(' ');
            formatted.push(word);
            if (word === '*/') {
                stack.pop();
            }
            continue;

        } else if (stack.length > 0 && stack.slice(-1)[0].type === 'BETWEEN' && keyword == 'AND') {
            stack.pop();

        } else if (stack.length > 0 && keyword == ')') {
            const poped = stack.pop();
            if (poped.type === 'SUBQUERY') {
                formatted.push('\n');
            }
        }

        // format sql
        if (keyword === 'CREATE') {
            if (formatted.length > 0) {
                formatted.push('\n');
            }
            formatted.push(word);

        } else if (keyword === 'SELECT') {
            if (last_keyword !== '(' && formatted.length > 0) {
                formatted.push('\n');
            }
            formatted.push(word);

            stack.push({ type: "SELECT", margin: 0 });

        } else if (keyword === 'FROM') {
            formatted.push('\n');
            formatted.push(' '.repeat(getMargin(stack) + 2));
            formatted.push(word);
            stack.pop();

        } else if (keyword === 'WHERE') {
            formatted.push('\n');
            formatted.push(' '.repeat(getMargin(stack) + 1));
            formatted.push(word);

        } else if (['GROUP BY', 'ORDER BY'].includes(keyword)) {
            formatted.push('\n');
            formatted.push(' '.repeat(getMargin(stack)));
            formatted.push(word);

            stack.push({ type: "BY", margin: 0 });

        } else if (keyword === 'AND') {
            if (stack.slice(-1)[0].type === 'CASE') {
                formatted.push(' '.repeat(1));
            } else {
                formatted.push('\n');
                formatted.push(' '.repeat(getMargin(stack)));
            }
            formatted.push(word);

        } else if (keyword === 'BETWEEN') {
            formatted.push(' '.repeat(1));
            formatted.push(word);

        } else if (keyword === 'JOIN') {
            formatted.push(' '.repeat(1));
            formatted.push(word);
            formatted.push('\n');
            formatted.push(' '.repeat(getMargin(stack)));

        } else if (keyword === 'ON') {
            formatted.push(' '.repeat(1));
            formatted.push(word);
            formatted.push(' '.repeat(1));
            stack.push({ type: "ON", margin: getPosOfKeywordPreviousLine(formatted, keyword) });

        } else if (keyword === 'CASE') {
            formatted.push(' '.repeat(1));
            formatted.push(word);
            stack.push({ type: "CASE", margin: getPosOfKeywordPreviousLine(formatted, keyword) });

        } else if (keyword === 'ELSE') {
            formatted.push('\n');
            formatted.push(' '.repeat(getPosOfKeywordPreviousLine(formatted, 'THEN')));
            formatted.push(word);

        } else if (keyword === 'END') {
            formatted.push('\n');
            formatted.push(' '.repeat(getMargin(stack)));
            formatted.push(word);

            stack.pop();

        } else if (keyword === 'WHEN') {
            if (last_keyword === 'CASE') {
                formatted.push(' '.repeat(1));
                formatted.push(word);
            } else {
                formatted.push('\n');
                formatted.push(' '.repeat(getMargin(stack) + 5));
                formatted.push(word);
            }

        } else if (keyword === '(') {
            if (peekNextKeyword(tokens) === 'SELECT') {
                formatted.push(' '.repeat(1));
                formatted.push(word);
                stack.push({ type: "SUBQUERY", margin: getPosOfKeywordPreviousLine(formatted, keyword) });
            } else {
                stack.push({ type: "FUNCTION", margin: 0 });
                formatted.push(word);
            }

        } else if (keyword === ')') {
            formatted.push(word);

        } else if (keyword === ',') {
            if (stack.length > 0 && ['FUNCTION', 'BY'].includes(stack.slice(-1)[0].type)) {
            } else {
                formatted.push('\n');
                formatted.push(' '.repeat(getMargin(stack) + 5));
            }
            formatted.push(word);

        } else if (keyword === '/*') {
            formatted.push(' ');
            formatted.push(word);

            stack.push({ type: "COMMENT", margin: 0 });

        } else if (keyword === '*/') {
            formatted.push(' ');
            formatted.push(word);

            stack.push({ type: "COMMENT", margin: 0 });

        } else {
            if (last_keyword !== '(') {
                formatted.push(' ');
            }
            formatted.push(word);
        }

        if (isReservedWord(word)) {
            last_keyword = keyword;
        }
    }

    return formatted.join('');
}