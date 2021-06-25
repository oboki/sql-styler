/**
 * Returns whether the given argument is a keyword. 
 * 
 * @param {String} word 
 * @returns {Boolean}
 */

function isReservedWord(word) {
    return [
        'SELECT', 'FROM', 'JOIN', 'AND', ';',
        'WHERE', 'BETWEEN', 'GROUP BY', 'ON',
        'WHEN', 'ELSE', 'CASE', 'THEN', 'AS',
        'HAVING', 'ORDER BY', 'CREATE', 'END',
        '(', ')', ',', '/*', '*/', 'INSERT'
    ].includes(word.toUpperCase());
}


/**
 * the upper case of the next word is returned.
 * 
 * @param {Array} tokens 
 * @returns {String}
 */

function peekNextWord(tokens) {
    if (tokens.length > 0) {
        return tokens[0].toUpperCase();
    }
    return '';
}


/**
 * If the next token is keyword, the upper case of the keyword is returned.
 * 
 * @param {Array} tokens 
 * @returns {String}
 */

function peekNextKeyword(tokens) {
    for (let i = 0; i < tokens.length; i++) {
        if (isReservedWord(tokens[i])) {
            return tokens[i].toUpperCase();
        }
    }
    return '';
}


/**
 * Returns the position of the given keyword in the previous line.
 * 
 * @param {Array} formatted 
 * @param {String} keyword 
 * @returns {Number}
 */

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


function getCurrentPosition(formatted) {
    for (let i = formatted.length - 1; i > 0; i--) {
        if (formatted[i] === '\n') {
            const position = formatted.slice(i + 1, formatted.length).join('').toUpperCase().length
            if (position > 0) {
                return position;
            }
        }
    }
    return 0;
}

/**
 * 
 * @param {Array} stack 
 * @param {Number} index 
 * @returns {String}
 */

function peekStack(stack, index=-1) {
    if (stack.length > index * (-1) - 1) {
        return stack.slice(index)[0].type;
    }
    return '';
}


/**
 * Calc and returns the indentation margin value.
 * 
 * @param {Array} stack 
 * @returns {Number}
 */

function getMargin(stack, offset=0) {
    let margin = 0;
    for (let i = 0; i < stack.length; i++) {
        margin += stack[i].margin;
    }
    if (margin+offset>=0) {
        return margin+offset;
    }
    return margin;
}


/**
 * Tokenizes the given sql and returns a list of tokens. 
 * 
 * @param {String} sql
 * @returns {Array}
 */

function tokenize(sql) {

    // init
    const tokens = [];
    let idx_current = 0;
    let idx_processed = 0;
    let idx_end_of_sql = sql.length;

    while (idx_processed < idx_end_of_sql) {

        if (idx_current > idx_end_of_sql) {
            tokens.push(
                sql.slice(
                    idx_processed,
                    idx_end_of_sql
                ).replace(/(^\s*|\s*$)/g, ''));
            break;
        }

        for (let i = 0; i < idx_current-idx_processed+1; i++) {
            const word = sql.slice(idx_current-i, idx_current);

            if (isReservedWord(word)) {
                if ((idx_current-i)-idx_processed > 0) {
                    const tmp = sql.slice(
                        idx_processed,
                        idx_current - i
                    ).replace(/(^\s*|\s*$)/g, '');

                    if (tmp.split("'").length === 2 ||
                        tmp.split('"').length === 2) {
                        // skip when quotes are not closed.
                        continue;
                    }

                    if (['/*', '*/', '(', ')', ',', ';'].includes(word)) {
                        // pass
                    } else if (
                        (idx_current - i - 1 === -1 ||
                            [' ', '(', '*/', ';'].includes(sql[idx_current - i - 1])) &&
                        (idx_current >= idx_end_of_sql ||
                            [' ', ')', '/*', ';'].includes(sql[idx_current]))
                    ) {
                        // pass
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


/**
 * 
 * @param {String} text 
 * @returns {String}
 */

module.exports = function format(text) {

    const sql = text.replace(
        /--(.*)/g, '/* $1 */'
    ).replace(
        /(\r\n|\r|\n)/g, ' '
    ).replace(
        /\s+/g, ' '
    );

    const tokens = tokenize(sql);
    const stack = [];
    const formatted = [];

    let keyword = '';
    let last_word = '';
    let last_keyword = '';

    while (tokens.length) {

        // debug
        const tmp = formatted.join('');
        console.log(tmp);

        const word = tokens.shift();

        if (isReservedWord(word)) {
            keyword = word.toUpperCase();
        } else {
            keyword = '';
        }

        console.log(stack);
        console.log(word);
        console.log();

        /**
         * handling comments.
         */
        if (['/*','*/'].includes(keyword) || peekStack(stack) === 'COMMENT') {
            if (keyword === '/*') {
                stack.push(
                    {
                        type: 'COMMENT',
                        margin: 0
                    }
                );
            } else if (keyword === '*/') {
                stack.pop();
            } else { // in-comment
                // pass
            }

            formatted.push(' ');
            formatted.push(word);

            // don't forget to update last keyword
            if (isReservedWord(word)) {
                last_keyword = keyword;
            }
            last_word = word.toUpperCase();
            continue;
        }

        /**
         * handling top-tier keyword.
         */
        if (['SELECT', 'FROM', 'WHERE', 'AND', 'GROUP BY', 'ORDER BY',
            'JOIN', 'ON', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'AS',
            'HAVING', 'BETWEEN', 'CREATE', 'TABLE', 'HAVING'].includes(keyword)) {
            if (keyword === 'SELECT') { // select clause
                stack.push(
                    {
                        type: 'SELECT',
                        margin: 0
                    }
                );
                if (last_word !== '(') {
                    formatted.push('\n');
                }
            } else if (keyword === 'FROM') { // from clause
                stack.pop();
                formatted.push('\n');
                formatted.push(' '.repeat(getMargin(stack)+2));
            } else if (keyword === 'JOIN') { // join clause
                if (peekStack(stack) === 'ON') {
                    stack.pop();
                }
                stack.push(
                    {
                        type: 'JOIN',
                        margin: 7
                    }
                );
                formatted.push(' ');
            } else if (keyword === 'ON') { // on clause
                if (peekStack(stack) === 'JOIN') {
                    stack.pop();
                }
                stack.push(
                    {
                        type: 'ON',
                        margin: 0
                    }
                );
                formatted.push(' ');
            } else if (keyword === 'WHERE') {
                formatted.push('\n');
                formatted.push(' '.repeat(getMargin(stack)));
                formatted.push(' ');
            } else if (keyword === 'AND') {
                if (peekStack(stack) === 'ON') {
                    formatted.push('\n');
                    formatted.push(' '.repeat(getMargin(stack)-3));
                } else if (peekStack(stack) === 'INLINE' && peekStack(stack,-2) === 'ON') {
                    formatted.push('\n');
                    formatted.push(' '.repeat(getMargin(stack)-4));
                } else if (peekStack(stack) === 'CASE') {
                    formatted.push(' ');
                } else if (peekStack(stack) === 'BETWEEN') {
                    formatted.push('\n');
                    formatted.push(' '.repeat(getPosOfKeywordPreviousLine(formatted, 'BETWEEN')+4));
                    stack.pop();
                } else {
                    formatted.push('\n');
                    formatted.push(' '.repeat(getMargin(stack)+3));
                }
            } else if (keyword === 'CASE') {
                if (last_keyword !== '('){
                    formatted.push(' ');
                }
                stack.push(
                    {
                        type: 'CASE',
                        margin: getCurrentPosition(formatted)-getMargin(stack)+1
                    }
                );
            } else if (keyword === 'WHEN') {
                if (last_word === 'CASE') {
                    formatted.push(' ');
                } else {
                    formatted.push('\n');
                    formatted.push(' '.repeat(getMargin(stack)+4));
                }
            } else if (keyword === 'THEN') {
                formatted.push(' ');
            } else if (keyword === 'ELSE') {
                formatted.push('\n');
                formatted.push(' '.repeat(getPosOfKeywordPreviousLine(formatted, 'THEN')));
            } else if (keyword === 'END') {
                formatted.push('\n');
                formatted.push(' '.repeat(getMargin(stack)-1));
                stack.pop();
            } else if (keyword === 'HAVING') {
                formatted.push('\n');
                formatted.push(' '.repeat(getMargin(stack)));
            } else if (keyword === 'BETWEEN') {
                stack.push(
                    {
                        type: 'BETWEEN',
                        margin: 0
                    }
                );
                formatted.push(' ');
            } else if (['GROUP BY','ORDER BY'].includes(keyword)) {
                stack.push(
                    {
                        type: 'BY',
                        margin: 1
                    }
                );
                formatted.push('\n');
                formatted.push(' '.repeat(getMargin(stack)));
            } else {
                formatted.push(' ');
            }

            formatted.push(word);

            // don't forget to update last keyword
            if (isReservedWord(word)) {
                last_keyword = keyword;
            }
            last_word = word.toUpperCase();
            continue;
        }

        /**
         * handling parenthesis.
         */
        if (['(', ')'].includes(keyword)) {
            if (keyword === '(') { // parenthesis open
                if (last_keyword === 'JOIN') {
                    formatted.push('\n');
                    formatted.push(' '.repeat(getMargin(stack)-1));
                }
                stack.push(
                    {
                        type: 'INLINE',
                        margin: getCurrentPosition(formatted) - getMargin(stack) + 2
                    }
                );

                if (peekNextKeyword(tokens) === 'SELECT') { // select clause
                    formatted.push(' ');
                } else if (last_keyword === 'ON') { // on clause
                    formatted.push(' ');
                } else { // function
                    stack.push(
                        {
                            type: 'FUNCTION',
                            margin: 0
                        }
                    );
                    // do not append any whitespaces
                }
                formatted.push(word);
            } else if (keyword === ')') { // parenthesis close
                const poped = stack.pop();
                if (poped.type === 'FUNCTION'){
                    stack.pop();
                } else if (peekStack(stack) === 'ON') {
                    stack.pop();
                } else if (poped.type === 'INLINE') {
                    formatted.push('\n');
                    formatted.push(' '.repeat(getMargin(stack)+poped.margin-1));
                }
                formatted.push(word);
            }

            // don't forget to update last keyword
            if (isReservedWord(word)) {
                last_keyword = keyword;
            }
            last_word = word.toUpperCase();
            continue;
        }

        /**
         * identifiers, expressions, .. etc.
         */
        if (last_word === 'SELECT') {
            // first column identifier
            formatted.push(' ');
        } else if (peekStack(stack) === 'SELECT') {
            // column identifier
            if (keyword === ',') {
                formatted.push('\n');
                formatted.push(' '.repeat(getMargin(stack)+4));
            }
            formatted.push(' ');
        } else if (last_word === 'FROM') {
            // table identifier
            formatted.push(' ');
        } else if (last_keyword === 'WHERE') { // first filter exp
            formatted.push(' ');
        } else if (last_keyword === 'AND') {
            formatted.push(' ');
        } else if (last_keyword === 'BETWEEN') {
            formatted.push(' ');
        } else if (last_keyword === 'WHEN') {
            formatted.push(' ');
        } else if (last_keyword === 'THEN') {
            formatted.push(' ');
        } else if (last_keyword === 'ELSE') {
            formatted.push(' ');
        } else if (peekStack(stack) === 'ON') {
            if (peekNextKeyword(tokens,'AND')) {
                stack.pop();
            }
            formatted.push(' ');
        } else if (peekStack(stack) === 'INLINE' && peekStack(stack,-2) === 'ON') {
            if (last_word !== '(') {
                formatted.push(' ');
            }
        } else if (last_keyword === 'AS') { // alias
            formatted.push(' ');
        } else if (last_keyword === 'END') {
            formatted.push(' ');
        } else if (last_keyword === 'HAVING') {
            formatted.push(' ');
        } else if (last_keyword === ')') {
            formatted.push(' ');
        } else if (peekStack(stack) === 'BY') {
            if (keyword === ',') {
                // pass
            } else {
                formatted.push(' ');
                if (peekNextKeyword(tokens) !== ',') {
                    stack.pop();
                }
            }
        } else if (peekStack(stack) === 'FUNCTION') {
            // do not append any whitespaces
        } else {
            formatted.push('\n');
            formatted.push(' '.repeat(getMargin(stack)));
        }

        formatted.push(word);

        // don't forget to update last keyword
        if (isReservedWord(word)) {
            last_keyword = keyword;
        }
        last_word = word.toUpperCase();
    }

    return formatted.join('');
}