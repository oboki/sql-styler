from lib.python.sql import SQL

import unittest

class TestSQL(unittest.TestCase):

    def test_format(self):
        sql = SQL("""select max(tx_amt) from tx_list where tx_date > from_timestamp(now()-1,'yyyyMMdd')""").format()

        desired = '\n'.join([
            """select max(tx_amt)""",
            """  from tx_list""",
            """ where tx_date > from_timestamp(now() -1, 'yyyyMMdd')""",
           ])

        self.assertEqual(sql, desired)


    def test_align(self):
        sql = SQL("""create table tab as select a from tx_list where 1=1""").format()

        desired = '\n'.join([
            """select max(tx_amt)""",
            """  from tx_list""",
            """ where tx_date > from_timestamp(now() -1, 'yyyyMMdd')""",
           ])

        self.assertEqual(sql, desired)


if __name__ == '__main__':
    unittest.main()
