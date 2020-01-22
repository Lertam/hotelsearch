import meals from './meals.json';
import serps from './serps.json';

/**
 * Helper function
 *
 * @param {String} str 
 * @returns {Boolean} True if string is blank (even if it contains only spaces)
 */
export const isBlank = str => {
    return (!str || /^\s*$/.test(str));
};

/**
 * 
 * @param {Number} number - Base of pluralization
 * @param {String} one - Word suffix if it is one
 * @param {String} two  - Word suffix if it is two
 * @param {String} five  - Word suffix if it is five
 */
export const getNoun = (number, one, two, five) => {
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
};

export const formatMoney = (amount, decimalCount = 2, decimal = ".", thousands = " ") => {
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


export const formatDate = dateStr => {
    let date = new Date(dateStr);
    let hours = date.getHours(),
        minutes = date.getMinutes(),
        day = date.getDate(),
        month = date.getMonth() + 1,
        year = date.getFullYear();
    return `${(hours < 10 ? ` 0${hours}` : hours)}:${(minutes < 10 ? ` 0${minutes}` : minutes)} ${(day < 10 ? ` 0${day}` : day)}.${(month < 10 ? ` 0${month}` : month)}.${year}`;
};

export const formatDistance = distance => {
    let output = '';
    if(distance >= 1) output += `${Math.round(distance * 10)/10}км`;
    else output += `${Math.round(distance * 1000)}м`;
    output += ' от центра города';
    return output;
}

export const getIcon = serp => {
    switch(serp){
        case 'has_parking':
            return { class: 'fas fa-parking', title: 'Парковка' };
        case 'has_meal':
            return { class: 'fas fa-utensils', title: 'Бар или ресторан' };
        case 'air-conditioning':
            return { class: 'fas fa-fan', title: 'Кондиционер' };
        case 'has_internet':
            return { class: 'fas fa-wifi', title: 'Бесплатный интернет' };
        case 'has_kids':
            return { class: 'fas fa-baby-carriage', title: 'Подходит для детей' };
        case 'has_pool':
            return { class: 'fas fa-swimming-pool', title: 'Бассейн' };
        case 'has_spa':
            return { class: 'fas fa-spa', title: 'Спа-услуги' };
        case 'has_smoking':
            return { class: 'fas fa-smoking', title: 'Можно курить' };
        case 'has_airport_transfer':
            return { class: 'fas fa-taxi', title: 'Трансфер' };
        case 'has_fitness':
            return { class: 'fas fa-heartbeat', title: 'Фитнес' };
        case 'has_busyness':
            return { class: 'fas fa-user-tie', title: 'Конференц-зал' };
        case 'has_ski':
            return { class: 'fas fa-skiing', title: 'Горнолыжный склон рядом' };
        // case 'beach':
        //     return { class: 'fas fa-umbrella-beach', title: 'Пляж рядом' };
        // case 'private-bathroom':
        //     return { class: 'fas fa-toilet', title: 'Ванная комната в номере' };
        // case 'window':
        //     return { class: 'fas fa-window-maximize', title: 'Окно в номере' };
        case 'has_pets':
            return { class: 'fas fa-paw', title: 'Разрешено с домашними животными' };
        case 'has_disabled_support':
            return { class: 'fas fa-blind', title: 'Для гостей с ограниченными возможностями' };
        default:
            return false;
    }
}

export const mapMeal = (meal_slug) => {
    let meal_title = meal_slug;
    meals.forEach((meal) => {
        if(meal.slug == meal_slug) {meal_title = meal.title; return 's';}
    });
    return meal_title;
};

export const mapSerps = (serp_slug) => {
    let serp_title = serp_slug;
    serps.hotel.forEach((serp) => {
        if(serp.slug == serp_slug) {serp_title = serp.title; return;}
    });
    serps.room.forEach((serp) => {
        if(serp.slug == serp_slug) {serp_title = serp.title; return;}
    });
    serps.features.forEach((serp) => {
        if(serp.slug == serp_slug) {serp_title = serp.title; return;}
    });
    return serp_title;
};