$(document).ready(() => {
    const baseUrl= 'https://partner.ostrovok.ru'
    let settings = {
        "method": "GET",
        "username":"2545",
        "password": "da7bdbcb-4179-4139-ace9-d63e66b345db",
        "timeout": 0,
    }
    let req = {
        book_hash : "h-1f1d1505-6bf8-56aa-95c0-80875e06baae",
        email: "ion.vkid@gmail.com",
        guests: [
            {
                "first_name": "Ostrovok",
                "last_name": "Ostrovok"
            }
        ],
        rooms: [
            {
                guests: [
                    {
                        "first_name": "Ostrovok",
                        "last_name": "Ostrovok"
                    }
               ]
            }
        ],
        partner_order_id: `${Math.random()}`.replace('.', ''),
        payment_type: {
            amount: "2.00",
            by: "credit_card",
            currency_code:"RUB",
            is_need_credit_card_data:true,
            is_need_cvc:true,
            type:"now",
            vat_value:"0.00",
            vat_included:false,
            tax_data:{
                taxes:[{
                    trans_key:"RU;vat;vat",
                    included_by_supplier:true,
                    amount:"0.33",
                    currency_code:"RUB"
                }]
            },
            perks:{}
        },
        phone: '79123456789',
        user_ip: '82.29.0.86',
        ret_path: '/test.html',
        credit_card: {
            e_year: "50",
            card_holder: "JOHN DOE",
            card_number: "4276380123227162",
            secure_code: "999",
            e_month: "11"
          },
    };
    const checkStatus = id => {
        $.ajax({
            ...settings,
            url: `${baseUrl}/api/affiliate/v2/order/status`,
            "method": "POST",
            data: JSON.stringify({partner_order_id: id})
        }).done(res=>console.log(res));
    }
    
    $.ajax({
        url: `${baseUrl}/api/affiliate/v2/hotelpage/test_hotel?data=${JSON.stringify({checkin: '2019-12-12', checkout: '2019-12-13'})}`,
        method: 'GET'
    }).done(resp1 => {
        req.book_hash = resp1.result.hotels[0].rates[0].book_hash
        $.ajax({
            url: `${baseUrl}/api/affiliate/v2/order/reserve`,
            method: 'POST',
            data: JSON.stringify(req)
        }).done(resp=>{
            console.log(resp);
            if(resp.debug.status == 200) {
                // Success request
                setTimeout(() => {
                    checkStatus(resp.result.partner_order_id);
                }, 5000);
            }
        });
    });
});