import { formatDate, mapMeal } from './Utils';

export default function InfoService() {
    this.stage = 0;
    this.poid = null;
    this.info = null;
    this.error = null;

    this.generateModal = output => `
        <div class="modal fade" id="modalInfo" tabindex="-1" role="dialog" aria-labelledby="Info Service" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="modalInfoTitle">Информация/отмена бронирования</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body" id="modalInfoBody">
                        ${output}
                    </div>
                    <div class="modal-footer" id="modalInfoFooter">
                    </div>
                </div>
            </div>
        </div>`;

    this.mapStatus = status => {
        switch(status) {
            case 'processing':
                return 'В обработке';
            case 'completed':
            case 'ok':
                return 'Забронировано';
            case 'cancelled':
                return 'Отменено';
            case '3ds':
                return 'Проходит 3D-Secure';
            case 'fraud':
                return 'Подозрительные данные. Проверка.';
            default:
                return 'Неизвестно';
        }
    }

    this.render = () => {
        let output = '';
        if(this.stage == -1) {
            output = `<h3>Произошла ошибка!</h3>`;
            if(this.error !== null) output += `<h4>${this.error}</h4>`;
            else output += `<h4>Попробуйте позже.</h4>`;
        } else if(this.stage == 0) {
            output = `
                <form id="info-form">
                    <div class="row col">
                        <label class="col-12 col-sm-7" for="poid">Номер вашего бронирования в системе 365-travels</label>
                        <div class="col-12 col-sm-5">
                            <input type="text" id="poid" class="form-control" required />
                        </div>
                    </div>
                    <div class="d-flex justify-content-center">
                        <button type="submit" class="btn btn-primary">Поиск</button>
                    </div>
                </form>`;
        } else if(this.stage == 1) {
            if(this.poid === null) {
                this.stage = -1;
                console.error('No poid');
                return this.render();
            }
            output = `
                <div class="text-center">
                    <div class="spinner-border" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                </div>
            `;
            $.ajax(`${window.location.origin}${window.location.pathname}?mode=api&action=reserve-info&partner_order_id=${this.poid}`)
                .done(resp => {
                    if(resp.debug.status === 200) {
                        this.info = resp.result;
                        this.stage += 1;
                        this.render();
                    } else {
                        console.error('Invalid resp 1');
                        this.stage = -1;
                        this.error = 'Бронирование с таким номером не найдено. Используйте номер, который был при успешном бронировании.';
                        this.render();
                    }
                });
        } else if(this.stage == 2) {
            // Display info
            if(this.info == null) {
                this.stage = -1;
                console.error('No info');
                return this.render();
            }
            let guests = '';
            this.info.order_data.guests_names.forEach(name => {
                guests += `<td>${name}</td>`;
            });
            output = `
                <table class="table">
                    <tr>
                        <td>Номер</td>
                        <td>${this.info.order_data.partner_order_id}</td>
                    </tr>
                    <tr>
                        <td>Статус</td>
                        <td>${this.mapStatus(this.info.order_data.status)}</td>
                    </tr>
                    <tr>
                        <td>Стоимость</td>
                        <td>
                            ${ this.info.order_data.price }
                        </td>
                    </tr>
                    <tr>
                        <td>Отель</td>
                        <td>${this.info.hotel_data.name}</td>
                    </tr>
                    <tr>
                        <td>Адрес</td>
                        <td>${this.info.hotel_data.address}</td>
                    </tr>
                    <tr>
                        <td>Номер</td>
                        <td>
                            ${ this.info.rate_data.room_name }<br />
                            ${ mapMeal(this.info.rate_data.meal) }
                        </td>
                    </tr>
                    <tr rowspan="${this.info.order_data.guests_names.length}">
                        <td>Гости</td>
                        ${guests}
                    </tr>
                    <tr>
                        <td>Заезд</td>
                        <td>${ formatDate(`${this.info.order_data.checkin_at} ${this.info.order_data.checkin_time}`) }</td>
                    </tr>
                    <tr>
                        <td>Выезд</td>
                        <td>${ formatDate(`${this.info.order_data.checkout_at} ${this.info.order_data.checkout_time}`) }</td>
                    </tr>
                    <tr>
                        <td>Бесплатная отмена</td>
                        <td>
                            ${ this.info.rate_data.cancellation_info.free_cancellation_before != null ? `до ${formatDate(this.info.rate_data.cancellation_info.free_cancellation_before)}` : 'нет'}
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2" class="text-center"><a target="_blank" href="${this.info.rate_data.hotelpage}">Больше информации</a></td>
                    </tr>
                    ${ this.info.order_data.status == 'completed' ? `
                        <tr>
                            <td colspan="2" class="text-center">
                                <button id="modalInfoCancelBtn" class="btn btn-danger">Отменить</button>
                            </td>
                        </tr>` : '' }
                </table>
            `;
        } else if(this.stage == 3) {
            // Подтверждение отмены
            output = `
                <div class="container-fluid">
                    <div class="row">
                        <div class="col-12">
                            <h3>Вы действительно хотите отменить бронирование?</h3>
                        </div>
                        <div class="col-12 d-flex justify-content-between">
                            <button id="cancel" class="btn btn-primary">Нет</button>
                            <button id="submit" class="btn btn-danger">Да</button>
                        </div>
                    </div>
                </div>
                `;
        } else if(this.stage == 4) {
            if(this.poid === null) {
                this.stage = -1;
                console.error('No poid');
                return this.render();
            }
            output = `
                <div class="text-center">
                    <div class="spinner-border" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                </div>
            `;
            $.ajax(`${window.location.origin}${window.location.pathname}?mode=api&action=cancel&partner_order_id=${this.poid}`)
                .done(resp => {
                    if(resp.debug.status === 200) {
                        let success = resp.result.success;
                        if(success) {
                            this.stage += 1;
                        } else if(!success && resp.result.error == 'cancellation_error') {
                            this.stage = -1;
                            this.error = 'Отменить бронирование либо уже поздно, либо запрещено политикой отеля.';
                        } else {
                            this.stage = -1;
                        }
                        this.render();
                    } else {
                        console.error('Invalid resp 3');
                        this.stage = -1;
                        this.render();
                    }
                });
        } else if(this.stage == 5) {
            output = '<h3>Бронирование номера отменено! Информация отправлена на почту.</h3>';
            output += '<h4>Если политика отеля предусматривает возврат средств при отмене, они вернуться в течении 30-40 дней.</h4>';
        }
        if($('#modalInfo').length > 0) {
            $('#modalInfoBody').html(output);
            $('#modalInfo').modal();
        } else {
            $('body').append(this.generateModal(output));
        }
        this.initEvents();
    }
    this.initEvents = () => {
        if(this.stage == 0) {
            $('#info-form').submit(ev => {
                ev.preventDefault();
                this.poid = $('#info-form #poid').val();
                if(!(/^[0-9]{16}$/g).test(this.poid)) {
                    let error = `
                        <small id="poidHelpBlock" class="form-text text-danger">
                            Номер бронирования состоит из 16 цифр.
                        </small>
                    `;
                    if($('#poidHelpBlock').length <= 0){
                        $(error).insertAfter('#poid');
                    }
                    $('#poid').addClass('border-danger');
                    return;
                }
                this.stage += 1;
                this.render();
            });
        } else if(this.stage == 2) {
            $('#modalInfoCancelBtn').click(() => {
                this.stage += 1;
                this.render();
            })
        } else if(this.stage == 3) {
            $('#cancel').click(() => {
                this.stage -= 1;
                this.render();
            });
            $('#submit').click(() => {
                this.stage += 1;
                this.render();
            });
        }
        $('#modalInfoBtn').click(() => {
            this.stage = 0;
            this.poid=null;
            this.info=null;
            this.render();
        });
    }
    this.render();

    return this;
}