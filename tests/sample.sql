insert into target_tab ( monthly , a , max_b , max_c , sum_cnt , some_case )
select from_timestamp(from_utc_timestamp(from_unixtime(cast(dttm/1000 as bigint)),'ROK'),'yyyy-mm') as monthly
     , a.a /* double-dashed comments will be replaced like C-style comments. */
     , max(a.b) as max_b /**
                          * multi
                          * line
                          * comments
                          * will be compressed into single-line.
                          */
     , max(a.c) as max_c
     , sum(b.cnt) as sum_cnt
     , nvl(cast(max(case when a.cnt > 0 and b.max_v > 0 then 'A'
                         when a.cnt > 0 and b.max_v < 0 then 'B'
                         when a.cnt < 0 then 'C'
                         when a.cnt < 0 then 'D'
                                        else (select max(case when a.k_1 is null then 'A'
                                                              when a.k_1 > 'V' then 'A'
                                                                               else 'B'
                                                         end) as v
                                                from (select a.k_1
                                                           , a.k_2
                                                           , max(a.col) as max_col
                                                        from tab_d a inner join
                                                             tab_f b on (a.k_1 = b.k_1
                                                                     and a.k_2 = b.k_2
                                                                     and a.k_3 = b.k_3
                                                                     and a.k_4 = b.k_4)
                                                       group by a.k_1, a.k_2
                                                     ) a
                                               where a.max_col > 120 and a.type in (select type from tab_t)
                                                 and a.type in ('A','B','C','D')
                                             )
                    end) as STRING) ,'') as some_case
  from (select a.k /* SELECT , FROM , WHERE , ... , JOIN: Reserved words in comments are treated as comments. */
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
       ) a left outer join
       (select a.k
             , max(v) as max_v
          from tab_c a
         where a.d >= 'filter'
         group by a.k
        having count(1) > 0
       ) b on (a.k = b.k)
 group by 1, 2
 order by 1, 2
;
