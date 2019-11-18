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
        }
    }
    function RoomSelect() {
        this.dialogInitialized = false;
        this.rooms = [{
            adults: 2,
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

    function Search() {
        this.baseUrl = "https://partner.ostrovok.ru";
        this.settings = {
            "method": "GET",
            "username":"2545",
            "password": "da7bdbcb-4179-4139-ace9-d63e66b345db",
            "timeout": 0,
        };
        
        this.roomSelect = new RoomSelect();
        this.data = {
            dest: { type: "hotel", id:"test_hotel" },
            dates: { in: "2019-11-23", out: "2019-11-24" }
        };
        this.hotels = {};
        this.filters = {
            stars: [],
            prices: {min:0, max:100000},
            ratings: [],
            serps: [],
            meals: []
        };
        this.serps = {hotel:[], room:[], features:[]};
        this.meals = [];

        this.getRegionIcon = type => {
            return type; //TODO: Release this function
        };

        this.getHotels = () => {
            this.hotels = [];
            $('#hotels').html('');
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
                url: `${this.baseUrl}/api/affiliate/v2/hotel/rates?data=${JSON.stringify(params)}`
            };
            $.ajax(curSettings).done(response => {
                this.totalHotels = response.result.total_hotels;
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
                });
            });//TODO: Add error catching
        }
        this.renderFilters = (selector = '#filters') => {
            let serps_output = '';
            if(this.serps.hotel.length > 0){
                serps_output += '<label>В отеле</label><br />';
                this.serps.hotel.map(serp => {
                serps_output += `<label for="${serp.slug}">
                    ${serp.title}
                    <input type="checkbox" id=${serp.slug} ${this.filters.serps.indexOf(serp.slug) !== -1 ? 'checked':''} />
                </label>`;
                });
            }
            if(this.serps.room.length > 0){
                serps_output += '<br /><label>В номере</label><br />';
                this.serps.room.map(serp => {
                    serps_output += `<label for="${serp.slug}">
                        ${serp.title}
                        <input type="checkbox" id=${serp.slug} ${this.filters.serps.indexOf(serp.slug) !== -1 ? 'checked':''} />
                    </label>`;
                });
            }
            if(this.serps.features.length > 0){
                serps_output += '<br /><label>Особенности размещения</label><br />';
                this.serps.features.map(serp => {
                    serps_output += `<label for="${serp.slug}">
                        ${serp.title}
                        <input type="checkbox" id=${serp.slug} ${this.filters.serps.indexOf(serp.slug) !== -1 ? 'checked':''} />
                    </label>`;
                });
            }
            let meals_output = '';
            if(this.meals.length > 0) {
                let allowed = ['nomeal', 'breakfast', 'half-board', 'full-board', 'all-inclusive'];
                this.meals.filter(meal => allowed.indexOf(meal.slug) !== -1).map(meal =>
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
                    <div class="col-6">
                        <fieldset id="price-filter">
                            <legend style="font-size:1.2rem;">Цена за ночь: ${this.formatMoney(this.filters.prices.min, 0)} - ${this.formatMoney(this.filters.prices.max, 0)}</legend>
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
        this.formatMoney = (amount, decimalCount = 2, decimal = ".", thousands = " ") => {
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
        };
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
            console.log(this.hotels);
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
                                <span class="center">${!!hotel.min_rate ? `От ${ this.formatMoney(hotel.min_rate)}` : '' }</span>
                                ${ this.renderStars(hotel.stars) }
                            </div>
                            <a href="${!!hotel.hotelpage ? hotel.hotelpage : '#'}" target="blank" class="btn btn-primary form-control">Подробнее</a>
                        </div>
                    </div>`);
                }
            });
            $('#total_title').html(`<h3>Найдено отелей: ${ this.totalHotels }</h3>`);
        }
        this.getHotelInfo = ids => {
            return new Promise((resolve, reject) => {
                let curSettings = {
                    ...this.settings,
                    url: `${this.baseUrl}/api/affiliate/v2/hotel/list?data=${JSON.stringify({ ids })}`
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
                url: `${this.baseUrl}/api/affiliate/v2/multicomplete?query=${req.term}`
            };
            $.ajax(curSettings).done(response => {
                let result = [];
                response.result.regions.map(region =>  result.push({label: `${ region.name }, ${region.country}`, value: region.id, type: 'region' }));
                response.result.hotels.map(hotel =>  result.push({label: `${ hotel.name }, ${hotel.region_name}`, value: hotel.id, type: 'hotel' }));
                console.log(result);
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
                    this.getHotels();
                }
            });

            $.getJSON('./dist/js/serps.json', '', serps => {
                this.serps = serps;
            });
            $.getJSON('./dist/js/meals.json', '', meals => {
                this.meals = meals;
            });
        }
        this.roomSelect.render();
        this.initEvents();
        return this;
    }

    let search = new Search();
});