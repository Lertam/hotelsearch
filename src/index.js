import Search from './Search';
if($ === undefined) throw new Error('JQuery is undefined.');
let search = new Search();

// let data = {"group":{"amenities":{},"image_list_tmpl":[{"category":"Sauna","height":752,"src":"https://cdn.ostrovok.ru/t/{size}/ext/44/60/44601e09a4bc7163a23b4ecf44b65564a687fe05.jpeg","src_secure":"https://cdn.ostrovok.ru/t/{size}/ext/44/60/44601e09a4bc7163a23b4ecf44b65564a687fe05.jpeg","width":989},{"category":"Guestroom","height":682,"src":"https://cdn.ostrovok.ru/t/{size}/ext/88/8d/888dd520c0d1030a9996897b33e273c0372a6b5e.jpeg","src_secure":"https://cdn.ostrovok.ru/t/{size}/ext/88/8d/888dd520c0d1030a9996897b33e273c0372a6b5e.jpeg","width":1023},{"category":"Sauna","height":680,"src":"https://cdn.ostrovok.ru/t/{size}/ext/0d/8d/0d8d01e27f4ab9ad8ad2d6ce86f5dc7b47f41c2f.jpeg","src_secure":"https://cdn.ostrovok.ru/t/{size}/ext/0d/8d/0d8d01e27f4ab9ad8ad2d6ce86f5dc7b47f41c2f.jpeg","width":1024}],"name":"Стандартный номер с различными типами кроватей","name_struct":{"bedding_type":"с различными типами кроватей","main_name":"Стандартный номер"},"ota_room_amenity_data":["blackout-blinds","mini-bar","mirror","private-bathroom","sofa","washing-machine"],"parent_room_group_id":11,"room_group_id":11,"thumbnail_tmpl":"https://cdn.ostrovok.ru/t/{size}/ext/44/60/44601e09a4bc7163a23b4ecf44b65564a687fe05.jpeg","prices":[205,216,242,254],"minPrice":205},"rate":{"availability_hash":"s-1cb2774b-cb3b-5e74-b416-cce151780e6f","available_rooms":null,"bed_places":{"child_cot_count":0,"extra_count":0,"main_count":1,"shared_with_children_count":0},"bed_types":[],"book_hash":"h-a730cbad-1abf-55bb-bfae-2d877a98d57a","cancellation_info":{"free_cancellation_before":"2019-12-18T19:59:00","policies":[{"start_at":null,"end_at":"2019-12-18T19:59:00","penalty":{"amount":"0.00","percent":"0","currency_code":"RUB","currency_rate_to_rub":"1.00"}},{"start_at":"2019-12-18T19:59:00","end_at":null,"penalty":{"amount":"254.00","percent":"100","currency_code":"RUB","currency_rate_to_rub":"1.00"}}]},"daily_prices":["254.00"],"hotelpage":"https://ostrovok.ru/rooms/test_hotel_do_not_book/?cur=RUB&dates=19.12.2019-20.12.2019&guests=0&lang=ru&partner_slug=1563.affiliate.fbed&request_id=&room=s-1cb2774b-cb3b-5e74-b416-cce151780e6f&scroll=prices&utm_campaign=ru-ru&utm_medium=api2&utm_source=1563","meal":"nomeal","images":[],"non_refundable":null,"payment_options":{"payment_types":[{"amount":"100.00","by":null,"currency_code":"HNL","is_need_credit_card_data":false,"is_need_cvc":false,"type":"hotel","vat_value":"0.00","vat_included":false,"tax_data":{"taxes":[{"trans_key":"HN;service_fee;service_fee","included_by_supplier":true,"amount":"8.70","currency_code":"RUB"},{"trans_key":"HN;vat;vat","included_by_supplier":true,"amount":"32.00","currency_code":"RUB"}]},"perks":{}}]},"rate_currency":"RUB","rate_price":"254.00","bar_rate_price_data":null,"room_amenities":[],"room_description":"","room_group_id":11,"room_name":"Стандартный номер (2 отдельные кровати)","room_size":null,"room_type_id":"#double-capacity #non-smoking #private-bathroom #room #standard #twin #window","serp_filters":["has_bathroom"],"smoking_policies":null,"taxes":[],"value_adds":[],"sell_price_limits":null,"ind":6},"phone":"89997198036","email":"ion.vkid@gmail.com","rooms":[{"guests":[{"first_name":"KONSTANTIN","last_name":"KHRYKIN"}]}],"credit_card":{"e_year":22,"card_holder":"MAX SMITH","card_number":"4863 2178 3552 3406 ","secure_code":"430","e_month":12}};
// let params = {
//     partner_order_id: `${Math.random()}`.replace('.', ''),
//     credit_card: {
//         ...data.credit_card,
//         card_number: data.credit_card.card_number.replace(' ','')
//     },
//     phone: data.phone,
//     email: data.email,
//     user_ip: "", // TODO: Apply it in backend
//     ret_path: "http://365-travels.ru/finish.html",
//     payment_type: {
//         "type": "now",
//         "is_need_credit_card_data": true,
//         "is_need_cvc": true
//     },
//     guests: [],
//     rooms: data.rooms,
//     book_hash: data.rate.book_hash,
// }

// data.rooms.forEach(room => {
//     room.guests.forEach(guest => params.guests.push(guest))
// });
// $.ajax({
//     url: `/api.php?action=reserve`,
//     headers: {"Content-Type": "application/json"},
//     method: 'POST',
//     data: JSON.stringify(params)
// }).done(resp=>{
//     console.log(resp);
//     if(resp.debug.status == 200) {
//     }
// });