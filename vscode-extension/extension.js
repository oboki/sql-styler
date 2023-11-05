const ASTParser = require('node-sql-parser');
const vscode = require('vscode');
const format = require('./sql-styler.js');

const formatASTifiedSQL = (sql, database) => {
    const parser = new ASTParser.Parser()
    const opt = { database: database };
    const ast = parser.astify(`${sql};`, opt);
    let formatted = parser.sqlify(ast, opt).replaceAll('`', '');

    formatted = Array.from(formatted.split('\n'), (x) => {
        if (x.match(/CASE[\s\S]+END[\s\S]+END/)) // if nested
            return x;
        const matched = x.match(/CASE[\s\S]+END/);
        if (matched)
            if (x.split('WHEN').length > 2) {
                return x
                    .split('WHEN').join(`\n${' '.repeat(matched.index + 5)}WHEN`)
                    .split('ELSE').join(`\n${' '.repeat(matched.index + 5)}ELSE`)
                    .split('END' ).join(`\n${' '.repeat(matched.index    )}END`);
            }
        return x;
    }).join('\n');

    formatted = Array.from(formatted.split('\n'), (x) => {
        const splitted = x.split(' AND ');
        if (splitted.length > 1) {
            try {
                const matched = x.match(/ (WHERE|WHEN|ON|BETWEEN) /);
                return x
                    .split(' AND ')
                    .join(`\n${' '.repeat(matched.index + matched[0].length - 4)}AND `)
                    .replace(/BETWEEN ([\s\S]+)\n\s+AND ([\s\S]+)/, 'BETWEEN $1 AND $2');
            } catch (err) {
                console.log(x)
                console.log(err)
                return x;
            }
        }
        return x;
    }).join('\n');

    return formatted;
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log('Extension "SQL Styler" is now Active!');

    const dialects = [
        "Bigquery",
        "Db2",
        "Hive",
        "Mysql",
        "Mariadb",
        "Postgresql",
        "Snowflake",
        "Sqlite",
        "Transactsql",
        "Flinksql",
        "Impala"
    ];
    dialects.forEach((dialect) => {
        context.subscriptions.push(vscode.commands.registerCommand(`extension.sqlStylerFor${dialect}`, function () {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                const document = editor.document;
                const selection = editor.selection;

                const word = document.getText(selection);
                const formatted = `${formatASTifiedSQL(word, dialect.toLowerCase())};`;
                editor.edit(editBuilder => {
                    editBuilder.replace(selection, formatted);
                });
            }
        }));
    });

	context.subscriptions.push(vscode.commands.registerCommand('extension.sqlStyler', function () {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const document = editor.document;
			const selection = editor.selection;

			const word = document.getText(selection);
			const formatted = format(word);
			editor.edit(editBuilder => {
				editBuilder.replace(selection, formatted);
			});
		}
	}));
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
