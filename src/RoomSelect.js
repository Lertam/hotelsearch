import { getNoun } from './Utils';

export default function RoomSelect(startScope = [], genHash) {
    this.dialogInitialized = false;
    this.rooms = [{
        adults: 1,
        children: []
    }];
    if(!!startScope && startScope.length > 0) this.rooms = startScope;
    this.getInfo = () => this.rooms;
    this.getBriefInfo = () => {
        let adults = 0;
        let children = 0;
        this.rooms.forEach(room => {
            adults += room.adults;
            children += room.children.length;
        });
        return {
            rooms: this.rooms.length,
            adults, children
        };
    };
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
        genHash(this.rooms);
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
        let totalRooms = this.rooms.length;
        return `<span>${totalRooms} комнат${getNoun(totalRooms, 'а','ы', '')}</span><span>${ totalGuests } гост${getNoun(totalGuests, 'ь', 'я', 'ей')}</span>`;
    }
    this.render = () => {
        genHash(this.rooms);
        let output = '<div class="d-flex justify-content-end"><button id="roomsClose" class="btnClose">&times;</button></div>';
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
                for(var i=0;i<room.children.length;i++) {
                    output += `<select data-id=${i} class="form-control">`;
                    for(var j=0;j<18;j++) output += `<option value=${j} ${room.children[i] == j ? 'selected': ''}>${j}</option>`;
                    output += `</select>`;
                }
                output += `</div></div>`
            }
            output += `</div></div></div>`;
        });
        output += '<button class="form-control" id="addRoom"><span class="fa fa-plus"></span></button>';
        $('#rooms').html(this.renderBrief());
        if(!this.dialogInitialized) {
            let open_button = $('#rooms');
            $('#dialog').dialog({
                autoOpen: false,
                position: { my: "left top", at: "left bottom", of: open_button},
                title: '',
                open: (ev, ui) => {
                    if($(window).width() < 540) $('.ui-dialog').css('left', `calc((100% - 300px) / 2)`);
                }
            });
            $('.ui-dialog-titlebar').hide();
            $('#rooms').click(() => {
                $('#dialog').dialog($('#dialog').dialog('isOpen') ? 'close' : 'open');
            });
            this.dialogInitialized = true;
        }
        $('#dialog').html(output);
        
        $('#roomsClose').click(() => {
            $('#dialog').dialog('close');
        })
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