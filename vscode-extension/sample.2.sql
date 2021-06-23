case
  when b.cnt > 0
  and b.max_tx_amt > 0 then 'A' -- reserved words: SELECT, FROM, JOIN
  when b.cnt > 0
  and b.max_tx_amt < 0 then 'B'
  when b.cnt < 0
  and b.max_tx_amt > 0 then 'C'
  /* multi-line comment
   multi-line comment
   multi-line comment
   */
  when b.cnt < 0
  and b.max_tx_amt < 0 then 'D'
  else (
    select
      a.k_1
    from
      (
        select
          a.k_1,
          a.k_2,
          max(a.col) as max_col
        from
          tab_d a
          inner join tab_f b on (
            a.k_1 = b.k_1
            and a.k_2 = b.k_2
            and a.k_3 = b.k_3
            and a.k_4 = b.k_4
          )
        group by
          a.k_1,
          a.k_2
      ) a
    where
      a.max_col > 120
  )
end some_case