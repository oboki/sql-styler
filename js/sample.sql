create table create_some_table stored as parquet as /* create select from join */
select a.cstno
     , a.acno
     , a.acco_bal
     , a.bbpr_ctnt
     , b.cnt
     , b.max_tx_amt
     , case when b.cnt > 0 and b.max_tx_amt > 0 then 'A' -- reserved words: SELECT, FROM, JOIN
            when b.cnt > 0 and b.max_tx_amt < 0 then 'B'
            when b.cnt < 0 and b.max_tx_amt > 0 then 'C' /* multi-line comment
                                                            multi-line comment
                                                            multi-line comment
                                                          */
            when b.cnt < 0 and b.max_tx_amt < 0 then 'D'
                                                else (select a.k_1
                                                        from (select a.k_1, a.k_2, max(a.col) as max_col
                                                                from tab_d a inner join
                                                                     tab_f b on (a.k_1 = b.k_1
                                                                             and a.k_2 = b.k_2
                                                                             and a.k_3 = b.k_3
                                                                             and a.k_4 = b.k_4
                                                                             )
                                                               group by a.k_1, a.k_2
                                                             ) a
                                                       where a.max_col > 120
                                                     )
       end some_case
  from (select a.cstno
             , a.acno /*end*/
             , a.acco_bal
             , b.bbpr_ctnt -- double-dashed comment
          from tab_a a inner join
               tab_b b on (a.cstno = b.cstno
                       and b.base_dt = '2021024') left outer join
               (select a,b,c,d,e, max(v), avg(v), min(v), count(1)
                  from tab_e a
                 group by 1,2,3,d,e
               ) c on (a.cstno = c.a)
         where a.col_1 >= 'filter' /* comment */
           and b.col_2 between 'fil' and 'ter'
       ) a left outer join
       (select a.cstno
             , count(1) as cnt
             , max(tx_amt) as max_tx_amt
          from tab_c a
         where a.tx_dt >= 'filter'
         group by a.cstno
        having count(1) > 0
       ) b on (a.cstno = b.cstno)
 order by 1,2
;