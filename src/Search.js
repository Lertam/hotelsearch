import { isBlank, formatMoney } from './Utils';
import serps from './serps.json';
import meals from './meals.json';
import RoomSelect from './RoomSelect';
import ReserveService from './ReserveService';
import InfoService from './InfoService';

export default function Search(selector = 'body') {
    this.settings = {
        "method": "GET",
        "timeout": 0,
    };
    this.page = 1;
    this.selector = selector;
    this.roomSelect = new RoomSelect();
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
    this.correctCheckDate = (dat) => {
        let arr = dat.split('-');
        let res = arr.map(part => {if(part.length < 2) part = '0'+part;return part;});
        return res.join('-');
    }
    this.getHotels = () => {
        this.hotels = [];
        const { dest, dates } = this.data
        let params = {
            guests: this.roomSelect.getInfo(),
            adults: 1,
            checkin : this.correctCheckDate(dates.in),
            checkout : this.correctCheckDate(dates.out)
        };
        if(dest.type === 'region') {
            params.region_id = dest.id;
        } else if (dest.type === 'hotel') {
            params.ids = [dest.id];
        }
        let curSettings = {
            ...this.settings,
            url: `${window.location.origin}${window.location.pathname}?mode=api&action=getHotels&data=${JSON.stringify(params)}`
        };
        $.ajax(curSettings).done(response => {
            this.totalHotels = response.result.total_hotels;
            $('.search-results').html(`
                <div class="col-12 d-lg-none"><button class="btn btn-primary w-100" id="filtersBtn">Фильтр</button></div>
                <div id="filters" class="d-none d-lg-flex flex-lg-column col-lg-3"></div>
                <div id="hotels" class="col-12 col-lg-9"></div>
            `);
            $('#hotels').append(`<div class="row"><div class="col-12" id="total_title"><h3>Найдено отелей: ${ this.totalHotels }</h3></div></div>`);
            this.hotels = {};
            response.result.hotels.map(hotel => {
                let min_rate = 999999999;
                hotel.rates.forEach(rate => { let irate = parseInt(rate.rate_price); if(!isNaN(irate) && irate < min_rate) min_rate = irate;}); 
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
                $('#hotels').append('<div class="row"><div class="col-12"><div class="card-deck" id="hotels_result"></div></div></div<');
                this.renderFilters();
                this.renderHotels(); 
                $('#search').attr('disabled', false);
            });
        });//TODO: Add error catching
    }
    this.renderFilters = (selector = '#filters') => {
        $('#filtersBtn').off();
        $('#filtersBtn').click(() => {
            $('#filters').toggleClass('d-none');
        });
        let serps_output = '';
        if(serps.hotel.length > 0){
            serps_output += '<label>В отеле</label><br />';
            serps.hotel.map(serp => {
            serps_output += `<label for="${serp.slug}">
                ${serp.title}
                <input type="checkbox" id=${serp.slug} ${this.filters.serps.indexOf(serp.slug) !== -1 ? 'checked':''} />
            </label>`;
            });
        }
        if(serps.room.length > 0){
            serps_output += '<br /><label>В номере</label><br />';
            serps.room.map(serp => {
                serps_output += `<label for="${serp.slug}">
                    ${serp.title}
                    <input type="checkbox" id=${serp.slug} ${this.filters.serps.indexOf(serp.slug) !== -1 ? 'checked':''} />
                </label>`;
            });
        }
        if(serps.features.length > 0){
            serps_output += '<br /><label>Особенности размещения</label><br />';
            serps.features.map(serp => {
                serps_output += `<label for="${serp.slug}">
                    ${serp.title}
                    <input type="checkbox" id=${serp.slug} ${this.filters.serps.indexOf(serp.slug) !== -1 ? 'checked':''} />
                </label>`;
            });
        }
        let meals_output = '';
        if(meals.length > 0) {
            let allowed = ['nomeal', 'breakfast', 'half-board', 'full-board', 'all-inclusive'];
            meals.filter(meal => allowed.indexOf(meal.slug) !== -1).map(meal =>
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
                        <legend style="font-size:1.2rem;">Цена за ночь: ${formatMoney(this.filters.prices.min, 0)} - ${formatMoney(this.filters.prices.max, 0)}</legend>
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
        if(stars == 0) return '';
        let output = '<span class="center">';
        for(var i=0;i<stars;i++)output+='<span class="fa fa-star checked"></span>';
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
    this.renderHotels = (filter = () => true, add = false) => {
        $('#hotels_result').html('');
        let keys = Object.keys(this.hotels);
        this.totalHotels = 0;
        let output = ''
        for(var i = 0; i < keys.length; i++) {
            let key = keys[i];
            let hotel = this.hotels[key];
            if(filter({ 
                stars: hotel.stars, 
                price: hotel.min_rate, 
                rating: hotel.rating.total,
                serps: hotel.serp_filters,
                meals: hotel.rates.map(rate => rate.meal) })) {
                this.totalHotels += 1;
                
                if(i % 3 === 0) {
                    output += `<div class="row">`;
                }
                output += `
                <div id="hotel-${hotel.id}-${Math.random()}" class="card col-12 col-md-4" style="padding:0px;">
                    <div class="img-container">
                        <img src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" data-src="${hotel.thumbnail}" class="card-img-top lazyload" alt="${hotel.name}">
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${hotel.name}</h5>
                        <p class="card-text">${hotel.address}</p>
                        <div class="price-block">
                            <span class="center">${!!hotel.min_rate ? `От ${ formatMoney(hotel.min_rate)}` : '' }</span>
                            ${ this.renderStars(hotel.stars) }
                        </div>
                        <!--<a href="${!!hotel.hotelpage ? hotel.hotelpage : '#'}" target="blank" class="btn btn-primary form-control">Подробнее</a>-->
                        <button type="button" class="btn btn-primary showmodal col-12" data-id=${hotel.id}>
                            Подробнее
                        </button>
                    </div>
                </div>`;
                if((i + 1) % 3 === 0) {
                    output += `</div>`;
                }
            }
        };
        $('#hotels_result').html(output);
        $('.showmodal').click(({target}) => {
            let id = target.dataset.id;
            const { dates } = this.data;
            new ReserveService(this.hotels[id],  {
                guests: this.roomSelect.getInfo(),
                checkin : this.correctCheckDate(dates.in),
                checkout : this.correctCheckDate(dates.out)
            });
        })
        $('#total_title').html(`<h3>Найдено отелей: ${ this.totalHotels }</h3>`);
    }
    this.getHotelInfo = ids => {
        return new Promise((resolve, reject) => {
            let curSettings = {
                // ...this.settings,
                url: `${window.location.origin}${window.location.pathname}?mode=api&action=getInfo&data=${JSON.stringify({ ids })}`
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
            url: `${window.location.origin}${window.location.pathname}?mode=api&action=getMulticomplete&query=${req.term}`
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
        const { dest, dates } = data;
        if(isBlank(dest.type) || isBlank(dest.id)) {
            $('#error-message').html('Необходимо выбрать пункт назначения.');
            $('#error-message').dialog({
                modal: true,
                buttons: {
                    Ok: function() {
                      $( this ).dialog( "close" );
                    }
                }
            });
            return false;
        }
        if (dest.type !== 'region' && dest.type !== 'hotel') {
            $('#error-message').html('Выберите отель или город.');
            $('#error-message').dialog({
                modal: true,
                buttons: {
                    Ok: function() {
                      $( this ).dialog( "close" );
                    }
                }
            });
            return false;
        }
        // Не позже 366 дней с текущего момента.
        if(isBlank(dates.in)){
            $('#error-message').html('Укажите дату заезда.');
            $('#error-message').dialog({
                modal: true,
                buttons: {
                    Ok: function() {
                      $( this ).dialog( "close" );
                    }
                }
            });
            return false;
        }
        
        let current_date = new Date(); 
        let checkin_date = new Date(dates.in); 
        let Difference_In_Time = checkin_date.getTime() - current_date.getTime(); 
        let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24); 
        if(Difference_In_Days > 366) {
            $('#error-message').html('Дата заезда не должна быть познее 1 года с текущего момента.');
            $('#error-message').dialog({
                modal: true,
                buttons: {
                    Ok: function() {
                      $( this ).dialog( "close" );
                    }
                }
            });
            return false;
        }
        // Не более 30 дней, начиная с checkin date.
        if(isBlank(dates.out)){
            $('#error-message').html('Укажите дату выезда.');
            $('#error-message').dialog({
                modal: true,
                buttons: {
                    Ok: function() {
                      $( this ).dialog( "close" );
                    }
                }
            });
            return false;
        }
        let checkout_date = new Date(dates.out);
        if(checkout_date.getTime() <= checkin_date.getTime()) {
            $('#error-message').html('Дата выезда не может быть раньше даты заезда.');
            $('#error-message').dialog({
                modal: true,
                buttons: {
                    Ok: function() {
                      $( this ).dialog( "close" );
                    }
                }
            });
            return false;
        }
        Difference_In_Time = checkout_date.getTime() - checkin_date.getTime();
        Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24); 
        if(Difference_In_Days > 30) {
            $('#error-message').html('Дата выезда не должна быть познее 1 месяца с даты заезда.');
            $('#error-message').dialog({
                modal: true,
                buttons: {
                    Ok: function() {
                      $( this ).dialog( "close" );
                    }
                }
            });
            return false;
        }
        let rooms = this.roomSelect.getInfo();
        let passed = true;
        rooms.forEach(room => {
            if(room.adults == 0 && room.children.length == 0) passed = false;
        });
        if(!passed) {
            $('#error-message').html('В комнате должен быть хотя бы один гость.');
            $('#error-message').dialog({
                modal: true,
                buttons: {
                    Ok: function() {
                      $( this ).dialog( "close" );
                    }
                }
            });
            return false;
        }
        return true;
    }

    this.render = () => {
        let modalInfoBtn = `
            <div class="container d-flex justify-content-sm-end justify-content-center">
                <button id="modalInfoBtn" class="btn btn-link">Информация/отмена бронирования</button>
            </div>
        `;
        $(this.selector).append(modalInfoBtn);
        let searchForm = `<div class="container">
            <div class="container-fluid">
                <div class="row search-panel">
                    <div class="ui-widget col-12 col-lg-5">
                        <div class="cool-input">
                            <input class="form-control" id="dest" placeholder="Страна/город/отель" />
                        </div>
                    </div>
                    <div class="dates col-12 col-lg-3">
                        <div class="input-group">
                            <input type="text" class="form-control" id="checkin_date" size="10" placeholder="Заезд" onfocus="blur();" />
                            <input type="text" class="form-control" id="checkout_date" size="10" placeholder="Выезд" onfocus="blur();" />
                        </div>
                    </div>
                    <div class="col-12 col-lg-2 brief-rooms" id="rooms"></div>
                    <div class="col-12 col-lg-2">
                        <button class="form-control" id="search">Поиск</button>
                    </div>
                </div>
                <div class="row search-results">
                </div>
            </div>
        </div>
        <div id="dialog"></div>`;
        $(this.selector).append(searchForm);
        let errorMessage = `
            <div id="error-message" title="Ошибка">
            </div>
        `;
        $(this.selector).append(errorMessage);
        
        let modalReserve = `<div class="modal fade" id="modalReserve" tabindex="-1" role="dialog" aria-labelledby="Reserve Service" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                <h5 class="modal-title" id="modalReserveTitle"></h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                </div>
                <div class="modal-body" id="modalReserveBody">
                </div>
                <div class="modal-footer" id="modalReserveFooter">
                </div>
            </div>
            </div>
        </div>`;
        $(this.selector).append(modalReserve);
        new InfoService(this.selector);
    }

    this.initEvents = () => {
        $( "#dest" ).autocomplete({
            select: (ev, ui) => {
                ev.preventDefault();
                $('#dest').val(ui.item.label);
                $(this).blur();
                this.data.dest = {
                    id: ui.item.value,
                    type: ui.item.type
                }
            },
            source: this.getMulticomplete,
            minLength: 2,
            open: (ev, ui) => {
                $('.ui-autocomplete').css('width', `calc(${$('.ui-autocomplete-input').width()}px + 1.5rem)`)
            }
        });
        this.createDatepicker = type => {
            $(`#check${type}_date`).datepicker({
                minDate: new Date(),
                autoSize: true,
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
            this.page = 1;
            if(this.validateForm()) {
                $('.search-results').html(`
                    <div class="text-center">
                        <div class="spinner-border" role="status">
                            <span class="sr-only">Loading...</span>
                        </div>
                    </div>
                `);
                $('#search').attr('disabled', "true");
                // setTimeout(()=>this.getHotels(),2000);
                this.getHotels();
            }
        });
    }
    this.render();
    this.roomSelect.render();
    
    this.initEvents();

    if(window.partner_order_id !== undefined) {
        let output = `<div class="text-center">
            <div>Мы бронируем для Вас отель. Пожалуйста, не закрывайте вкладку - здесь мы сообщаем о возникающих проблемах.</div>
            <div>Номер вашего бронирования в системе 365-travels - <strong>${window.partner_order_id}</strong>. Используйте его в случае отмены бронирования.</div>
            <div id="status">
                <div class="spinner-border" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
            </div>
        </div>`;
        $('#modalReserveBody').html(output);
        $('#modalReserve').modal();
        $('#modalReserve').modal('show');
        let checker = setInterval(() => {
            $.ajax({
                url: `${window.location.origin}${window.location.pathname}?mode=api&action=status&data=${JSON.stringify({partner_order_id: window.partner_order_id})}`,
                method: "GET"
            }).done(res=> {
                if(res.debug.status !== 200) {
                    output = '<h3>Произошла ошибка при бронировании. Повторите попытку позже.</h3>';
                    output += '<h4>При повторении ошибок, напишите на admin@365-travels.ru.</h4>';
                    $('#modalReserveBody').html(output);
                    clearInterval(checker);
                    return;
                }
                let status = res.result.status;
                if(status == 'ok') {
                    output = `
                        <div>Номер вашего бронирования в системе 365-travels - <strong>${window.partner_order_id}</strong>. Используйте его в случае отмены бронирования.</div>
                        <h2>Поздравляем! Вы забронировали номер! Вам на email отправлена информация о бронировании.</h2>
                    `;
                    $('#modalReserveBody').html(output);
                    clearInterval(checker);
                    return;
                }
            });
        }, 5000);
    }
    
    return this;
}