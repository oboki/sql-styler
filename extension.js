const ASTParser = require('node-sql-parser');
const vscode = require('vscode');
const format = require('./sql-styler.js');

const formatASTifiedSQL = (sql, database) => {
    const parser = new ASTParser.Parser()
    const opt = { database: database };
    const ast = parser.astify(`${sql};`, opt);
    let formatted = parser.sqlify(ast, opt).replaceAll('`', '');
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
