import * as fs from 'fs'
import { format } from "./style";

const idx = process.argv.slice(2)[0]

const sql = fs.readFileSync('./sample.' + idx + '.sql').toString();

console.log(format(sql));