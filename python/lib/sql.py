from lib.utils import is_reserved_word, tokenize, refine_sql
from collections import deque
from copy import deepcopy

class SQL:

    def __init__(
          self,
          sql
        ):

        self.sql = refine_sql(sql)
        self.tokens = tokenize(self.sql)
        self.formatted = dq()


    def __repr__(
          self
        ) -> str:

        return self.sql


    def format(
          self
        ) -> str:

        def peek_next_keyword() -> str:
            for word in tokens:
                if is_reserved_word(word):
                    return word.upper()

        tokens = deepcopy(self.tokens)
        formatted = dq()
        margins = stack()
        levels = stack()

        last_keyword = ''

        while tokens:
            word = tokens.pop(0)
            keyword = word.upper() if is_reserved_word(word.upper()) else None

            # clean up stacks when a block closed
            if keyword != 'AND':
                if last_keyword == 'ON' and keyword == '(':
                    pass
                elif not levels.empty() and levels.peek() == 'on':
                    levels.pop()
                    margins.pop()

            if keyword and keyword != ',' and \
               not levels.empty() and levels.peek() == 'by':
                levels.pop()

            # comment close
            if not levels.empty() and levels.peek() == 'comment':
                formatted.append_items(' ',word)

                if word == '*/':
                    levels.pop()

                # in comments, skip the rest of rules
                continue

            # calculate margin & level
            margin = margins.peek() if not margins.empty() else 0

            # append tokens into formatted
            if keyword == 'CREATE':
                if not formatted.empty():
                    formatted.append('\n')

                formatted.append(word)

            # select - from
            elif keyword == 'SELECT':
                if last_keyword != '(' and len(formatted) > 0:
                    formatted.append('\n')

                formatted.append(word)
                margins.push(formatted.get_pos_of_previous_keyword(keyword))

                levels.push('selection')
                margins.push(margins.peek()+5)

            elif keyword == 'FROM':
                if levels.peek() == 'selection':
                    levels.pop()
                    margins.pop()

                formatted.append_items('\n',' '*(margins.peek()+2),word)

            elif keyword == 'WHERE':
                formatted.append_items('\n',' '*(margin+1),word)

            elif keyword in ['GROUP BY','ORDER BY']:
                formatted.append_items('\n',' '*(margin+1),word)
                levels.push('by')

            elif keyword == 'HAVING':
                formatted.append_items('\n',' '*(margin),word)

            elif keyword == 'AND':
                if last_keyword == 'BETWEEN':
                    margin = formatted.get_pos_of_previous_keyword(last_keyword, 1)
                elif levels.peek() == 'case':
                    margin = margin - 2

                formatted.append_items('\n',' '*(margin+3),word)

            elif keyword == 'JOIN':
                formatted.append_items(' ',word,'\n',' '*(margin+6))

            elif keyword == 'ON':
                levels.push('on')
                formatted.append_items(' ',word,' ')
                margins.push(formatted.get_current_pos()-7)

            # parenthesis
            elif keyword == '(':
                if peek_next_keyword() == 'SELECT':
                    levels.push('sub')
                    formatted.append_items(' ',word)
                else:
                    levels.push('function')
                    formatted.append(word)

            elif keyword == ')':
                if levels.pop() == 'sub':
                    formatted.append_items('\n',' '*(margin-1))
                    margins.pop()

                formatted.append(word)

            # end of sql
            elif keyword == ';':
                formatted.append_items('\n',word)

                levels.clear()
                margins.clear()

            # comment open
            elif keyword == '/*':
                formatted.append_items(' ',word)
                levels.push('comment')

            elif keyword == ',':
                if not levels.empty() and levels.peek() in ['function', 'by']:
                    formatted.append(word)
                else:
                    formatted.append_items('\n',' '*(margin),word)

            # case - when - end
            elif keyword == 'CASE':
                levels.push('case')
                margins.push(formatted.get_current_pos(5))
                formatted.append_items(' ',word)

            elif keyword == 'WHEN':
                if last_keyword == 'CASE':
                    formatted.append_items(' ',word)
                else:
                    formatted.append_items('\n',' '*(margin),word)

            elif keyword == 'END':
                if levels.peek() == 'case':
                    levels.pop()
                    margin = margins.pop()-8

                formatted.append_items('\n',' '*(margin+4),word)

            # others
            else:
                if last_keyword != '(':
                    formatted.append(' ')
                formatted.append(word)

            # update last_keyword
            if is_reserved_word(word):
                last_keyword = word.upper()

        self.sql = ''.join(formatted)
        return self.sql


class dq(deque):

    def get_pos_of_previous_keyword(
          self,
          keyword: str,
          offset: int = 0
        ) -> int:
        """return index of previous line's keyword"""

        for i in range(len(self)-1,0,-1):
            if self[i] == '\n':
                #return ''.join(list(self)[i:]).upper().find(keyword) + offset
                pos = ''.join(list(self)[i+1:]).upper().find(keyword) + offset
                if pos > 0:
                    return pos

        return 0 + offset


    def get_current_pos(
          self,
          offset: int = 0
        ) -> int:
        """return the last position of the current line"""

        for i in range(len(self),0,-1):
            if self[i-1] == '\n':
                return len(''.join(list(self)[i-1:])) + offset
        return 0 + offset


    def append_items(self, *items):
        for item in items:
            self.append(item)


    def empty(self):
        return len(self) == 0


class stack:

    def __init__(self):
        self.s = []


    def push(self, item):
        self.s.append(item)


    def pop(self):
        return self.s.pop(-1)


    def peek(self):
        return self.s[-1]


    def empty(self):
        return len(self.s) == 0


    def clear(self):
        self.s = []