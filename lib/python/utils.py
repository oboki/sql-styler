import re

def is_reserved_word(
      word:str
    ) -> bool:

    return word.upper() in [
        'SELECT','FROM','JOIN','AND',
        'WHERE','BETWEEN','GROUP BY',
        'ON','HAVING','ORDER BY',';',
        '(',')',',','/*','*/','CASE',
        'WHEN','END','CREATE','ELSE'
    ]


def tokenize(
      sql: str
    ) -> list:

    tokens = []

    # init string index
    idx_end_of_sql = len(sql)
    idx_processed, idx_current = 0, 0

    # parse sql string
    while idx_processed < idx_end_of_sql:

        if idx_current > idx_end_of_sql:
            tokens.append(sql[idx_processed:])
            break

        for i in range(idx_current-idx_processed+1):
            word = sql[idx_current-i:idx_current]

            if is_reserved_word(word):
                if (idx_current-i)-idx_processed > 0:
                    tmp = re.sub(
                            r'^\s*|\s*$','',
                            sql[idx_processed:idx_current-i]
                        )

                    if len(tmp.split("'")) == 2 or\
                        len(tmp.split('"')) == 2:
                        continue

                    if word in ['/*','*/','(',')',',',';']:
                        pass
                    elif (
                          (idx_current-i-1 == -1 or \
                           sql[idx_current-i-1] in [' ','(','*/',';']
                          ) and \
                          (idx_current >= idx_end_of_sql or \
                           sql[idx_current] in [' ',')','/*',';']
                          )
                         ):
                        pass
                    else:
                        continue

                    if len(tmp) > 0:
                        tokens.append(tmp)

                tokens.append(word)

                idx_processed = idx_current
                break

        idx_current = idx_current + 1

    return tokens


def refine_sql(sql) -> str:
    """refine sql string"""

    refined = []

    if isinstance(sql, str):
        sql = sql.split('\n')

    # convert double dashed comments to C-style comments
    for line in sql:
        refined.append(
        re.sub(
            r'--(.*)$',
            r'/*\g<1>*/',
            line
        ))

    # remove newlines
    refined = re.sub(
            r'\s+',' ',
            ''.join(refined).replace('\n',' ')
          )
    
    return refined