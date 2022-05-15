import * as fs from 'fs'
import { format } from "./style";

const sql = fs.readFileSync('./sample.sql').toString();

console.log(format(sql));