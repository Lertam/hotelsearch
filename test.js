// const getHotelInfo = ids => new Promise((resolve, reject) => {
//     const baseUrl = "https://partner.ostrovok.ru";
//     let url = `${baseUrl}/api/affiliate/v2/hotel/list?data=${JSON.stringify({ ids })}`
//     var settings = {
//         "method": "GET",
//         "username":"2545",
//         "password": "da7bdbcb-4179-4139-ace9-d63e66b345db",
//         "timeout": 0,
//         url
//     };
//     $('body').append('<div id="hotels"></div>');
//     // ids.map(id => $('#hotels').append(`<div id="hotel-${ id }"><h3>${id}</h3><img alt="${id}" />`));
//     $.ajax(settings).done(response => {
        
//         response.result.map(hotel => {
//             $('#hotels').append(`<div id="hotel-${ hotel.id }"><h3>${hotel.name}</h3><p>${hotel.clean_address}</p><img alt="${hotel.name}" />`);
//             $(`#hotel-${hotel.id} img`).attr('src', hotel.thumbnail);
//         });
//     });

// });

// // let ids = ["aerootel_domodedovo", "airhotel_express", "alma_hotel_12", "armega_hotel", "atlas_park", "bridzh", "dasn_hall_guest_house", "deltafly_hotel", "diamant_3", "domodedovo_hotel", "domodedovo_park_hotel", "dzhungli_hotel_suburban_club_ivengo", "fat_cat_hotel_domodedovo", "gorki_aparthotel", "gostevoi_dom_domodedovo", "gostevoj_dom_blisson", "gostevoj_dom_na_rechnoj", "gostinitsa_eleon_domodedovo", "gostinitsa_ierusalimskaia", "green_park_hotel_12", "guest_house_miya", "hostelyirus_domodedovo", "hotel_aleksandriyadomodedovo", "hotel_marina_40", "hotel_tsvetochnaya_24", "hoteljet_apartments", "hoteljet_cottages", "hoteljet_minihotel", "ibis_moscow_domodedovo_airport", "korobovo_mini_hotel", "kotlyakova_plaza", "magnit_hotel_2", "marina_13", "master_otel_domodedovo", "medovo_hauz", "medovo_hauz_minihotel", "meridian_domodedovo", "miniotel_1i_kvartal_206", "miniotel_noi_domodedovo", "nabat_palace_hotel", "otel_1_guest_house", "planernaya_minihotel", "tatyana_hotel", "the_best_day_club", "v_domodedovo_hotel", "vanil_hotel", "vostryakovo_guest_house", "vzlyotnaya", "zolotaya_7", "zolotaya_7_hotel", "zolotaya_ryibka_guest_house_4", "zolotoy_sazan_", "zvyozdnaya_hotel"];
// let ids = ["minihotel_na_uritskogo_14", "miniotel_diana", "otel_palazzo", "uiut_8"];
// console.log(ids.length);
// // getHotelInfo(ids);

let arr = [];
for(i=1;i<300;i++) {
    arr.push(i);
}
while(arr.length > 0) {
    console.log(arr.splice(0, 100));
}