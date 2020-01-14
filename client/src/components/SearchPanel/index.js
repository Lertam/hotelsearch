import React from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-jqueryui-datepicker';

export default class SearchPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dest: {
                name: '', type: '', id: ''
            },
            dates: {
                in: '', out: ''
            }
        }
    }
    render() {
        return (
            <div class="container">
                <div class="container-fluid">
                    <div class="row search-panel">
                        <div class="ui-widget col-12 col-lg-5">
                            <div class="cool-input">
                                <input class="form-control" id="dest" placeholder="Страна/город/отель" value={this.state.dest.name} />
                            </div>
                        </div>
                        <div class="dates col-12 col-lg-3">
                            <div class="input-group">
                                <DatePicker onChange={e => console.log(e)} />
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
        );
    }
};