import { formatDate, formatMoney, mapMeal } from './Utils';
import valid from 'card-validator';
import RestrictedInput from 'credit-card-input-mask';

export default function ReserveService(hotel={name: 'N/A'}, search_info={}){
    this.stage = 0;
    this.stages = ['Выбор типа номера', 'Выбор тарифа', 'Ввод данных о гостях', 'Проверка данных', 'Оплата', 'Бронирование'];
    this.hotel = hotel;
    this.search_info = search_info;
    this.data = {
        group: null,
        rate: null,
        phone: '',
        email: '',
        rooms: [],
        credit_card: {
            "e_year": '',
            "card_holder": '',
            "card_number": '',
            "secure_code": '',
            "e_month": ''
        }
    }
    this.search_info.guests.map(room => {
        let tmpl = {first_name:'', last_name:'Ostrovok'};
        let res = { guests: [] };
        for(var i=0;i<room.adults;i++) res.guests.push(tmpl);
        for(var i=0;i<room.children.length;i++) res.guests.push(tmpl);
        this.data.rooms.push(res);
    });
    this.availableGroups = [];
    this.hotel.rates.map(rate => {
        let groups = this.hotel.room_groups.filter(group => group.room_group_id === rate.room_group_id);
        if(groups.length > 0) {
            let group = groups[0];
            if(this.availableGroups.filter(av => av.room_group_id === group.room_group_id).length == 0) {
                let minPrice = 9999999;
                this.availableGroups.push({
                    ...group, 
                    prices: [ ...hotel.rates.filter(rt => rt.room_group_id === group.room_group_id).map(rt=> {
                        var price = parseInt(rt.rate_price);
                        if(price<minPrice) minPrice = price;
                        return price;})  ],
                    minPrice
                });
            };
        }
    });
    this.renderTitle = () => {
        if(this.stage == -1) $('#modalReserveTitle').hide();
        else $('#modalReserveTitle').show();
        $('#modalReserveTitle').html(`${hotel.name}. Шаг ${this.stage + 1} "${this.stages[this.stage]}".`);
        
    }
    this.renderCancellationInfo = info => {
        if(!!info.free_cancellation_before) {
            // has free cancellation
            return 'Бесплатная отмена до '+ formatDate(info.free_cancellation_before);
        }
        return '';
    }
    this.renderRate = (rate, rateInd, useButton = false, selected = false) => {
        return `
            <div class="card col-12 container-fluid${selected ? ' border-success' : ''}">
                <div class="row">
                    <div class="col-12 card-body">
                        <h5 class="card-title">${rate.room_name}</h5>
                        <p class="card-text">Стоимость - ${formatMoney(rate.rate_price)}</p>
                        <p>${mapMeal(rate.meal)}</p>
                        <p>${this.renderCancellationInfo(rate.cancellation_info)}</p>
                        ${ rate.payment_options.payment_types[0].is_need_credit_card_data ? '<p>Для бронирования нужна банковская карта.</p>' : '' }
                        ${ useButton ? `<div class="text-right">
                            <button class="btn ${ selected ? 'btn-success' : 'btn-primary' } select" data-id=${rateInd}>${ selected ? 'Выбрано' : 'Выбрать'}</button>
                        </div>` : '' }
                    </div>
                </div>
            </div>`;
    }
    this.mapKey = key => {
        switch(key) {
            case 'first_name':
                return 'Имя';
            case 'last_name':
                return 'Фамилия';
            default:
                return key;
        }
    }
    this.renderField = (name, value, placeholder='') => {
        return `<div class="col-12 col-sm-6">
            <input type="text" class="form-control" value="${value}" data-name="${name}" placeholder="${placeholder}" />
        </div>`;
    }
    this.renderStage = () => {
        let output = '';
        if(this.stage === -1) {
            output = `<div class="col-12 container-fluid stage--1">
            <div class="row">
                <div class="col-12"><h4>Похоже, в этом отеле нет доступных предложений...</h4></div>
            </div>
            
        </div>`;
        } else if(this.stage === 0) {
            this.availableGroups.map((rate, rateInd) => {
                let images_output = '';
                let images = this.hotel.room_groups.filter(group => group.room_group_id === rate.room_group_id)[0].image_list_tmpl;
                if(images.length > 0) {
                    images_output = `
                        <div class="carousel" data-ride="carousel">
                            <div class="carousel-inner">
                                ${images.map((img, ind) => `<div class="carousel-item${ ind == 0 ? ' active' : ''}">
                                        <img class="d-block w-100" src="${img.src_secure.replace('{size}', 'x220')}">
                                    </div>`
                                )}
                            </div>
                            <a class="carousel-control-prev" href="#carouselExampleControls" role="button" data-slide="prev">
                                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span class="sr-only">Previous</span>
                            </a>
                            <a class="carousel-control-next" href="#carouselExampleControls" role="button" data-slide="next">
                                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                <span class="sr-only">Next</span>
                            </a>
                        </div>
                    `;
                } else {
                    images_output = `<div class="text-center">Фото отсутствуют</div>`;
                }
                let selected = (this.data.group !== null && this.data.group.room_group_id == rate.room_group_id);
                output += `
                    <div class="card col-12 container-fluid stage-0${selected ? ' border-success' : ''}">
                        <div class="row">
                            <div class="col-4">
                                ${!!rate.thumnnail_tmpl ? `<image class="card-img" src=${rate.thumbnail_tmpl.replace('{size}', 'x220')} />` : '' }
                            </div>
                            <div class="col-8 card-body">
                                <h5 class="card-title">${rate.name}</h5>
                                <p class="card-text">Тарифы от ${formatMoney(rate.minPrice)}</p>
                                <div class="text-right">
                                    <button class="btn ${ selected ? 'btn-success' : 'btn-primary' } select" data-id=${rateInd}>${ selected ? 'Выбрано ': 'Выбрать' }</button>
                                </div>
                            </div>
                        </div>
                    </div>`;
            });
        } else if(this.stage === 1) {
            output += `
                <div class="col-12 container-fluid stage-1">
                    <h5>Вы выбрали ${this.data.group.name}.</h5>
                    <div id="carouselControls" class="carousel slide w-100 w-sm-50 m-auto" data-ride="carousel">
                        <div class="carousel-inner">
                            ${this.data.group.image_list_tmpl.map((img, ind) => `
                                <div class="carousel-item${ind == 0 ? ' active': ''}">
                                    <img class="d-block w-100" src="${img.src_secure.replace('{size}','x220')}" alt="First slide">
                                </div>`
                            )}
                        </div>
                        <a class="carousel-control-prev" href="#carouselControls" role="button" data-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span class="sr-only">Previous</span>
                        </a>
                        <a class="carousel-control-next" href="#carouselControls" role="button" data-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                            <span class="sr-only">Next</span>
                        </a>
                    </div>
                </div>
            `;
            this.hotel.rates.map((rate, rateInd) => {
                if(rate.room_group_id == this.data.group.room_group_id) output += this.renderRate(rate, rateInd, true, (this.data.rate !== null && this.data.rate.ind == rateInd));
            });
        } else if(this.stage === 2) {
            let roomsData = '';               
            const rooms = this.data.rooms;
            rooms.map((room, roomInd) => {
                let guestsFields = '';
                room.guests.map((guest, guestInd) => {
                    let fields = '';
                    Object.keys(guest).map(key => fields += this.renderField(key, guest[key], this.mapKey(key)));
                    guestsFields += `
                        <div class="row guest" data-id="${guestInd}">
                            ${fields}
                        </div>`;
                });
                roomsData += (`
                    <div class="card col room" data-id="${roomInd}">
                        <div class="card-title">Комната №${roomInd + 1}</div>
                        <div class="card-body">${ guestsFields }</div>
                    </div>
                `);
            });
            output += `
                <div class="col-12 container-fluid stage-2">
                    ${ this.renderRate(this.data.rate)}
                    <form class="form">
                        <div class="row contact">
                            <div class="col-12">
                                <h4>Контактная информация</h4>
                            </div>
                            <div class="col-12 col-sm-6">
                                <input type="tel" class="form-control" data-name="phone" placeholder="Телефон">
                            </div>
                            <div class="col-12 col-sm-6">
                                <input type="email" class="form-control" data-name="email" placeholder="E-mail">
                            </div>
                        </div>
                        <div class="row guests">
                            <div class="col">
                                <h4>Информация о гостях</h4>
                                ${ roomsData }
                            </div>
                        </div>
                    </form>
                </div>
            `;
            
        } else if(this.stage === 3) {
            let roomsInfo = '';
            this.data.rooms.forEach((room, roomInd) => {
                let guests = '';
                room.guests.forEach(guest => {
                    guests += `<p>${guest.last_name} ${guest.first_name}</p>`;
                });
                roomsInfo += `
                    <div class="card">
                        <div class="card-title"><h6>Комната №${roomInd + 1}</h6></div>
                        <div class="card-body">${ guests }</div>
                    </div>
                `;
            })
            output = `<div class="col-12 container-fluid stage-3">
                <div class="row">
                    <div class="col-12"><h4>Проверьте данные</h4></div>
                    <div class="col">
                        <h5>Контактная информация</h5>
                        <div class="card">
                            <div class="card-body">
                                <h6>Телефон: ${this.data.phone}</h6>
                                <h6>E-mail: ${this.data.email}</h6>
                            </div>
                        </div>
                    </div>
                    <div class="col">
                        <h5>Гости</h5>
                        ${ roomsInfo }
                    </div>
                </div>
                
            </div>`;
            
        } else if(this.stage === 4) {
            if(!this.data.rate.payment_options.payment_types[0].is_need_credit_card_data) {
                this.stage = 5;
                this.render();
                return;
            }
            output += `
                <p>Мы не храним данные Вашей карты. Ввод данных нужен для передачи Вашему банку информации об оплате.</p>
                <form id="payment-form" class="col-12 col-sm-6 m-auto">
                    <div class="form-group">
                        <input type="text" name="card_number" class="form-control" id="card_number" placeholder="Номер карты" />
                    </div>
                    <div class="form-group">
                        <input type="text" name="card_holder" class="form-control" id="card_holder" placeholder="Владелец" />
                    </div>
                    <div class="form-group d-flex justify-content-between">
                        <input type="text" name="expires" class="form-control col-5" id="expires" placeholder="ММ/ГГ" />
                        <input type="text" name="cvv" class="form-control col-5" id="cvv" placeholder="CVV" />
                    </div>
                </form>
            `;
        } else if(this.stage === 5) {
            let params = {
                partner_order_id: Math.random().toFixed(15).replace('.', ''),
                phone: this.data.phone,
                email: this.data.email,
                user_ip: "", // It will be pushed at backend
                ret_path: `${window.location.origin}${window.location.pathname}?mode=finish`,
                payment_type: this.data.rate.payment_options.payment_types[0],
                guests: [],
                rooms: this.data.rooms,
                book_hash: this.data.rate.book_hash,
            };
            if(params.payment_type.is_need_credit_card_data) {
                params.credit_card = {
                    ...this.data.credit_card,
                    card_number: this.data.credit_card.card_number.replace(/\s/g,'')
                };
            }
            
            this.data.rooms.forEach(room => {
                room.guests.forEach(guest => {
                    guest.last_name = 'Ostrovok';
                    params.guests.push(guest);
                });
            });
            output = `<div class="text-center">
                <div>Мы бронируем для Вас отель. Пожалуйста, не закрывайте вкладку - здесь мы сообщаем о возникающих проблемах.</div>
                <div>Номер вашего бронирования в системе 365-travels - <strong>${params.partner_order_id}</strong>. Используйте его в случае отмены бронирования.</div>
                <div id="status">
                    <div class="spinner-border" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                </div>
            </div>`;
            this.renderFooter();
            $('#modalReserveBody').html(output);
            $('#modalReserve').modal();

            $.ajax({
                url: `${window.location.origin}${window.location.pathname}?mode=api&action=reserve`,
                headers: {"Content-Type": "application/json"},
                method: 'POST',
                data: JSON.stringify(params)
            }).done(resp=>{
                if(resp.debug.status == 200) {
                    let checker = setInterval(() => {
                        $.ajax({
                            url: `${window.location.origin}${window.location.pathname}?mode=api&action=status&data=${JSON.stringify({partner_order_id: resp.result.partner_order_id})}`,
                            method: "GET"
                        }).done(res=> {
                            if(res.debug.status !== 200) {
                                output = '<h3>Произошла ошибка при пронировании. Повторите попытку позже.</h3>';
                                $('#modalReserveBody').html(output);
                                clearInterval(checker);
                                return;
                            }
                            let status = res.result.status;
                            if(status == '3ds') {
                                let data = res.result.pay_data3ds;
                                output = `<form method="${data.method}" target="_blank" action="${data.action_url}">
                                    <input hidden name="${data.pareq.name}" value="${data.pareq.value}" />
                                    <input hidden name="${data.termurl.name}" value="${data.termurl.value}" />
                                    <input hidden name="${data.md.name}" value="${data.md.value}" />
                                    <p>Для прохождения оплаты картой необходимо пройти 3-D-защиту. Вы будете переадресованы на сайт банка, выпустившего вашу карту.</p>
                                    <button type="submit">Пройти</button>
                                </form>`;
                                $('#status').html(output);
                                clearInterval(checker);
                                return;
                            }
                            if(status == 'ok') {
                                output = '<h2>Поздравляем! Вы забронировали номер! Вам на email отправлена информация о бронировании.</h2>';
                                $('#status').html(output);
                                clearInterval(checker);
                                return;
                            }
                        });
                    }, 5000);
                } else {
                    alert('Ошибка! Попробуйте позже.');
                    console.error(resp);
                }
            });
        }
        return output;
    }
    this.changeValidClass = (selector, isValid) => {
        $(selector).addClass(isValid ? 'is-valid' : 'is-invalid');
        $(selector).removeClass(!isValid ? 'is-valid' : 'is-invalid');
    }
    this.validate = (silent = true) => {
        if(this.stage == 0) {
            return this.data.group !== null;
        } else if(this.stage == 1) {
            return this.data.rate !== null;
        } else if(this.stage == 2) {
            if(this.data.phone == '' || this.data.email == '') {
                if(!silent) alert('Укажите контактную информацию!');
                return false;
            }
            let checkedRooms = 0;
            this.data.rooms.forEach(room => {
                var checkedGuests = 0;
                room.guests.forEach(guest => {
                    if(guest.first_name !== '' && guest.last_name !== '') checkedGuests += 1;
                });
                if(checkedGuests == room.guests.length) checkedRooms += 1;
            });
            if(checkedRooms !== this.data.rooms.length) {
                if(!silent) alert('Укажите имена и фамилии всех гостей, включая детей!');
                return false;
            }
            return true;
        } else if(this.stage == 4) {
            let cardNumberValid = valid.number($('#card_number').val());
            let expiresValid = valid.expirationDate($('#expires').val());
            let cvv = valid.cvv($('#cvv').val());
            let holder = $('#card_holder').val();
            // if(!$('#card_number').val() && !$('#expires').val() && !$('#cvv').val() && !holder) {
            //     return false;
            // }
            if(!silent) {
                this.changeValidClass('#card_number', cardNumberValid.isValid);
                this.changeValidClass('#expires', expiresValid.isValid);
                this.changeValidClass('#cvv', cvv.isValid);
                this.changeValidClass('#card_holder', holder.length > 0);
            }
            return (cardNumberValid.isValid && expiresValid.isValid && cvv.isValid && holder.length > 0);
        } 
    }
    this.renderFooter = (reinitEvents = false) => {
        let output = '';
        let prvBtn = (title = 'Назад') => `<div class="col prvBtn">
                <button id="prvBtn" class="btn btn-primary">${title}</button>
            </div>`,
            nxtBtn = (title="Далее") => `<div class="col nxtBtn">
                <button id="nxtBtn" class="btn btn-primary">${ title }</button>
            </div>`;
        if(this.stage == 0 && this.validate()) output = nxtBtn();
        if(this.stage == 1) {
            output += prvBtn();
            if(this.validate()) output += nxtBtn();
        }
        if(this.stage == 2) {
            output += prvBtn();
            if(this.validate()) output += nxtBtn();
        }
        if(this.stage == 3) {
            output += prvBtn();
            output += nxtBtn();
        }
        if(this.stage == 4) {
            output += prvBtn();
            output += nxtBtn();
        }
        $('#modalReserveFooter').html(output);
        if(output !== '') $('#modalReserveFooter').show();
        else $('#modalReserveFooter').hide();
        if(reinitEvents) this.initStageEvents();
    }
    this.initStageEvents = () => {
        if(this.stage === 0) {
            $('#modalReserve .btn.select').click(({target}) => {
                let id = parseInt(target.dataset.id);
                this.data.group = this.availableGroups[id];
                this.render();
            });
            $('#nxtBtn').click(() => {
                this.stage += 1;
                this.render();
            });
        } else if(this.stage === 1) {
            $('#modalReserve .btn.select').click(({target}) => {
                let id = parseInt(target.dataset.id);
                this.data.rate = { ...this.hotel.rates[id], ind: id };
                this.render();
            });
            $('#nxtBtn').click(() => {
                this.stage += 1;
                this.render();
            });
            $('#prvBtn').click(() => {
                this.stage -= 1;
                this.data.rate = null;
                this.render();
            });

        } else if(this.stage === 2) {
            $('#modalReserveBody form .guests input').change(({target}) => {
                let room_id = parseInt($(target).parents('.room')[0].dataset.id);
                let guest_id = parseInt($(target).parents('.guest')[0].dataset.id);
                let key = target.dataset.name;
                let guests = this.data.rooms[room_id].guests;
                delete this.data.rooms[room_id].guests;
                let guest = {...guests[guest_id]};
                guest[key]=target.value;
                guests[guest_id] = guest;
                this.data.rooms[room_id].guests = guests;
                this.renderFooter(true);
            });
            $('#modalReserveBody form .contact input').change(({target}) => {
                this.data[target.dataset.name] = target.value;
                this.renderFooter(true);
            });

            $('#nxtBtn').click(() => {
                if(this.validate(false)) {
                    this.stage += 1;
                    this.render();
                }
            });

            $('#prvBtn').click(() => {
                this.stage -= 1;
                this.render();
            });
        } else if(this.stage === 3) {
            $('#nxtBtn').click(() => {
                this.stage += 1;
                this.render();
            });

            $('#prvBtn').click(() => {
                this.stage -= 1;
                this.render();
            });
        } else if(this.stage === 4) {
            const formattedCreditCardInput = new RestrictedInput({
                element: document.querySelector('#card_number'),
                pattern: '{{9999}} {{9999}} {{9999}} {{9999}} {{333}}'
            });
            const formattedExpiresInput = new RestrictedInput({
                element: document.querySelector('#expires'),
                pattern: '{{99}}/{{99}}'
            });
            const formattedCvvInput = new RestrictedInput({
                element: document.querySelector('#cvv'),
                pattern: '{{999}}'
            });
            $('#payment-form input').change(() => this.validate(false));

            $('#nxtBtn').click(() => {
                this.validate(false);
                let dates = $('#expires').val().split('/');
                this.data.credit_card.e_month = dates[0];
                this.data.credit_card.e_year = dates[1];
                this.data.credit_card.card_number = $('#card_number').val();
                this.data.credit_card.card_holder = $('#card_holder').val();
                this.data.credit_card.secure_code = $('#cvv').val();
                if(this.validate()) {
                    this.stage += 1;
                    this.render();
                }
            });
        }
    }
    this.render = () => {
        this.renderTitle();
        let output = this.renderStage();
        this.renderFooter();
        $('#modalReserveBody').html(output);
        $('#modalReserve').modal();
        this.initStageEvents(true);
    }
    $('#modalReserveTitle').html('Загружаем данные...');
    $('#modalReserveFooter').hide();
    $('#modalReserveBody').html(`<div class="text-center">
        <div class="spinner-border" role="status">
            <span class="sr-only">Loading...</span>
        </div>
    </div>`);
    $('#modalReserve').modal();
    $('#modalReserve').modal('show');
    $.ajax({
        timeout: 0,
        url: `${window.location.origin}${window.location.pathname}?mode=api&action=actualize&hotel_id=${this.hotel.id}&data=${JSON.stringify(this.search_info)}`
    }).done(actResp => {
        if(actResp.result.hotels.length > 0) {
            this.hotel.rates = actResp.result.hotels[0].rates;
        } else {
            this.stage = -1;
        }
        this.render();
    });
    return this;
}