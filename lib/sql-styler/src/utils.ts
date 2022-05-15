import { keywords } from "./tokens"

/**
 * Tokenizes the given sql and returns a list of tokens. 
 * 
 * @param {String} sql
 * @returns {Array}
 */
export function tokenize(sql: string): string[] {

    sql = sql.replace(
        /--(.*)/g, '/* $1 */'
    ).replace(
        /(\r\n|\r|\n)/g, ' '
    ).replace(
        /\s+/g, ' '
    );

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

            if (keywords.hasOwnProperty(word.toLowerCase())) {
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