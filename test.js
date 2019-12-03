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
                "first_name": "Whitelist",
                "last_name": "Ostrovok"
            }
        ],
        rooms: [
            {
                guests: [
                    {
                        "first_name": "Whitelist",
                        "last_name": "Ostrovok"
                    }
               ]
            }
        ],
        partner_order_id: `${Math.random()}`.replace('.', ''),
        payment_type: {
            is_need_credit_card_data:true,
            is_need_cvc:true,
            type:"now"
        },
        phone: '79997198036',
        user_ip: '84.53.198.229',
        ret_path: 'http://localhost/test.html',
        credit_card: {
            e_year: "23",
            card_holder: "KONSTANTIN KHRYKIN",
            card_number: "5536913781155979",
            secure_code: "496",
            e_month: "08"
          },
    };
    $.ajax({
        timeout: 0,
        url: `/api.php?action=actualize&hotel_id=test_hotel&data=${JSON.stringify({checkin: '2019-12-12', checkout: '2019-12-13'})}`
    }).done(actResp => {
        console.log(actResp.result);
        let min = 9999999;
        actResp.result.hotels[0].rates.forEach(rate => {
            if(parseInt(rate.rate_price) < min) {
                min = parseInt(rate.rate_price);
                req.book_hash = rate.book_hash;
            }
        });
        $.ajax({
            url: `/api.php?action=reserve`,
            headers: {"Content-Type": "application/json"},
            method: 'POST',
            data: JSON.stringify(req)
        }).done(resp=>{
            console.log(resp);
            if(resp.debug.status == 200) {
                // Success request
                let checker = setInterval(() => {
                    $.ajax({
                        ...settings,
                        url: `/api.php?action=status&data=${JSON.stringify({partner_order_id: resp.result.partner_order_id})}`,
                        "method": "GET",
                        // data: JSON.stringify({partner_order_id: id})
                    }).done(res=> {
                        let status = res.result.status;
                        console.log(status);
                        if(status == '3ds') {
                            console.log(res.result.pay_data3ds);
                            data = res.result.pay_data3ds;
                            output = `<form method="${data.method}" target="_blank" action="${data.action_url}">
                            <input hidden name="${data.pareq.name}" value="${data.pareq.value}" />
                            <input hidden name="${data.termurl.name}" value="${data.termurl.value}" />
                            <input hidden name="${data.md.name}" value="${data.md.value}" />
                            <p>Для прохождения оплаты картой необходимо пройти 3-D-защиту. Вы будете переадресованы на сайт банка, выпустившего вашу карту.</p>
                            <button type="submit">Пройти</button>
                          </form>`;
                          $('body').append(output);
                            clearInterval(checker);
                        }
                    });
                }, 5000);
            }
        });
    });
});