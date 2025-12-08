// import { PerkType } from "../enums/perk-type.enum";
// import { Perk } from "../interfaces/perk.interface";
//
// export const mockPerks: Perk[] = [
//   {
//     title: "Рамстор",
//     latitude: 41.9919017,
//     longitude: 21.4266878,
//     type: PerkType.GROCERY_STORE,
//     openingHours: "Mo-Sa 08:00-22:00; Su 10:00-20:00"
//   },
//   {
//     title: "Пелистер",
//     latitude: 41.9953401,
//     longitude: 21.4314898,
//     type: PerkType.RESTAURANT,
//     openingHours: "Mo-Th 07:00-00:00; Fr-Sa 07:00-01:00; Su 10:30-00:00"
//   },
//   {
//     title: "SP Planet",
//     latitude: 42.0068279,
//     longitude: 21.3649348,
//     type: PerkType.GROCERY_STORE
//   },
//   {
//     title: "Маркет Виврест",
//     latitude: 41.9943861,
//     longitude: 21.4118736,
//     type: PerkType.GROCERY_STORE
//   },
//   {
//     title: "Маркет Авела",
//     latitude: 41.9941366,
//     longitude: 21.411684,
//     type: PerkType.GROCERY_STORE
//   },
//   {
//     title: "Unknown Grocery Store 1",
//     latitude: 41.9943247,
//     longitude: 21.4119774,
//     type: PerkType.GROCERY_STORE
//   },
//   {
//     title: "Бифе Челик",
//     latitude: 41.9936863,
//     longitude: 21.4116647,
//     type: PerkType.RESTAURANT,
//     openingHours: "Mo-Sa 08:00-21:30"
//   },
//   {
//     title: "Тинекс Ѓорче Петров",
//     latitude: 42.0070862,
//     longitude: 21.3634616,
//     type: PerkType.GROCERY_STORE,
//     openingHours: "Mo-Sa 08:00-22:00; Su 08:00-20:00"
//   },
//   {
//     title: "Интермецо",
//     latitude: 41.9947432,
//     longitude: 21.4140669,
//     type: PerkType.RESTAURANT
//   },
//   {
//     title: "Benneton",
//     latitude: 41.9948867,
//     longitude: 21.4232268,
//     type: PerkType.COFFEE_SHOP
//   },
//   {
//     title: "AMG",
//     latitude: 41.9948604,
//     longitude: 21.4230113,
//     type: PerkType.COFFEE_SHOP
//   },
//   {
//     title: "Strip",
//     latitude: 41.9955693,
//     longitude: 21.4253358,
//     type: PerkType.COFFEE_SHOP
//   },
//   {
//     title: "UNKOWN_GROCERY_STORE2",
//     latitude: 41.9993948,
//     longitude: 21.4394478,
//     type: PerkType.GROCERY_STORE
//   },
//   {
//     title: "Журнал",
//     latitude: 41.9768256,
//     longitude: 21.4438183,
//     type: PerkType.RESTAURANT
//   },
//   {
//     title: "Fresh Kantina",
//     latitude: 42.0051951,
//     longitude: 21.4081572,
//     type: PerkType.COFFEE_SHOP
//   },
//   {
//     title: "Hedi's Market 657",
//     latitude: 41.9947806,
//     longitude: 21.5045452,
//     type: PerkType.GROCERY_STORE,
//     openingHours: "Mo-Su 07:30-21:00"
//   },
//   {
//     title: "UNKOWN_GROCERY_STORE3",
//     latitude: 41.9982073,
//     longitude: 21.5009052,
//     type: PerkType.GROCERY_STORE
//   },
//   {
//     title: "Hunter’s Lodge “Kamnik”",
//     latitude: 42.0072516,
//     longitude: 21.4871217,
//     type: PerkType.RESTAURANT
//   },
//   {
//     title: "нола Бар",
//     latitude: 41.9947703,
//     longitude: 21.4138028,
//     type: PerkType.BAR,
//     openingHours: "Mo-Fr 09:00-24:00; Sa,Su 00:00-01:00,09:00-24:00"
//   },
//   {
//     title: "Веро",
//     latitude: 41.9845218,
//     longitude: 21.4688286,
//     type: PerkType.GROCERY_STORE,
//     openingHours: "Mo-Sa 08:00-22:00"
//   },
//   {
//     title: "Под Кале",
//     latitude: 42.0047876,
//     longitude: 21.4307036,
//     type: PerkType.RESTAURANT
//   },
//   {
//     title: "UNKOWN_BAR_1",
//     latitude: 41.9951932,
//     longitude: 21.4345539,
//     type: PerkType.BAR
//   },
//   {
//     title: "Кај Џино",
//     latitude: 41.9943261,
//     longitude: 21.4342799,
//     type: PerkType.RESTAURANT,
//     openingHours: "Mo 08:00-24:00, Tu,We,Fr,Sa 09:00-24:00, Th 09:00-23:00, Su 09:00-01:00"
//   },
//   {
//     title: "Плаза де Торос",
//     latitude: 41.9952456,
//     longitude: 21.4350117,
//     type: PerkType.RESTAURANT
//   },
//   {
//     title: "Веро 7",
//     latitude: 41.9947502,
//     longitude: 21.4345769,
//     type: PerkType.GROCERY_STORE,
//     openingHours: "08:00-22:00"
//   },
//   {
//     title: "Caffe Skopje",
//     latitude: 41.9952588,
//     longitude: 21.4309529,
//     type: PerkType.COFFEE_SHOP,
//     openingHours: "Mo-Su 08:00-23:00"
//   },
//   {
//     title: "9",
//     latitude: 41.9934306,
//     longitude: 21.4162239,
//     type: PerkType.COFFEE_SHOP
//   },
//   {
//     title: "UNKOWNBAR_2",
//     latitude: 41.9931627,
//     longitude: 21.4158549,
//     type: PerkType.BAR
//   },
//   {
//     title: "Bistro Opera Pub",
//     latitude: 41.9984414,
//     longitude: 21.4373453,
//     type: PerkType.COFFEE_SHOP,
//     openingHours: "24/7"
//   },
//   {
//     title: "Мартини",
//     latitude: 42.0031973,
//     longitude: 21.400023,
//     type: PerkType.COFFEE_SHOP
//   },
//   {
//     title: "Бугати",
//     latitude: 42.0047028,
//     longitude: 21.4159604,
//     type: PerkType.COFFEE_SHOP
//   },
//   {
//     title: "Tinex",
//     latitude: 41.9925332,
//     longitude: 21.4370214,
//     type: PerkType.GROCERY_STORE,
//     openingHours: "Mo-Fr 08:00-21:30; Sa 08:00-22:00; Su,PH off"
//   },
//   {
//     title: "Tinex",
//     latitude: 41.9903083,
//     longitude: 21.411176,
//     type: PerkType.GROCERY_STORE
//   },
//   {
//     title: "Енрико",
//     latitude: 42.0031464,
//     longitude: 21.3995191,
//     type: PerkType.RESTAURANT
//   },
//   {
//     title: "UNKOWN_KINDERGARDEN_1",
//     latitude: 42.0387406,
//     longitude: 21.4242968,
//     type: PerkType.KINDERGARDEN
//   },
//   {
//     title: "ООУ „Свети Климент Охридски“ - Бутел",
//     latitude: 42.0401876,
//     longitude: 21.445394,
//     type: PerkType.MIDDLE_SCHOOL
//   },
//   {
//     title: "Музичко-балетско училиште „Илија Николовски - Луј“",
//     latitude: 41.9983639,
//     longitude: 21.4355617,
//     type: PerkType.MIDDLE_SCHOOL
//   },
//   {
//     title: "Prince",
//     latitude: 42.0197651,
//     longitude: 21.4350123,
//     type: PerkType.GROCERY_STORE
//   },
//   {
//     title: "Prince",
//     latitude: 42.0198926,
//     longitude: 21.4349372,
//     type: PerkType.RESTAURANT
//   },
//   {
//     title: "Две капки",
//     latitude: 42.0028178,
//     longitude: 21.3925931,
//     type: PerkType.RESTAURANT
//   },
//   {
//     title: "иВ",
//     latitude: 41.9869006,
//     longitude: 21.4368796,
//     type: PerkType.RESTAURANT
//   },
//   {
//     title: "Партенија Зографски",
//     latitude: 41.982566,
//     longitude: 21.4363017,
//     type: PerkType.MIDDLE_SCHOOL
//   },
//   {
//     title: "UNKOWN_BAR_3",
//     latitude: 41.9932121,
//     longitude: 21.441755,
//     type: PerkType.BAR
//   },
//   {
//     title: "Клуб Капан Ан",
//     latitude: 42.0001669,
//     longitude: 21.4369808,
//     type: PerkType.BAR
//   },
//   {
//     title: "Туpиcт",
//     latitude: 42.0003099,
//     longitude: 21.4367576,
//     type: PerkType.RESTAURANT
//   },
//   {
//     title: "Жито Маркети",
//     latitude: 41.9864614,
//     longitude: 21.4676134,
//     type: PerkType.GROCERY_STORE,
//     openingHours: "Mo-Sa 07:30-21:00"
//   },
//   {
//     title: "UNKOWN_RESTAURANT_1",
//     latitude: 42.0064872,
//     longitude: 21.3510028,
//     type: PerkType.RESTAURANT
//   },
//   {
//     title: "Жито Маркет",
//     latitude: 42.0046326,
//     longitude: 21.5033827,
//     type: PerkType.GROCERY_STORE
//   },
//   {
//     title: "Кафе Змија",
//     latitude: 42.0009888,
//     longitude: 21.417262,
//     type: PerkType.COFFEE_SHOP
//   },
//   {
//     title: "Кафе Филипос",
//     latitude: 42.0007963,
//     longitude: 21.4175044,
//     type: PerkType.COFFEE_SHOP
//   },
//   {
//     title: "Градинка Мирче Ацев",
//     latitude: 42.0183708,
//     longitude: 21.3558666,
//     type: PerkType.KINDERGARDEN
//   },
//   {
//     title: "Топаз",
//     latitude: 41.9979155,
//     longitude: 21.4122694,
//     type: PerkType.RESTAURANT
//   },
//   {
//     title: "Веки",
//     latitude: 42.000855,
//     longitude: 21.3989291,
//     type: PerkType.RESTAURANT
//   },
//   {
//     title: "Чешма",
//     latitude: 41.9841333,
//     longitude: 21.4390455,
//     type: PerkType.RESTAURANT
//   },
//   {
//     title: "UNKOWN_RESTAURANT_2",
//     latitude: 41.983244,
//     longitude: 21.4391421,
//     type: PerkType.RESTAURANT
//   },
//   {
//     title: "Ресторан Трпеза",
//     latitude: 41.9710708,
//     longitude: 21.4455687,
//     type: PerkType.RESTAURANT
//   },
//   {
//     title: "Ресторан Кум",
//     latitude: 41.9772623,
//     longitude: 21.4379912,
//     type: PerkType.RESTAURANT
//   },
//   {
//     title: "Игротека Робин Худ",
//     latitude: 41.9824944,
//     longitude: 21.4357786,
//     type: PerkType.KINDERGARDEN
//   },
//   {
//     title: "Рустикана",
//     latitude: 41.9997295,
//     longitude: 21.4078483,
//     type: PerkType.RESTAURANT,
//     openingHours: "Mo-Su 10:00-00:00"
//   },
//   {
//     title: "Долап",
//     latitude: 41.9985008,
//     longitude: 21.415982,
//     type: PerkType.RESTAURANT
//   },
//   {
//     title: "Рептил",
//     latitude: 41.9813069,
//     longitude: 21.4383256,
//     type: PerkType.GROCERY_STORE
//   },
//   {
//     title: "Дом за слепи",
//     latitude: 41.9757689,
//     longitude: 21.4411963,
//     type: PerkType.MIDDLE_SCHOOL
//   },
//   {
//     title: "UNKOWN_GROCERY_STORE4",
//     latitude: 42.0442939,
//     longitude: 21.3535383,
//     type: PerkType.GROCERY_STORE
//   },
//   {
//     title: "Meraklii",
//     latitude: 42.0299906,
//     longitude: 21.3508185,
//     type: PerkType.RESTAURANT
//   },
//   {
//     title: "UNKOWN_RESTAURANT_3",
//     latitude: 42.0069568,
//     longitude: 21.3651275,
//     type: PerkType.RESTAURANT
//   },
//   {
//     title: "Gigo",
//     latitude: 42.0063093,
//     longitude: 21.3655868,
//     type: PerkType.GROCERY_STORE
//   },
//   {
//     title: "Asura Market",
//     latitude: 42.0078582,
//     longitude: 21.3688239,
//     type: PerkType.GROCERY_STORE
//   },
//   {
//     title: "UNKOWN_GROCERY_STORE5",
//     latitude: 42.0079476,
//     longitude: 21.3666436,
//     type: PerkType.GROCERY_STORE
//   },
//   {
//     title: "UNKOWN_GROCERY_STORE6",
//     latitude: 42.0071003,
//     longitude: 21.3681193,
//     type: PerkType.GROCERY_STORE
//   }
// ];
