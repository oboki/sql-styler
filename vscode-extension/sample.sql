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
            and a.k_5 = truncate(b.k_5)
          )
        group by
          a.k_1,
          a.k_2
      ) a
    where
      a.max_col > 120