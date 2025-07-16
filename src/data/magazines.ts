export interface Issue {
  title: string;
  fileId: string;
}
export interface Editor {
  title: string;
  issues: Issue[];
}
export interface Magazine {
  manager: string;
  editors: Editor[];
}

export const magazines: Magazine[] = [
    {
        manager: "فرهاد فرنود",
        editors: [
          {
            title: "شورای سردبیری",
            issues: [
              { title: "پیش‌شماره اول", fileId: "1sdqz2-Pya2nDM3QdJyv2cyIzAvcWyqMQ" }
            ]
          }
        ]
      },
      {
        manager: "محمد رسولی",
        editors: [
          {
            title: "",
            issues: [
              { title: "شماره ۱ (اسکن)", fileId: "1ZRzj8KklykiqQTnkx7WjBvjYe7Dfo4w9" }
            ]
          }
        ]
      },
      {
        manager: "علیرضا رضوان‌دوست",
        editors: [
          {
            title: "",
            issues: [
              { title: "شماره ۲", fileId: "1L4dNUtDIJrzOQQJx8EncTim29PgmGTJX" },
              { title: "شماره ؟ (اسکن)", fileId: "12TfkTjZWkJLCepp3_RPyOGcXqeTd9FRo" },
              { title: "شماره ۳", fileId: "11xSEux66_mKH4hjDQybCcbzZOSHpbhPP" },
              { title: "شماره ۴", fileId: "" },
              { title: "شماره ۵ (اسکن)", fileId: "1r-YveOXDSOpurT9aUtf2FrO_t9vBQqNl" },
              { title: "شماره ۶", fileId: "1bVT-KjEF_uxxn8t_IF73Ew9PzD7pEyf5" },
              { title: "شماره ۷", fileId: "1pSG-8nu74Hj3HP7SLAwWrXunCgVfQ68m" }
            ]
          },
          {
            title: "شورای سردبیری: بابک بهادری، فاطمه‌السادات میرباقری، سیدامیرحسین موسوی، جواد صالحی",
            issues: [
              { title: "شماره ۸", fileId: "1fg3GN455YpFtudw60_iPl5G3NHeAdUdv" }
            ]
          },
          {
            title: "شورای سردبیری: بابک بهادری، فاطمه‌السادات میرباقری، جواد صالحی سیدامیرحسین موسوی، حمید ملکی",
            issues: [
              { title: "شماره ۹", fileId: "1z4FzfLJ-cZc60-AES31uOG7zBgfI2ShE" }
            ]
          },
          {
            title: "شورای سردبیری",
            issues: [
              { title: "شماره ۱۰ (اسکن)", fileId: "1v1UWtOYmefk55zB46OtB2G-xwDX-exe6" },
              { title: "شماره ۱۱ (اسکن)", fileId: "161HeBfDDvYJc6LZ67EiGHVw9uV4YFIjf" },
              { title: "شماره ۱۱ (اسکن دوم)", fileId: "10KJJdTSMZTn0Zc8_ixxIMgxcuxcHnFs-" },
              { title: "شماره ۱۲", fileId: "1ivnTLcWKlOfw1vW-Jdd780ZHl0bsBNBK" },
              { title: "شماره ۱۳ (اسکن)", fileId: "1ECRqZKLblvtpUFIztSIaxUQ-SvRBiYW-" },
              { title: "ویژه‌نامه ورودی‌های جدید سال ۱۳۸۹", fileId: "1X7P6SKfD5rL7YPQEjQHVV8GQYilsJhWP" },
              { title: "شماره ۱۴", fileId: "1EWWcYn6hBcVXkPo_RVW1SJ3uW9BrEL1n" },
              { title: "شماره ۱۵", fileId: "12Xu0pPa4r1cSz7V8USqk3uhp-pPfuXb8" },
              { title: "شماره ۱۶ (اسکن)", fileId: "1AI_cycI9DwxCaE60sGVUbCa0RAvqhSMz" },
              { title: "شماره ۱۷ صفحه دوم ناموجود", fileId: "1ngZhJ533GKagJWzzRVIT3YIaPGxpoT72" },
              { title: "شماره ۱۸", fileId: "1wV5drUJS0KoGEwgWAXXZYNbCTTV4aL2P" },
              { title: "شماره ۱۹", fileId: "1-wLIJ2E3dvwWpfkuoSoswpL-ykSlYEQY" },
              { title: "شماره ۲۰", fileId: "1418wwmRuXyKzpzwS3Nni2KvVIl-bSzEO" },
              { title: "شماره ۲۱", fileId: "1He89PS1cz4cwW91tcSFq0e419FbbN7eI" },
              { title: "شماره ۲۲", fileId: "1G4HPCf7aaeg-07CjxOlaiyPOpgwm74sS" },
              { title: "شماره ۲۳", fileId: "1MP_FGQ9kuE8l9tuqLmp7k8pUf2wIxu6n" },
              { title: "شماره ۲۴", fileId: "17wuGeCcB37hWjwBaN7ScM974nElfBjW4" },
              { title: "شماره ۲۵", fileId: "1TqQMWvPFVDH6pzTF-iHc-JOOldHhz19J" },
              { title: "ویژه‌نامه ورودی‌های جدید سال ۱۳۹۰ (اسکن)", fileId: "1JEeh0eQGx1vXTyh9Uh3hwzkBU2gybOxW" },
              { title: "شماره ۲۶", fileId: "156lV4pLDK0RS0u_87dbRCfXFk4J4JON8" },
              { title: "شماره ۲۷", fileId: "1aXJU4D_xx3B4e7jy0G8qTmpKcEBZSsOK" },
              { title: "شماره ۲۸", fileId: "1Xj7xoCQUwOt5Hi7NUUi_Q1Z-pzmy-ewu" },
              { title: "شماره ۲۹", fileId: "122WlWH8XyK1QIPoKMVQBOMZ65nJoHIZL" },
              { title: "شماره ۳۰", fileId: "1bcW2DJHZhDF1NhyWQMZ3hpXfEQE4a3T5" },
              { title: "شماره ۳۱", fileId: "1yTOp8ydOEBBGorvke631xSQs9fURdCmg" },
              { title: "شماره ۳۲", fileId: "178FdwCsiGaCLtKCQWN0AHaky1dQo-Gnt" },
              { title: "شماره ۳۳", fileId: "1DHQweOlsj3fZB48si45A8DRyDk8b3Uuq" },
              { title: "شماره ۳۴", fileId: "19aRaz8QG5iFokIbT9yK-yDizGU839Inw" }
            ]
          }
        ]
      },
      {
        manager: "محمد عصاریان نیاسری",
        editors: [
          {
            title: "شورای سردبیری: محمدجواد اکبری، ساسان حاجی‌رضایی، آرمین ساعی",
            issues: [
              { title: "شماره ۳۵", fileId: "10Hpm9OBw3dPliswNKjEcsOl0BuBqogfo" }
            ]
          },
          {
            title: "سردبیر: ساسان حاجی‌رضایی",
            issues: [
              { title: "شماره ۳۶", fileId: "1aAOx8wv5n2CMyCGMLIbec9Ug29HDMhpx" }
            ]
          },
          {
            title: "شورای سردبیری: ساسان حاجی‌رضایی، آرمین ساعی",
            issues: [
              { title: "شماره ۳۷", fileId: "1_pVjHf74cpMj-2ifQY9ogs-Dp-p5Op__" }
            ]
          },
          {
            title: "شورای سردبیری",
            issues: [
              { title: "شماره ۳۸", fileId: "1mguz2TRUvuYWqYpZdXToB967YrjRpenZ" },
              { title: "ویژه‌نامه ورودی ۹۲ (اسکن)", fileId: "1oTeMYkM2cD9nqdgYDQ2jfIbhtIfMOlFS" }
            ]
          },
          {
            title: "سردبیر: ساسان حاجی‌رضایی",
            issues: [
              { title: "شماره ۳۹", fileId: "1yRocFFfBU3vFiUNfjbmgiA9k5SB_dSkN" },
              { title: "شماره ۴۰", fileId: "1RTix3RA9BX-zkN-gr-5PMcr9o_WaGTjj" },
              { title: "شماره ۴۱", fileId: "1fsWjWMBtWgHyrptjd3wzj-TS9OKa3kXN" },
              { title: "شماره ۴۲", fileId: "1Hu0dvG9F0GUZXP86FsSI8YWNGAP83858" }
            ]
          }
        ]
      },
      {
        manager: "مهدی سیلاوی",
        editors: [
          {
            title: "سردبیر: احسان حقی",
            issues: [
              { title: "شماره ۴۳", fileId: "1gpwi0CwFH2vosIceidokNuErk7Tz1C5j" },
              { title: "شماره ۴۴", fileId: "1eTUhITFdZ-z5jK_zV6o1SKgcWOaF8IJL" },
              { title: "شماره ۴۵", fileId: "1xO-_V5SwXCXZQjNLCwjBy5eZSzz55GQX" },
              { title: "شماره ۴۶", fileId: "1HvsZE66219N8E3Y__Ma1o2cCnRUKLPH0" },
              { title: "شماره ۴۷", fileId: "" },
              { title: "شماره ۴۸", fileId: "1vxuw8Gd28IdQMy46GpCD0KorOW61Uy9i" }
            ]
          }
        ]
      },
      {
        manager: "مرتضی ملکیان",
        editors: [
          {
            title: "سردبیر: پویا مصدق",
            issues: [
              { title: "شماره ۴۹", fileId: "11X0y5vSXYBN1hU5w92V7aEnPJ4Gc6oI4" },
              { title: "شماره ۵۰", fileId: "1BuSosKPWBbsbXtAIhArZXgaGSbo2fyQP" },
              { title: "شماره ۵۱", fileId: "1Tzedx9WfPxipboTG6_QTn3e9OHUn1q20" }
            ]
          },
          {
            title: "سردبیر: -",
            issues: [
              { title: "شماره ۵۲", fileId: "1UF2acjFo9Cdzpgqfgsy-GKr8gFOOdT0B" }
            ]
          }
        ]
      },
      {
        manager: "علی‌اکبر مومنی‌ملکشاه",
        editors: [
          {
            title: "سردبیر: امیرمحمد بائو دیزآبادی",
            issues: [
              { title: "شماره ۵۳", fileId: "1Gq7p-B9tKMQZ3_bgR6-GzYqozfXAWRhx" },
              { title: "ویژه‌نامه «سنوات ظالمانه»", fileId: "1FXVIs6grWP8-0w-sE_ijG31Z7jmcWfv2" },
              { title: "شماره ۵۴", fileId: "" },
              { title: "شماره ۵۵", fileId: "" }
            ]
          }
        ]
      },
      {
        manager: "فاطمه امینی",
        editors: [
          {
            title: "سردبیر: فاطمه امینی",
            issues: [
              { title: "شماره ۵۶", fileId: "1hM8Sq6oONCk588yfEWOklLbvS5qrZcMI" },
              { title: "شماره ۵۷", fileId: "1RkFvXXJio4hdFLCaefuDBnsIZm8jFg2v" },
              { title: "شماره ۵۸", fileId: "175j-XKZDv9yMjasl5U_BEbUVJeDXOIHu" },
              { title: "شماره ۵۹", fileId: "1ciGF82g_Vp4CvJ5DJeIEqsBl0F9uQ1nw" },
              { title: "شماره ۶۰", fileId: "19VW0LPVKOQJg_uGYgojHdORRrDbDXWaQ" },
              { title: "شماره ۶۱", fileId: "1zc7P8NWV5oGnU0n5r2fTUn1EJmNStcNs" },
              { title: "شماره ۶۲", fileId: "1P1yJaW3uRR_z40PjBXXBrtMH92uu1sfQ" },
              { title: "شماره ۶۳", fileId: "1YEnqVbGtgx7Ubj2N_EJ1yiYUduEbtxvH" },
              { title: "شماره ۶۴", fileId: "1qhESXmboCkDb7qXR-ma95P5aOfcOgLbf" },
              { title: "شماره ۶۵", fileId: "1xWXoQ8zmmZfTLGe4C52mOBPoBEOaSacN" },
              { title: "شماره ۶۶", fileId: "1qJUz5_QKz9rIeuj1xyCQ9ejMi4F3FcEW" }
            ]
          }
        ]
      },
      {
        manager: "آریا ترابی",
        editors: [
          {
            title: "سردبیر: سینا صفی‌زاده، میترا ملکی",
            issues: [
              { title: "شماره ۶۷", fileId: "177k-eYCmF46GOIHAoQmxxH6VFyw6qLW6" },
              { title: "شماره ۶۸", fileId: "1kXpYeZ9M5l0Gq0i4RtV55LsEBrEo_Dgi" },
              { title: "شماره ۶۹", fileId: "19a1W2peiPvjWkgjI_R1C-5WFKv7tv5hM" }
            ]
          },
          {
            title: "سردبیر: کیمیا نسترن",
            issues: [
              { title: "شماره ۷۰", fileId: "1UfoEnGx2i4jJPVC50TxIueHGfcEd-geN" },
              { title: "توصیه‌نامه و تاریخچه ادوار - جلد اول", fileId: "1FEy1Odh4uPc3jfwVC0h_PbnXlogCHac-" },
              { title: "توصیه‌نامه و تاریخچه ادوار - جلد اول - کم‌حجم", fileId: "1YQte9j1aU-iTloK2aLij6bBwM6bJm6lz" }
            ]
          }
        ]
      }
]; 