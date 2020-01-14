import { isBlank, formatMoney } from './Utils';
import serps from './serps.json';
import meals from './meals.json';
import RoomSelect from './RoomSelect';
import ReserveService from './ReserveService';
import InfoService from './InfoService';

export default function Search(selector = 'body') {
    this.loadHotelsBtn = `<div class="row" id="loadBtnContainer"><div class="col-12 text-center"><button class="btn btn-primary" id="loadHotelsBtn">Показать еще</button><div class="row"><div class="col-12 text-center">`;
    let hash = document.location.hash.replace('#', '');
    this.hash_params = {};
    if(!!hash) {
        this.hash_params = JSON.parse(hash.replace(/%22/g, '"').replace(/%20/g,' '));
    }
    this.settings = {
        "method": "GET",
        "timeout": 0,
    };
    this.page = 1;
    if(!!this.hash_params.page && !isNaN(this.hash_params.page) && parseInt(this.hash_params.page) > 0) this.page = parseInt(this.hash_params.page);
    this.selector = selector;
    this.roomSelect = new RoomSelect(!!this.hash_params.search ? this.hash_params.search.rooms : [], rooms => {
        if(!this.hash_params.search) this.hash_params.search = {};
        this.hash_params.search.rooms = rooms;
        this.genHash();
    });
    this.genHash = () => {
        console.log('New hash', this.hash_params);
        if(!!this.hash_params.filters) {
            if(!!this.hash_params.filters.stars && this.hash_params.filters.stars.length == 0) delete this.hash_params.filters.stars;
            if(!!this.hash_params.filters.ratings && this.hash_params.filters.ratings.length == 0) delete this.hash_params.filters.ratings;
            if(!!this.hash_params.filters.prices) {
                if(!!this.hash_params.prices.min == 0) delete this.hash_params.filters.prices.min;
                if(!!this.hash_params.prices.max == 100000) delete this.hash_params.filters.prices.max;
            }
            if(!!this.hash_params.filters.serps && this.hash_params.filters.serps.length == 0) delete this.hash_params.filters.serps;
            if(!!this.hash_params.filters.meals && this.hash_params.filters.meals.length == 0) delete this.hash_params.filters.meals;
            if(Object.keys(this.hash_params.filters).length == 0) delete this.hash_params.filters;
        }
        document.location.hash=`#${JSON.stringify(this.hash_params)}`;
    }
    this.data = {
        dest: { type: "", id:"" },
        dates: { in: "", out: "" }
    };
    if(!!this.hash_params.search && !!this.hash_params.search.dest && !!this.hash_params.search.dest.type) {
        this.data.dest.type = this.hash_params.search.dest.type;
    }
    if(!!this.hash_params.search && !!this.hash_params.search.dest && !!this.hash_params.search.dest.id) {
        this.data.dest.id = this.hash_params.search.dest.id;
    }
    if(!!this.hash_params.search && !!this.hash_params.search.dest && !!this.hash_params.search.dest.name) {
        this.data.dest.name = this.hash_params.search.dest.name;
    }
    if(!!this.hash_params.search && !!this.hash_params.search.dates && !!this.hash_params.search.dates.in) {
        this.data.dates.in = this.hash_params.search.dates.in;
    }
    if(!!this.hash_params.search && !!this.hash_params.search.dates && !!this.hash_params.search.dates.out) {
        this.data.dates.out = this.hash_params.search.dates.out;
    }
    this.hotels = {};
    this.filters = {
        stars: [],
        prices: {min:0, max:100000},
        ratings: [],
        serps: [],
        meals: []
    };
    if(!!this.hash_params.filters) {
        this.filters = { ...this.filters, ...this.hash_params.filters };
    }
    this.genHash();

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
        delete this.hash_params.filters;
        this.genHash();
    }
    this.correctCheckDate = (dat) => {
        let arr = dat.split('-');
        let res = arr.map(part => {if(part.length < 2) part = '0'+part;return part;});
        return res.join('-');
    }
    this.addHotels = () => {
        const { dest, dates } = this.data
        let params = {
            rooms: this.roomSelect.getInfo(),
            dest, dates
        };
        this.page += 1;
        let curSettings = {
            ...this.settings,
            url: `${window.location.origin}${window.location.pathname}?mode=api&action=getHotels&data=${JSON.stringify(params)}&page=${this.page}`
        };

        const { stars, ratings, serps, meals, prices } = this.filters;
        if(stars.length > 0) curSettings.url += `&stars=${JSON.stringify(stars)}`;
        if(ratings.length > 0) curSettings.url += `&ratings=${JSON.stringify(ratings)}`;
        if(serps.length > 0) curSettings.url += `&serps=${JSON.stringify(serps)}`;
        if(meals.length > 0) curSettings.url += `&meals=${JSON.stringify(meals)}`;
        if(prices.min !== 0 || prices.max !== 100000) curSettings.url += `&prices=${JSON.stringify(prices)}`;
        $('#loadBtnContainer').replaceWith(`
            <div class="row">
                <div class="col-12 text-center" style="padding-top:50px;">
                    <div class="spinner-border" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                </div>
            </div>
        `);
        $.ajax(curSettings).done(response => {
            if(response.status != 'ok') {
                alert('error');
                console.error(response.error);
                return;
            }
            this.totalHotels = response.total_hotels;
            
            $('#search').attr('disabled', false);
            
            this.hotels = { ...this.hotels, ...response.hotels};
            this.renderFilters();
            this.renderHotels();
        });//TODO: Add error catching
    }
    this.getHotels = () => {
        this.page = 1;
        this.hotels = {};
        const { dest, dates } = this.data
        let params = {
            rooms: this.roomSelect.getInfo(),
            dest, dates
        };
        let curSettings = {
            ...this.settings,
            url: `${window.location.origin}${window.location.pathname}?mode=api&action=getHotels&data=${JSON.stringify(params)}&page=${this.page}`
        };

        const { stars, ratings, serps, meals, prices } = this.filters;
        if(stars.length > 0) curSettings.url += `&stars=${JSON.stringify(stars)}`;
        if(ratings.length > 0) curSettings.url += `&ratings=${JSON.stringify(ratings)}`;
        if(serps.length > 0) curSettings.url += `&serps=${JSON.stringify(serps)}`;
        if(meals.length > 0) curSettings.url += `&meals=${JSON.stringify(meals)}`;
        if(prices.min !== 0 || prices.max !== 100000) curSettings.url += `&prices=${JSON.stringify(prices)}`;
        if($('#hotels').length > 0) {
            $('#hotels').html(`
                <div class="text-center" style="padding-top:50px;">
                    <div class="spinner-border" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                </div>
            `);
        }
        $.ajax(curSettings).done(response => {
            if(response.status != 'ok') {
                alert('error');
                console.error(response.error);
                return;
            }
            this.totalHotels = response.total_hotels;
            
            $('#search').attr('disabled', false);
            if($('#hotels').length == 0) {
                $('.search-results').html(`
                    <div class="col-12 d-lg-none"><button class="btn btn-primary w-100" id="filtersBtn">Фильтр</button></div>
                    <div id="filters" class="d-none d-lg-flex flex-lg-column col-lg-3"></div>
                    <div id="hotels" class="col-12 col-lg-9"></div>
                `);
                $('#hotels').append(`<div class="row"><div class="col-12" id="total_title"><h3>Найдено отелей: ${ this.totalHotels }</h3></div></div>`);
                $('#hotels').append('<div class="row col-12"><div class="col-12"><div class="card-deck" id="hotels_result"></div></div></div<');
            }
            $('#hotels').html(`<div class="row"><div class="col-12" id="total_title"><h3>Найдено отелей: ${ this.totalHotels }</h3></div></div>`);
            $('#hotels').append('<div class="row col-12"><div class="col-12"><div class="card-deck" id="hotels_result"></div></div></div<');
            this.hotels = response.hotels;
            this.renderFilters();
            this.renderHotels();
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
              if(!!this.hash_params.filter && !!this.hash_params.filters.prices) {
                this.hash_params.filters = { ...this.hash_params.filters, prices: { ...this.hash_params.filter.prices, min: parseInt(ui.values[0]) } };
                this.hash_params.filters = { ...this.hash_params.filters, prices: { ...this.hash_params.filter.prices, max: parseInt(ui.values[1]) } };
              }
              this.genHash();
              this.getHotels();
            }
        });
        $(`#star-filter input[type=\"checkbox\"]`).checkboxradio({
            icon: false
        });
        $(`#star-filter input`).click(({target}) => {
            let id = parseInt(target.dataset.id);
            if(this.filters.stars.indexOf(id) == -1) this.filters.stars.push(id);
            else this.filters.stars.splice(this.filters.stars.indexOf(id), 1);
            this.hash_params.filters = { ...this.hash_params.filters, stars: this.filters.stars };
            this.genHash();
            this.getHotels()
        });
        $(`#ratings-filter input[type=\"checkbox\"]`).checkboxradio({
            icon: false
        });
        $(`#ratings-filter input`).click(({target}) => {
            let id = parseInt(target.dataset.id);
            if(this.filters.ratings.indexOf(id) == -1) this.filters.ratings.push(id);
            else this.filters.ratings.splice(this.filters.ratings.indexOf(id), 1);
            this.hash_params.filters = { ...this.hash_params.filters, ratings: this.filters.ratings };
            this.genHash();
            this.getHotels();
        });
        $(`#serps-filter input[type=\"checkbox\"]`).checkboxradio({
            icon: false
        });
        $(`#serps-filter input`).click(({target}) => {
            let slug = target.id;
            if(this.filters.serps.indexOf(slug) == -1) this.filters.serps.push(slug);
            else this.filters.serps.splice(this.filters.serps.indexOf(slug), 1);
            this.hash_params.filters = { ...this.hash_params.filters, serps: this.filters.serps };
            this.genHash();
            this.getHotels();
        });
        $(`#meals-filter input[type=\"checkbox\"]`).checkboxradio({
            icon: false
        });
        $(`#meals-filter input`).click(({target}) => {
            let slug = target.id;
            if(this.filters.meals.indexOf(slug) == -1) this.filters.meals.push(slug);
            else this.filters.meals.splice(this.filters.meals.indexOf(slug), 1);
            this.hash_params.filters = { ...this.hash_params.filters, meals: this.filters.meals };
            this.genHash();
            this.getHotels();
        });
    }
    
    this.renderStars = stars => {
        if(stars == 0) return '';
        let output = '<span class="center">';
        for(var i=0;i<stars;i++)output+='<span class="fa fa-star checked"></span>';
        output += '</span>';
        return output;
    }
    this.renderHotels = (add = false) => {
        if(!add) $('#hotels_result').html('');
        let keys = Object.keys(this.hotels);
        let index = 0;
        let output = ''
        for(var i = 0; i < keys.length; i++) {
            let key = keys[i];
            let hotel = this.hotels[key];
            index += 1;
            if((index - 1) % 3 === 0) {
                output += `<div class="row">`;
            }
            output += `
            <div id="hotel-${hotel.id}}" class="card col-12 col-md-4" style="padding:0px;">
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
            if(index % 3 === 0 || index == Object.keys(this.hotels).length) {
                output += `</div>`;
            }
            // }
        };
        // 15 hotels per page
        if(this.page * 15 <= this.totalHotels) output += this.loadHotelsBtn;
        if(!add) $('#hotels_result').html(output);
        else $('#loadBtnContainer').replaceWith(output);
        $('#loadHotelsBtn').click(() => {
            this.addHotels();
        });
        $('.showmodal').click(({target}) => {
            let id = target.dataset.id;
            const { dates } = this.data;
            new ReserveService(this.hotels[id],  {
                guests: this.roomSelect.getInfo(),
                checkin : this.correctCheckDate(dates.in),
                checkout : this.correctCheckDate(dates.out)
            });
            this.hash_params.modal_open=id;
            $('#modalReserve').on('hidden.bs.modal', () => {
                delete this.hash_params.modal_open;
                this.genHash();
            });
            this.genHash();
        });
        if(!!this.hash_params.modal_open) {
            let id = this.hash_params.modal_open;
            const { dates } = this.data;
            new ReserveService(this.hotels[id],  {
                guests: this.roomSelect.getInfo(),
                checkin : this.correctCheckDate(dates.in),
                checkout : this.correctCheckDate(dates.out)
            });
            this.hash_params.modal_open=id;
            $('#modalReserve').on('hidden.bs.modal', () => {
                delete this.hash_params.modal_open;
                this.genHash();
            });
            this.genHash();
        }
        $('#total_title').html(`<h3>Найдено отелей: ${ this.totalHotels }</h3>`);
    }
    this.getMulticomplete = (req, callback) => {
        let curSettings = {
            ...this.settings,
            url: `${window.location.origin}${window.location.pathname}?mode=api&action=getMulticomplete&query=${req.term}`
        };
        $.ajax(curSettings).done(response => {
            let result = [];
            try{
                response.result.regions.map(region =>  result.push({label: `${ region.name }, ${region.country}`, value: region.id, type: 'region' }));
                response.result.hotels.map(hotel =>  result.push({label: `${ hotel.name }, ${hotel.region_name}`, value: hotel.id, type: 'hotel' }));
            } catch(ex) {
                console.log('Error', ex);
            }
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
                            <input class="form-control" id="dest" placeholder="Страна/город/отель" value="${!!this.data.dest.name ? decodeURI(this.data.dest.name) : ''}" />
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
        new InfoService(this.selector, isOpen => {
            if(isOpen) {
                this.hash_params.info_open = true;
            } else {
                delete this.hash_params.info_open;
            }
            this.genHash();
        });
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
                };
                if(!this.hash_params.search) this.hash_params.search = {};
                this.hash_params.search.dest = {
                    id: ui.item.value,
                    type: ui.item.type,
                    name: ui.item.label
                };
                console.log(this.hash_params);
                this.genHash();
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
                    if(!this.hash_params.search) this.hash_params.search = {};
                    if(type == 'in') {
                        if(!this.hash_params.search.dates) this.hash_params.search.dates = {};
                        this.data.dates.in = `${inst.currentYear}-${inst.currentMonth+1}-${inst.currentDay}`;
                        this.hash_params.search.dates.in = `${inst.currentYear}-${inst.currentMonth+1}-${inst.currentDay}`;
                    } else if(type == 'out') {
                        if(!this.hash_params.search.dates) this.hash_params.search.dates = {};
                        this.data.dates.out = `${inst.currentYear}-${inst.currentMonth+1}-${inst.currentDay}`;
                        this.hash_params.search.dates.out = `${inst.currentYear}-${inst.currentMonth+1}-${inst.currentDay}`;
                    }
                    this.genHash();
                }
            });
            if(!!this.data.dates[type]) {
                $(`#check${type}_date`).datepicker('setDate', new Date(this.data.dates[type]));
            }
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
                this.getHotels(false);
            }
        });

        // $(window).scroll($.proxy(() => {
        //     if($(window).scrollTop() + $(window).height() >= $(document).height()- 300) {
        //       console.log('Bottom =)');
        //       this.page += 1;
        //       this.getHotels(true);
        //     }
        //   }, this));

        if(!!this.data.dest.id && !!this.data.dest.type && !!this.data.dates.in && !!this.data.dates.out) {
            $('#search').click();
        }
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