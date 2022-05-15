"use strict";
exports.__esModule = true;
var Keywords_1 = require("./Keywords");
/**
 * Tokenizes the given sql and returns a list of tokens.
 *
 * @param {String} sql
 * @returns {Array}
 */
function tokenize(sql) {
    // init
    var tokens = [];
    var idx_current = 0;
    var idx_processed = 0;
    var idx_end_of_sql = sql.length;
    while (idx_processed < idx_end_of_sql) {
        if (idx_current > idx_end_of_sql) {
            tokens.push(sql.slice(idx_processed, idx_end_of_sql).replace(/(^\s*|\s*$)/g, ''));
            break;
        }
        for (var i = 0; i < idx_current - idx_processed + 1; i++) {
            var word = sql.slice(idx_current - i, idx_current);
            if (Keywords_1.keywords.hasOwnProperty(word.toUpperCase())) {
                if ((idx_current - i) - idx_processed >= 0) {
                    var tmp = sql.slice(idx_processed, idx_current - i).replace(/(^\s*|\s*$)/g, '');
                    if (tmp.split("'").length === 2 ||
                        tmp.split('"').length === 2) {
                        // skip when quotes are not closed.
                        continue;
                    }
                    if (['/*', '*/', '(', ')', ',', ';'].includes(word)) {
                        // pass
                    }
                    else if ((idx_current - i - 1 === -1 ||
                        [' ', '(', '*/', ';'].includes(sql[idx_current - i - 1])) &&
                        (idx_current >= idx_end_of_sql ||
                            [' ', ')', '/*', ';'].includes(sql[idx_current]))) {
                        // pass
                    }
                    else {
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
