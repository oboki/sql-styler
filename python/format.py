#!/home/dong1lkim/usr/local/airflow/venv/bin/python

import sys
from lib.sql import SQL
from lib.utils import refine_sql

if __name__ == '__main__':

    if len(sys.argv) < 2:
        print('usage: python format.py {sql_filepath}')
        sys.exit(1)

    sql_filepath = sys.argv[1]
    with open(sql_filepath) as f:

        # init SQL
        sql = SQL(f.readlines())
        print("original sql string:\n\n{sql}\n\n\ntokens:\n\n{tokens}\n\n".format(sql=sql, tokens=sql.tokens))

        sql.format()
        print("formatted sql string:\n\n{sql}".format(sql=sql))