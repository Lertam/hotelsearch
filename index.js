$(document).ready(() => {
    const Utils = {
        /**
         * Helper function
         *
         * @param {String} str 
         * @returns {Boolean} True if string is blank (even if it contains only spaces)
         */
        isBlank: str => {
            return (!str || /^\s*$/.test(str));
        },
        /**
         * 
         * @param {Number} number - Base of pluralization
         * @param {String} one - Word suffix if it is one
         * @param {String} two  - Word suffix if it is two
         * @param {String} five  - Word suffix if it is five
         */
        getNoun: (number, one, two, five) => {
            let n = Math.abs(number);
            n %= 100;
            if (n >= 5 && n <= 20) {
              return five;
            }
            n %= 10;
            if (n === 1) {
              return one;
            }
            if (n >= 2 && n <= 4) {
              return two;
            }
            return five;
        },
        formatMoney: (amount, decimalCount = 2, decimal = ".", thousands = " ") => {
            try {
                decimalCount = Math.abs(decimalCount);
                decimalCount = isNaN(decimalCount) ? 2 : decimalCount;
            
                const negativeSign = amount < 0 ? "-" : "";
            
                let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
                let j = (i.length > 3) ? i.length % 3 : 0;
            
                return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "") + 	'&#8381;';
              } catch (e) {
                console.log(e)
              }
        },
        mapMeal: (meal_slug) => {
            let meal_title = meal_slug;
            Utils.meals.forEach((meal) => {
                if(meal.slug == meal_slug) {meal_title = meal.title; return 's';}
            });
            return meal_title;
        },
        mapSerps: (serp_slug) => {
            let serp_title = serp_slug;
            
            Utils.serps.hotel.forEach((serp) => {
                if(serp.slug == serp_slug) {serp_title = serp.title; return;}
            });
            console.log(serp_slug, Utils.serps.hotel);
            Utils.serps.room.forEach((serp) => {
                if(serp.slug == serp_slug) {serp_title = serp.title; return;}
            });
            console.log(serp_slug, Utils.serps.room);
            Utils.serps.features.forEach((serp) => {
                if(serp.slug == serp_slug) {serp_title = serp.title; return;}
            });
            console.log(serp_slug, Utils.serps.features);
            return serp_title;
        },
        renderCancellationInfo: info => {
            if(!!info.free_cancellation_before) {
                // has free cancellation
                return 'Бесплатная отмена до '+ Utils.formatDate(info.free_cancellation_before);
            }
            return '';
        },
        formatDate: dateStr => {
            let date = new Date(dateStr);
            let hours = date.getHours(),
                minutes = date.getMinutes(),
                day = date.getDate(),
                month = date.getMonth() + 1,
                year = date.getFullYear();
            return `${(hours < 10 ? ` 0${hours}` : hours)}:${(minutes < 10 ? ` 0${minutes}` : minutes)} ${(day < 10 ? ` 0${day}` : day)}.${(month < 10 ? ` 0${month}` : month)}.${year}`;
        }
    }
    function RoomSelect() {
        this.dialogInitialized = false;
        this.rooms = [{
            adults: 1,
            children: []
        }];
        this.getInfo = () => this.rooms;
        this.addAdults = ({target}) => {
            let ind = parseInt($(target).parents('.room')[0].dataset.room_id);
            this.rooms[ind].adults += 1;
            this.render();
        }
        this.delAdults = ({target}) => {
            let ind = parseInt($(target).parents('.room')[0].dataset.room_id);
            this.rooms[ind].adults -= 1;
            this.render();
        }
        this.selectAge = ({target}) => {
            let room_ind = parseInt($(target).parents('.room')[0].dataset.room_id);
            let child_id = parseInt(target.dataset.id);
            this.rooms[room_ind].children[child_id] = parseInt(target.value);
        }
        this.addChild = ({target}) => {
            let room_ind = parseInt($(target).parents('.room')[0].dataset.room_id);
            this.rooms[room_ind].children.push(0);
            this.render();
        }
        this.delChild = ({target}) => {
            let room_ind = parseInt($(target).parents('.room')[0].dataset.room_id);
            this.rooms[room_ind].children.splice(this.rooms[room_ind].children.length - 1);
            this.render();
        }
        this.delRoom = ({target}) => {
            let room_id = parseInt($(target).parents('.room')[0].dataset.room_id);
            this.rooms.splice(room_id, 1);
            this.render();
        };
        this.addRoom = () => {
            this.rooms.push({ adults: 2, children: [] });
            this.render();
        }
        this.renderBrief = () => {
            let totalGuests = 0;
            this.rooms.map(room => {
                totalGuests += room.adults;
                totalGuests += room.children.length
            });
            const { getNoun } = Utils;
            let totalRooms = this.rooms.length;
            return `${totalRooms} комнат${getNoun(totalRooms, 'а','ы', '')}<br/> ${ totalGuests } гост${getNoun(totalGuests, 'ь', 'я', 'ей')}`;
        }
        this.render = () => {
            let output = '';
            this.rooms.map((room, room_ind) => {
                output += `<div class="room card" data-room_id=${room_ind}>`;
                output += `<div class="card-body">`;
                output += `<div class="card-title">Комната ${room_ind + 1}${this.rooms.length > 1 ? '&nbsp;<button class="delete form-control cbutton" style="display: inline-block;"><span class="fa fa-times"></span></button>' : ''}</div>`;
                output += `<div class="card-text">`;
                output += `<div class="adults">
                        <span>Взрослые</span>
                        <div class="input-group">
                            <button class="cbutton form-control delete" ${ room.adults > 0  ? '' : 'disabled'}><span class="fa fa-minus"></span></button>
                            <div class="input-group-prepend input-group-append">
                                <span class="input-group-text">${room.adults}</span>
                            </div>
                            <button class="cbutton form-control add" ${ room.adults + room.children.length < 20 ? '':'disabled'}><span class="fa fa-plus"></span></button>
                        </div>
                    </div>`;
                output += `<div class="children">
                    <span>Дети</span>
                    <div class="input-group">
                        <button class="cbutton form-control delete" ${ room.children.length > 0 ? '' : 'disabled'}><span class="fa fa-minus"></span></button>
                        <div class="input-group-prepend input-group-append">
                            <span class="input-group-text">${room.children.length}</span>
                        </div>
                        <button class="cbutton form-control add" ${ room.adults + room.children.length < 20 && room.children.length < 4 ? '' : 'disabled'}><span class="fa fa-plus"></span></button>
                    </div>
                </div>`;
                if(room.children.length > 0) {
                    output += `<div class="children-details">`;
                    output += `<span>Возраст</span><div>`;
                    for(i=0;i<room.children.length;i++) {
                        output += `<select data-id=${i} class="form-control">`;
                        for(j=0;j<18;j++) output += `<option value=${j} ${room.children[i] == j ? 'selected': ''}>${j}</option>`;
                        output += `</select>`;
                    }
                    output += `</div></div>`
                }
                output += `</div></div></div>`;
            });
            output += '<button class="form-control" id="addRoom"><span class="fa fa-plus"></span></button>';
            $('#rooms').html(this.renderBrief());
            if(!this.dialogInitialized) {
                open_button = $('#rooms');
                $('#dialog').dialog({
                    autoOpen: false,
                    position: { my: "left top", at: "left bottom", of: open_button},
                    title: ''
                });
                $('.ui-dialog-titlebar').hide();
                $('#rooms').click(() => {
                    console.log('toggle dialog');
                    $('#dialog').dialog($('#dialog').dialog('isOpen') ? 'close' : 'open');
                });
                this.dialogInitialized = true;
            }
            $('#dialog').html(output);
            
            
            $('#addRoom').click(this.addRoom);
            $('.room .card-title button.delete').click(this.delRoom);
            $('.adults button.add').click(this.addAdults);
            $('.adults .delete').click(this.delAdults);
            $('.children .add').click(this.addChild);
            $('.children .delete').click(this.delChild);
            $('.children-details select').change(this.selectAge);
        }
        return this;
    }

    function ReserveService(hotel={name: 'N/A'}, search_info={}){
        this.stage = 0;
        this.stages = ['Выбор типа номера', 'Выбор тарифа', 'Ввод данных о гостях', 'Проверка данных'];
        this.selected = {
            group: null,
            rate: null
        };
        this.hotel = hotel;
        this.search_info = search_info;
        this.data = {
            phone: '',
            email: '',
            rooms: []
        }
        this.search_info.guests.map(room => {
            let tmpl = {first_name:'', last_name:'Ostrovok'};
            let res = { guests: [] };
            for(i=0;i<room.adults;i++) res.guests.push(tmpl);
            for(i=0;i<room.children.length;i++) res.guests.push(tmpl);
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
                            price = parseInt(rt.rate_price);
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
        this.renderRate = (rate, rateInd, useButton = false, selected = false) => {
            return `
                <div class="card col-12 container-fluid${selected ? ' border-success' : ''}">
                    <div class="row">
                        <div class="col-12 card-body">
                            <h5 class="card-title">${rate.room_name}</h5>
                            <p class="card-text">Стоимость - ${Utils.formatMoney(rate.rate_price)}</p>
                            <p>${Utils.mapMeal(rate.meal)}</p>
                            <p>${Utils.renderCancellationInfo(rate.cancellation_info)}</p>
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
            return `<div class="col">
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
                
            </div>`
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
                    let selected = (this.selected.group !== null && this.selected.group.room_group_id == rate.room_group_id);
                    output += `
                        <div class="card col-12 container-fluid stage-0${selected ? ' border-success' : ''}">
                            <div class="row">
                                <div class="col-4">
                                    ${!!rate.thumnnail_tmpl ? `<image class="card-img" src=${rate.thumbnail_tmpl.replace('{size}', 'x220')} />` : '' }
                                </div>
                                <div class="col-8 card-body">
                                    <h5 class="card-title">${rate.name}</h5>
                                    <p class="card-text">Тарифы от ${Utils.formatMoney(rate.minPrice)}</p>
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
                        <h5>Вы выбрали ${this.selected.group.name}.</h5>
                        <div id="carouselControls" class="carousel slide w-50 m-auto" data-ride="carousel">
                            <div class="carousel-inner">
                                ${this.selected.group.image_list_tmpl.map((img, ind) => `
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
                    if(rate.room_group_id == this.selected.group.room_group_id) output += this.renderRate(rate, rateInd, true, (this.selected.rate !== null && this.selected.rate.ind == rateInd));
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
                        ${ this.renderRate(this.selected.rate)}
                        <form class="form">
                            <div class="row contact">
                                <div class="col-12">
                                    <h4>Контактная информация</h4>
                                </div>
                                <div class="col">
                                    <input type="tel" class="form-control" data-name="phone" placeholder="Телефон">
                                </div>
                                <div class="col">
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
                
            }
            return output;
        }
        this.validate = (silent = true) => {
            if(this.stage == 0) {
                return this.selected.group !== null;
            } else if(this.stage == 1) {
                return this.selected.rate !== null;
            } else if(this.stage == 2) {
                if(this.data.phone == '' || this.data.email == '') {
                    if(!silent) alert('Укажите контактную информацию!');
                    return false;
                }
                let checkedRooms = 0;
                this.data.rooms.forEach(room => {
                    checkedGuests = 0;
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
            $('#modalReserveFooter').html(output);
            if(output !== '') $('#modalReserveFooter').show();
            else $('#modalReserveFooter').hide();
            if(reinitEvents) this.initStageEvents();
        }
        this.initStageEvents = () => {
            if(this.stage === 0) {
                $('#modalReserve .btn.select').click(({target}) => {
                    let id = parseInt(target.dataset.id);
                    this.selected.group = this.availableGroups[id];
                    this.render();
                });
                $('#nxtBtn').click(() => {
                    this.stage += 1;
                    this.render();
                });
            } else if(this.stage === 1) {
                $('#modalReserve .btn.select').click(({target}) => {
                    let id = parseInt(target.dataset.id);
                    this.selected.rate = { ...this.hotel.rates[id], ind: id };
                    this.render();
                });
                $('#nxtBtn').click(() => {
                    this.stage += 1;
                    this.render();
                });
                $('#prvBtn').click(() => {
                    this.stage -= 1;
                    this.selected.rate = null;
                    this.render();
                });

            } else if(this.stage === 2) {
                $('#modalReserveBody form .guests input').change(({target}) => {
                    let room_id = parseInt($(target).parents('.room')[0].dataset.id);
                    let guest_id = parseInt($(target).parents('.guest')[0].dataset.id);
                    let key = target.dataset.name;
                    let guests = this.data.rooms[room_id].guests;
                    delete this.data.rooms[room_id].guests;
                    guest = {...guests[guest_id]};
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
                    console.log(this.data);
                    if(this.validate(false)) {
                        this.stage += 1;
                        this.render();
                    }
                });

                $('#prvBtn').click(() => {
                    this.stage -= 1;
                    this.render();
                });
            }
        }
        this.render = () => {
            this.renderTitle();
            let output = this.renderStage();
            this.renderFooter();
            $('#modalReserveBody').html(output);
            $('#modalReserve').modal();
            this.initStageEvents();
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
            url: `/api.php?action=actualize&hotel_id=${this.hotel.id}&data=${JSON.stringify(this.search_info)}`
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

    function Search() {
        this.baseUrl = "https://partner.ostrovok.ru";
        this.settings = {
            "method": "GET",
            "timeout": 0,
        };
        
        this.roomSelect = new RoomSelect();
        this.data = {
            //dest: { type: "region", id:"6308908" },
            dest: {type: 'hotel', id: "test_hotel_do_not_book"},
            dates: { in: "2019-12-19", out: "2019-12-20" }
        };
        this.hotels = {};
        this.filters = {
            stars: [],
            prices: {min:0, max:100000},
            ratings: [],
            serps: [],
            meals: []
        };
        
        Utils.serps = {hotel:[], room:[], features:[]};
        Utils.meals = [];

        this.getRegionIcon = type => {
            return type; //TODO: Release this function
        };
        this.reinitState = () => {
            this.data = {
                dest: { type: "", id:"" },
                dates: { in: "", out: "" }
            };
            this.hotels = {};
            this.filters = {
                stars: [],
                prices: {min:0, max:100000},
                ratings: [],
                serps: [],
                meals: []
            };
        }
        this.getHotels = () => {
            this.hotels = [];
            const { dest, dates } = this.data
            let params = {
                guests: this.roomSelect.getInfo(),
                adults: 1,
                checkin : dates.in,
                checkout : dates.out
            };
            if(dest.type === 'region') {
                params.region_id = dest.id;
            } else if (dest.type === 'hotel') {
                params.ids = [dest.id];
            }
            let curSettings = {
                ...this.settings,
                url: `/api.php?action=getHotels&data=${JSON.stringify(params)}`
            };
            $.ajax(curSettings).done(response => {
                this.totalHotels = response.result.total_hotels;
                $('.search-results').html(`
                    <div id="filters" class="col-3"></div>
                    <div id="hotels" class="col-9"></div>
                `);
                $('#hotels').append(`<div class="row"><div class="col-12" id="total_title"><h3>Найдено отелей: ${ this.totalHotels }</h3></div></div>`);
                this.hotels = {};
                response.result.hotels.map(hotel => {
                    min_rate = 999999999;
                    hotel.rates.forEach(rate => { irate = parseInt(rate.rate_price); if(!isNaN(irate) && irate < min_rate) min_rate = irate;}); 
                    this.hotels[hotel.id] = {
                        min_rate,
                        ...hotel
                    };
                });
                let ids = Object.keys(this.hotels);
                let promises = [];
                while(ids.length > 0) {
                    promises.push(this.getHotelInfo(ids.splice(0, 100)));
                }
                
                Promise.all(promises).then(() => {
                    $('#hotels').append('<div class="row container-fluid" id="hotels_result">');
                    this.renderFilters();
                    this.renderHotels(); 
                    $('#search').attr('disabled', false);
                });
            });//TODO: Add error catching
        }
        this.renderFilters = (selector = '#filters') => {
            let serps_output = '';
            if(Utils.serps.hotel.length > 0){
                serps_output += '<label>В отеле</label><br />';
                Utils.serps.hotel.map(serp => {
                serps_output += `<label for="${serp.slug}">
                    ${serp.title}
                    <input type="checkbox" id=${serp.slug} ${this.filters.serps.indexOf(serp.slug) !== -1 ? 'checked':''} />
                </label>`;
                });
            }
            if(Utils.serps.room.length > 0){
                serps_output += '<br /><label>В номере</label><br />';
                Utils.serps.room.map(serp => {
                    serps_output += `<label for="${serp.slug}">
                        ${serp.title}
                        <input type="checkbox" id=${serp.slug} ${this.filters.serps.indexOf(serp.slug) !== -1 ? 'checked':''} />
                    </label>`;
                });
            }
            if(Utils.serps.features.length > 0){
                serps_output += '<br /><label>Особенности размещения</label><br />';
                Utils.serps.features.map(serp => {
                    serps_output += `<label for="${serp.slug}">
                        ${serp.title}
                        <input type="checkbox" id=${serp.slug} ${this.filters.serps.indexOf(serp.slug) !== -1 ? 'checked':''} />
                    </label>`;
                });
            }
            let meals_output = '';
            if(Utils.meals.length > 0) {
                let allowed = ['nomeal', 'breakfast', 'half-board', 'full-board', 'all-inclusive'];
                Utils.meals.filter(meal => allowed.indexOf(meal.slug) !== -1).map(meal =>
                    meals_output += `<label for="${meal.slug}">
                        ${meal.title}
                        <input type="checkbox" id=${meal.slug} ${this.filters.meals.indexOf(meal.slug) !== -1 ? 'checked':''} />
                    </label>`
                );
            }
            $(selector).html(`
                <div class="row">
                    <div class="col-12">
                        <fieldset id="star-filter">
                            <legend style="font-size:1.2rem;">Количество звезд </legend>
                            <label for="5-stars">
                                <span class="fa fa-star checked"></span>
                                <span class="fa fa-star checked"></span>
                                <span class="fa fa-star checked"></span>
                                <span class="fa fa-star checked"></span>
                                <span class="fa fa-star checked"></span>
                                <input type="checkbox" id="5-stars" data-id=5 ${this.filters.stars.indexOf(5) !== -1 ? 'checked':''}/>
                            </label>
                            <label for="4-stars">
                                <span class="fa fa-star checked"></span>
                                <span class="fa fa-star checked"></span>
                                <span class="fa fa-star checked"></span>
                                <span class="fa fa-star checked"></span>
                                <input type="checkbox" id="4-stars" data-id=4 ${this.filters.stars.indexOf(4) !== -1 ? 'checked':''}/>
                            </label>
                            <label for="3-stars">
                                <span class="fa fa-star checked"></span>
                                <span class="fa fa-star checked"></span>
                                <span class="fa fa-star checked"></span>
                            <input type="checkbox" id="3-stars" data-id=3 ${this.filters.stars.indexOf(3) !== -1 ? 'checked':''}/>
                            </label>
                            <label for="2-stars">
                                <span class="fa fa-star checked"></span>
                                <span class="fa fa-star checked"></span>
                                <input type="checkbox" id="2-stars" data-id=2 ${this.filters.stars.indexOf(2) !== -1 ? 'checked':''}/>
                            </label>
                            <label for="1-0-stars">
                                <span class="fa fa-star checked"></span> или без звёзд
                                <input type="checkbox" id="1-0-stars" data-id=1 ${this.filters.stars.indexOf(1) !== -1 ? 'checked':''}/>
                            </label>
                        </fieldset>
                    </div>
                </div>
                <div class="row">
                    <div class="col-12">
                        <fieldset id="price-filter">
                            <legend style="font-size:1.2rem;">Цена за ночь: ${Utils.formatMoney(this.filters.prices.min, 0)} - ${Utils.formatMoney(this.filters.prices.max, 0)}</legend>
                            <div id="price-range"></div>
                        </fieldset>
                    </div>
                </div>
                <div class="row">
                    <div class="col-12">
                        <fieldset id="ratings-filter">
                            <legend style="font-size:1.2rem;">Оценка по отзывам</legend>
                            <label for="ratings-9+">
                                Супер: 9+
                                <input type="checkbox" id="ratings-9+" data-id=9 ${this.filters.ratings.indexOf(9) !== -1 ? 'checked':''}/>
                            </label>
                            <label for="ratings-8+">
                                Отлично: 8+
                                <input type="checkbox" id="ratings-8+" data-id=8 ${this.filters.ratings.indexOf(8) !== -1 ? 'checked':''}/>
                            </label>
                            <label for="ratings-7+">
                                Очень хорошо: 7+
                            <input type="checkbox" id="ratings-7+" data-id=7 ${this.filters.ratings.indexOf(7) !== -1 ? 'checked':''}/>
                            </label>
                            <label for="ratings-6+">
                                Хорошо: 6+
                                <input type="checkbox" id="ratings-6+" data-id=6 ${this.filters.ratings.indexOf(6) !== -1 ? 'checked':''}/>
                            </label>
                            <label for="ratings-5+">
                                Неплохо: 5+
                                <input type="checkbox" id="ratings-5+" data-id=5 ${this.filters.ratings.indexOf(5) !== -1 ? 'checked':''}/>
                            </label>
                        </fieldset>
                    </div>
                </div>
                <div class="row">
                    <div class="col-12">
                        <fieldset id="serps-filter">
                            <legend style="font-size:1.2rem;">Удобства и особенности размещения</legend>
                            ${serps_output}
                        </fieldset>
                    </div>
                </div>
                <div class="row">
                    <div class="col-12">
                        <fieldset id="meals-filter">
                            <legend style="font-size:1.2rem;">Питание</legend>
                            ${meals_output}
                        </fieldset>
                    </div>
                </div>
            `);
            $( "#price-range" ).slider({
                range: true,
                min: 0, // TODO: ?change to 100
                max: 100000,
                values: [ this.filters.prices.min, this.filters.prices.max ],
                step: 100,
                change: (event, ui) => {
                  this.filters.prices.min = parseInt(ui.values[0]);
                  this.filters.prices.max = parseInt(ui.values[1]);
                  this.renderFilters();
                  this.renderHotels(this.filter);
                }
            });
            $(`#star-filter input[type=\"checkbox\"]`).checkboxradio({
                icon: false
            });
            $(`#star-filter input`).click(({target}) => {
                let id = parseInt(target.dataset.id);
                if(this.filters.stars.indexOf(id) == -1) this.filters.stars.push(id);
                else this.filters.stars.splice(this.filters.stars.indexOf(id), 1);
                this.renderHotels(this.filter);
            });
            $(`#ratings-filter input[type=\"checkbox\"]`).checkboxradio({
                icon: false
            });
            $(`#ratings-filter input`).click(({target}) => {
                let id = parseInt(target.dataset.id);
                if(this.filters.ratings.indexOf(id) == -1) this.filters.ratings.push(id);
                else this.filters.ratings.splice(this.filters.ratings.indexOf(id), 1);
                this.renderHotels(this.filter);
            });
            $(`#serps-filter input[type=\"checkbox\"]`).checkboxradio({
                icon: false
            });
            $(`#serps-filter input`).click(({target}) => {
                let slug = target.id;
                if(this.filters.serps.indexOf(slug) == -1) this.filters.serps.push(slug);
                else this.filters.serps.splice(this.filters.serps.indexOf(slug), 1);
                this.renderHotels(this.filter);
            });
            $(`#meals-filter input[type=\"checkbox\"]`).checkboxradio({
                icon: false
            });
            $(`#meals-filter input`).click(({target}) => {
                let slug = target.id;
                if(this.filters.meals.indexOf(slug) == -1) this.filters.meals.push(slug);
                else this.filters.meals.splice(this.filters.meals.indexOf(slug), 1);
                this.renderHotels(this.filter);
            });
        }
        
        this.renderStars = stars => {
            output = '<span class="center">';
            if(stars == 0) output += 'Нет звезд';
            else {
                for(i=0;i<stars;i++)output+='<span class="fa fa-star checked"></span>';
            }
            output += '</span>';
            return output;
        }
        this.filter = source => {
            const { stars, prices, ratings, serps, meals } = this.filters;
            let filters_passed = 0;
            let totalFilters = 0;
            if(stars.length > 0) {
                totalFilters += 1;
                if(stars.indexOf(source.stars) !== -1 || (source.stars == 0 && stars.indexOf(1) !== -1)) filters_passed += 1;
            }
            if(ratings.length > 0) {
                totalFilters += 1;
                if(ratings.indexOf(source.rating) !== -1) filters_passed += 1;
            }
            if(serps.length > 0) {
                totalFilters += 1;
                let passed = 0;
                serps.map(serp => { if(source.serps.indexOf(serp) !== -1) passed += 1;});
                if(passed == serps.length) filters_passed += 1;
            }
            if(meals.length > 0) {
                totalFilters += 1;
                let passed = 0;
                meals.map(meal => { if(source.meals.indexOf(meal) !== -1) passed += 1;});
                if(passed == meals.length) filters_passed += 1;
            }
            if(prices.min !== null && !isNaN(prices.min)){
                totalFilters += 1;
                if(source.price >= prices.min) filters_passed += 1; 
            }
            if(prices.max !== null && !isNaN(prices.max)){
                totalFilters += 1;
                if(source.price <= prices.max) filters_passed += 1; 
            }
            if(filters_passed === totalFilters) return true;
            else return false;
        }
        this.renderHotels = (filter=()=>true) => {
            $('#hotels_result').html('');
            this.totalHotels = 0;
            Object.keys(this.hotels).map(key => {
                hotel = this.hotels[key];
                if(filter({ 
                    stars: hotel.stars, 
                    price: hotel.min_rate, 
                    rating: hotel.rating.total,
                    serps: hotel.serp_filters,
                    meals: hotel.rates.map(rate => rate.meal) })) {
                    this.totalHotels += 1;
                    $('#hotels_result').append(`
                    <div id="hotel-${hotel.id}-${Math.random()}" class="card col-4" style="padding:5px;">
                        <img src="${hotel.thumbnail}" class="card-img-top" alt="${hotel.name}">
                        <div class="card-body">
                            <h5 class="card-title">${hotel.name}</h5>
                            <p class="card-text">${hotel.address}</p>
                            <div class="price-block">
                                <span class="center">${!!hotel.min_rate ? `От ${ Utils.formatMoney(hotel.min_rate)}` : '' }</span>
                                ${ this.renderStars(hotel.stars) }
                            </div>
                            <!--<a href="${!!hotel.hotelpage ? hotel.hotelpage : '#'}" target="blank" class="btn btn-primary form-control">Подробнее</a>-->
                            <button type="button" class="btn btn-primary showmodal" data-id=${hotel.id}>
                                Подробнее
                            </button>
                        </div>
                    </div>`);
                }
            });
            $('.showmodal').click(({target}) => {
                id = target.dataset.id;
                const { dates } = this.data;
                new ReserveService(this.hotels[id],  {
                    guests: this.roomSelect.getInfo(),
                    checkin : dates.in,
                    checkout : dates.out
                });
            })
            $('#total_title').html(`<h3>Найдено отелей: ${ this.totalHotels }</h3>`);
        }
        this.getHotelInfo = ids => {
            return new Promise((resolve, reject) => {
                let curSettings = {
                    // ...this.settings,
                    url: `/api.php?action=getInfo&data=${JSON.stringify({ ids })}`
                };
                $.ajax(curSettings).done(response => {
                    response.result.map(hotel => {
                        Object.assign(this.hotels[hotel.id], hotel, { stars: Math.round(hotel.star_rating / 10) } );
                    });
                    resolve();
                });
            });
        };

        this.getMulticomplete = (req, callback) => {
            let curSettings = {
                ...this.settings,
                url: `/api.php?action=getMulticomplete&query=${req.term}`
            };
            $.ajax(curSettings).done(response => {
                let result = [];
                response.result.regions.map(region =>  result.push({label: `${ region.name }, ${region.country}`, value: region.id, type: 'region' }));
                response.result.hotels.map(hotel =>  result.push({label: `${ hotel.name }, ${hotel.region_name}`, value: hotel.id, type: 'hotel' }));
                callback(result);
            });//TODO: Add error catching
        }

        this.validateForm = () => {
            const { data } = this;
            const { isBlank } = Utils;
            const { dest, dates } = data;
            if(isBlank(dest.type) || isBlank(dest.id)) {console.error('You must provide dest'); return false;}
            if (dest.type !== 'region' && dest.type !== 'hotel') {console.error('Hotel and region are only availabale types.'); return false;}
            // Не позже 366 дней с текущего момента.
            if(isBlank(dates.in)){console.error('You must provide checkin'); return false;}
            // Не более 30 дней, начиная с checkin date.
            if(isBlank(dates.out)){console.error('You must provide checkout'); return false;}
            return true;
        }

        this.initEvents = () => {
            $( "#dest" ).autocomplete({
                select: (ev, ui) => {
                    ev.preventDefault();
                    $('#dest').val(ui.item.label);
                    this.data.dest = {
                        id: ui.item.value,
                        type: ui.item.type
                    }
                },
                source: this.getMulticomplete,
                minLength: 2
            });
            this.createDatepicker = type => {
                $(`#check${type}_date`).datepicker({
                    minDate: new Date(),
                    dateFormat: "dd M, D",
                    onSelect: (dateText, inst) => {
                        if(type == 'in') {
                            this.data.dates.in = `${inst.currentYear}-${inst.currentMonth+1}-${inst.currentDay}`
                        } else if(type == 'out') {
                            this.data.dates.out = `${inst.currentYear}-${inst.currentMonth+1}-${inst.currentDay}`
                        }
                    }
                })
            }   
            this.createDatepicker('in');
            this.createDatepicker('out');

            $('#search').click(ev => {
                if(this.validateForm()) {
                    $('.search-results').html(`
                        <div class="text-center">
                            <div class="spinner-border" role="status">
                                <span class="sr-only">Loading...</span>
                            </div>
                        </div>
                    `);
                    $('#search').attr('disabled', "true");
                    setTimeout(()=>this.getHotels(),5000);
                }
            });
            Utils.serps = {"hotel": [{"lang":"ru","slug":"has_internet","sort_order":10,"title":"Бесплатный интернет","uid":1},{"lang":"ru","slug":"has_airport_transfer","sort_order":20,"title":"Трансфер","uid":5},{"lang":"ru","slug":"has_parking","sort_order":30,"title":"Парковка","uid":3},{"lang":"ru","slug":"has_pool","sort_order":50,"title":"Бассейн","uid":6},{"lang":"ru","slug":"has_fitness","sort_order":60,"title":"Фитнес","uid":4},{"lang":"ru","slug":"has_meal","sort_order":70,"title":"Бар или ресторан","uid":8},{"lang":"ru","slug":"has_busyness","sort_order":90,"title":"Конференц-зал","uid":21},{"lang":"ru","slug":"has_spa","sort_order":100,"title":"Спа-услуги","uid":7},{"lang":"ru","slug":"has_ski","sort_order":109,"title":"Горнолыжный склон рядом","uid":26},{"lang":"ru","slug":"beach","sort_order":110,"title":"Пляж рядом","uid":22}],"room": [{"lang":"ru","slug":"air-conditioning","sort_order":120,"title":"Кондиционер","uid":19},{"lang":"ru","slug":"private-bathroom","sort_order":900,"title":"Ванная комната в номере","uid":9},{"lang":"ru","slug":"window","sort_order":1000,"title":"Окно в номере","uid":15},{"lang":"ru","slug":"kitchen","sort_order":1100,"title":"Кухня","uid":16},{"lang":"ru","slug":"balcony","sort_order":1200,"title":"Балкон","uid":17},{"lang":"ru","slug":"with-view","sort_order":1300,"title":"Вид из окна","uid":18}],"features": [{"lang":"ru","slug":"has_kids","sort_order":40,"title":"Подходит для детей","uid":24},{"lang":"ru","slug":"has_pets","sort_order":80,"title":"Разрешено с домашними животными","uid":23},{"lang":"ru","slug":"has_disabled_support","sort_order":130,"title":"Для гостей с ограниченными возможностями","uid":20},{"lang":"ru","slug":"has_smoking","sort_order":1400,"title":"Можно курить","uid":27}]};
            Utils.meals = [{"slug":"nomeal","title":"Питание не включено"},{"slug":"american-breakfast","title":"Американский завтрак"},{"slug":"asian-breakfast","title":"Азиатский завтрак"},{"slug":"breakfast","title":"Завтрак включён"},{"slug":"breakfast-buffet","title":"Завтрак \"шведский стол\""},{"slug":"breakfast-for-1","title":"Завтрак для 1"},{"slug":"breakfast-for-2","title":"Завтрак для 2"},{"slug":"chinese-breakfast","title":"Китайский завтрак"},{"slug":"continental-breakfast","title":"Континентальный завтрак"},{"slug":"dinner","title":"Ужин"},{"slug":"english-breakfast","title":"Английский завтрак"},{"slug":"half-board","title":"Завтрак и ужин включены"},{"slug":"full-board","title":"Завтрак, обед и ужин включены"},{"slug":"irish-breakfast","title":"Ирландский завтрак"},{"slug":"israeli-breakfast","title":"Израильский завтрак"},{"slug":"japanese-breakfast","title":"Японский завтрак"},{"slug":"lunch","title":"Обед"},{"slug":"scandinavian-breakfast","title":"Скандинавский завтрак"},{"slug":"scottish-breakfast","title":"Шотландский завтрак"},{"slug":"soft-all-inclusive","title":"soft-all-inclusive"},{"slug":"some-meal","title":"Питание включено"},{"slug":"super-all-inclusive","title":"super-all-inclusive"},{"slug":"ultra-all-inclusive","title":"ultra-all-inclusive"},{"slug":"all-inclusive","title":"Всё включено"}];
            // $.getJSON('./dist/js/serps.json', '', serps => {
            //     Utils.serps = serps;
            // });
            // $.getJSON('./dist/js/meals.json', '', meals => {
            //     Utils.meals = meals;
            // });
        }
        this.roomSelect.render();
        this.initEvents();
        // For debug
        $('#search').click();
        return this;
    }


    let search = new Search();
});