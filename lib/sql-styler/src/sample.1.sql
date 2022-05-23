  select a.k /* SELECT , FROM , WHERE , ... , JOIN: Reserved words in comments are treated as comments. */
       , b.v
       , c.max_v
       , c.avg_v
       , c.min_v
       , c.cnt
    from tab_a a inner join
         tab_b b on (a.k = b.k
                 and b.d = 'dd') left outer join /*+ shuffle */
         (select a.k
               , max(b.v) as max_v
               , avg(c.v) as avg_v
               , min(d.v) as min_v
               , count(e.v) as cnt
            from tab_e a inner join
                 tab_f b on a.k = b.k left outer join
                 tab_g c on a.k = c.k left outer join
                 tab_h d on a.k = d.k left outer join
                 tab_i e on a.k = e.k
           group by a
         ) c on (a.c = c.a)
   where a.col_1 >= 'filter' /* comment */
     and b.col_2 between 'fil'
                     and 'ter'