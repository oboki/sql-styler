/**
 * Returns whether the given argument is a keyword. 
 * 
 * @param {String} word 
 * @returns {Boolean}
 */

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


/**
 * If the next token is keyword, the upper case of the keyword is returned.
 * 
 * @param {Array} tokens 
 * @returns {String}
 */

function peekNextKeyword(tokens) {
    if (tokens.length > 0 && isReservedWord(tokens[0])) {
        return tokens[0].toUpperCase();
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
 * @returns {String}
 */

function peekStack(stack) {
    if (stack.length > 0) {
        return stack.slice(-1)[0].type;
    }
    return '';
}


/**
 * 
 * @param {*} stack 
 * @returns 
 */

function peekStack2(stack) {
    if (stack.length > 1) {
        return stack.slice(-2)[0].type;
    }
    return '';
}


/**
 * Calc and returns the indentation margin value.
 * 
 * @param {Array} stack 
 * @returns {Number}
 */

function getMargin(stack) {
    let margin = 0;
    for (let i = 0; i < stack.length; i++) {
        margin += stack[i].margin;
    }
    return margin;
}


/**
 * Tokenizes then given sql and returns a list of tokens. 
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

        const word = tokens.shift();

        if (isReservedWord(word)) {
            keyword = word.toUpperCase();
        } else {
            keyword = '';
        }

        // debug
        console.log(stack);
        console.log('word: '+word);
        console.log();

        /**
         * handling top-tier keyword.
         */
        if (['SELECT', 'FROM', 'JOIN', 'ON'].includes(keyword)) {
            if (keyword === 'SELECT') { // select clause
                stack.push(
                    {
                        type: 'SELECT',
                        margin: 0
                    }
                );
            }
            else if (keyword === 'FROM') { // from clause
                stack.pop();
                formatted.push('\n');
                formatted.push(' '.repeat(getMargin(stack)+2));
            }
            else if (keyword === 'JOIN') { // join clause
                stack.push(
                    {
                        type: 'JOIN',
                        margin: 7
                    }
                );
                formatted.push(' ');
            }
            else if (keyword === 'ON') { // on clause
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
                stack.push(
                    {
                        type: 'INLINE',
                        margin: getCurrentPosition(formatted) - getMargin(stack) + 2
                    }
                );

                if (peekNextKeyword(tokens) === 'SELECT') { // select clause
                    formatted.push(' ');
                    formatted.push(word);
                } else if (last_keyword === 'ON') { // on clause
                    formatted.push(' ');
                    formatted.push(word);
                } else { // function
                    stack.push(
                        {
                            type: 'FUNCTION',
                            margin: 0
                        }
                    );
                    // do not append any whitespaces
                    formatted.push(word);
                }
            } else if (keyword === ')') { // parenthesis close
                const poped = stack.pop();
                if (poped.type === 'FUNCTION'){
                    stack.pop();
                } else if (peekStack(stack) === 'ON') {
                    stack.pop();
                    formatted.push('\n');
                    formatted.push(' '.repeat(getMargin(stack)));
                } else if (poped === 'INLINE') {
                    formatted.push('\n');
                    formatted.push(' '.repeat(getMargin(stack)-1));
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
        if (peekStack(stack) === 'FUNCTION') {
            // do not append any whitespaces
        } else if (last_word === 'SELECT') {
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
        } else if (peekStack(stack) === 'ON' || (peekStack(stack) === 'INLINE' && peekStack2(stack) === 'ON')) {
            // table identifier
            formatted.push(' ');
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