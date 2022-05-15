keywords = {
    "SELECT": {
        "default": {
            "padding": 0
        }
    },
    "FROM": {
        "default": {
            "padding": 2,
            "lineBreak": true
        }
    },
    "WHERE": {
        "default": {
            "padding": 1,
            "lineBreak": true
        }
    },
    "AND": {
        "default": {
            "padding": 3,
            "lineBreak": true
        }
    },
    "GROUP": {
        "default": {
            "padding": 1,
            "lineBreak": true
        }
    },
    "JOIN": {
        "default": {
            "padding": 2,
            "lineBreak": true
        }
    },
    "FULL": {
        "default": {
            "padding": 7,
            "lineBreak": true
        }
    },
    "RIGHT": {
        "default": {
            "padding": 7,
            "lineBreak": true
        }
    },
    "LEFT": {
        "default": {
            "padding": 7,
            "lineBreak": true
        }
    },
    "OUTER": {
        "default": {
            "padding": 7,
            "lineBreak": true
        }
    },
    "INNER": {
        "default": {
            "padding": 7,
            "lineBreak": true
        }
    },
    ",": {
        "default": {
            "padding": 5,
            "lineBreak": true
        }
    },
    "/*": {},
    "*/": {},
    "(": {
        "default": {
            "padding": 1,
        },
        "subquery": {
            "pading": 7,
            "lineBreak": true
        },
        "pushStateBefore": {
            "when": "SELECT",
            "type": "subquery"
        }
    },
    ")": {
        "default": {
            "padding": 0,
        }
    },
}

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
        '(', ')', ',', '/*', '*/', 'INSERT',
        'FULL', 'OUTER', 'LEFT' , 'RIGHT', 'INNER', 'CROSS',
        'IN', 'INTO', 'OVERWRITE', 'VALUES'
    ].includes(word.toUpperCase());
}


class CustomArray extends Array {
    /**
     * @param {Array} stack 
     * @param {Number} index 
     * @returns {String}
     */
    peek(index=-1) {
        if (this.length > index * (-1) - 1) {
            return this.slice(index)[0].type;
        }
        return '';
    }


    /**
     * Calc and returns the indentation margin value.
     * 
     * @returns {Number}
     */
    getMargin(offset = 0) {
        let margin = 0;
        for (let i = 0; i < this.length; i++) {
            margin += this[i].margin;
        }
        if (margin + offset >= 0) {
            return margin + offset;
        }
        return margin;
    }
}

class CustomQueue extends Array {
    /**
     * It pushes multiple items.
     * 
     * @param  {...any} items 
     */
    pushItems(...items){
        for (let i=0; i<items.length; i++) {
            this.push(items[i])
        }
    }


    /**
     * Returns the position of the given keyword in the previous line.
     * 
     * @param {String} keyword 
     * @returns {Number}
     */
    getPosOfKeywordPreviousLine(keyword) {
        for (let i = this.length - 1; i > 0; i--) {
            if (this[i] === '\n') {
                const position = this.slice(i + 1, this.length).join('').toUpperCase().indexOf(keyword);
                if (position > 0) {
                    return position;
                }
            }
        }
        return 0;
    }


    /**
     * Returns the current line's column position.
     * 
     * @returns {Number}
     */
    getCurrentPosition() {
        for (let i = this.length - 1; i > 0; i--) {
            if (this[i] === '\n') {
                const position = this.slice(i + 1, this.length).join('').toUpperCase().length
                if (position > 0) {
                    return position;
                }
            }
        }
        return 0;
    }
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
        if (keywords.hasOwnProperty(tokens[i].toUpperCase())) {
            return tokens[i].toUpperCase();
        }
    }
    return '';
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

            if (keywords.hasOwnProperty(word.toUpperCase())) {
                if ((idx_current-i)-idx_processed >= 0) {
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
    const stack = new CustomArray();
    const formatted = new CustomQueue();

    let keyword = '';
    let last_word = '';
    let last_keyword = '';

    let indent = 0;

    while (tokens.length) {
        const word = tokens.shift(); // pop

        if (keywords.hasOwnProperty(word.toUpperCase())) {
            keyword = word.toUpperCase();
        } else {
            keyword = '';
        }

        /**
         * handling comments.
         */
        if (['/*','*/'].includes(keyword) || stack.peek() === 'COMMENT') {
            if (keyword === '/*') {
                stack.push(
                    {
                        type: 'COMMENT',
                        margin: 0
                    }
                );
            } else if (keyword === '*/') {
                stack.pop();
            }

            formatted.pushItems(' ', word);
            continue;
        }

        if (word.toUpperCase() in keywords) {

            const attr = keywords[word.toUpperCase()];

            if ("lineBreak" in attr.default && attr.default.lineBreak === true) {
                formatted.push('\n');
            }

            if (word.toUpperCase() === "JOIN") {
                if (formatted.slice(-2, -1).join('').toUpperCase() === "INNER") {
                    formatted.pop();
                    formatted.pushItems(formatted.pop());
                    formatted.pushItems(' ', word);
                } else if (formatted.slice(-2, -1).join('').toUpperCase() === "OUTER") {
                    formatted.pop();
                    const tmp = formatted.pop();
                    formatted.pop();
                    formatted.pop();
                    formatted.pushItems(formatted.pop());
                    formatted.pushItems(' ', tmp, ' ', word);
                } else {
                    formatted.push(' '.repeat(attr.default.padding));
                }
                // console.log(formatted);
            } else {
                formatted.pushItems(' '.repeat(attr.default.padding), word);
            }

            // handle state
            if ("pushStateBefore" in attr && peekNextKeyword(tokens) === attr.pushStateBefore.when) {
                stack.push({
                    type: attr.pushStateBefore.type,
                    margin: 0
                });

            }
        } else {
            formatted.pushItems(' ', word);
        }

        // don't forget to update last keyword
        if (keywords.hasOwnProperty(word.toUpperCase()) && !['/*','*/'].includes(word)) {
            last_keyword = keyword;
        }
        last_word = word.toUpperCase();
    }

    return formatted.join('');
}