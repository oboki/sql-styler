  select a.k
       , b.v
       , c.max_v
    from (select a.k
               , max(b.v) as max_v
            from tab_e a
           group by a
         ) c
   where a.col_1 >= 'filter'
;