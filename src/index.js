import Search from './Search';
import './styles.css';
import './datapicker.ru.js';
document.addEventListener('DOMContentLoaded', () => {
    if($ === undefined) throw new Error('JQuery is undefined.');
    // if(typeof($.fn.modal) == 'undefined') throw new Error('Bootstrap JS not loaded');
    let search = new Search('#app');
});