import {select, templates, settings, classNames} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
class Booking {
  constructor(element){
    const thisBooking = this;
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }
  getData(){
    const thisBooking = this;
    const startDayParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDayParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);
    const params = {
      booking: [
        startDayParam,
        endDayParam,
      ],
      eventsCurrent: [
        startDayParam,
        endDayParam,
        settings.db.notRepeatParam,
      ],
      eventsRepeat: [
        endDayParam,
        settings.db.repeatParam,
      ],
    };
    const urls = {
      booking:       settings.db.url + settings.db.booking + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + settings.db.event + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + settings.db.event + '?' + params.eventsRepeat.join('&'),
    };

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        //console.log(bookings);
        //console.log(eventsRepeat);
        //console.log(eventsCurrent);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;
    thisBooking.booked = {};
    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;
    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate,1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;
    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }
    const startHour = utils.hourToNumber(hour);
    
    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
  }
  
  updateDOM(){
    const thisBooking = this;
    const tables = thisBooking.dom.tables;
    let allAvailable = false;
    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);
    thisBooking.selectedTable = 0;
    thisBooking.dom.floor.classList.remove('error');
    if(typeof thisBooking.booked[thisBooking.date] == 'undefined' || typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'){
      allAvailable = true;
    }
    for(let table of tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      table.classList.remove('selected');
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }
      if(!allAvailable && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
        table.addEventListener('click', function(){
          tables.forEach(element => {
            element.classList.remove('selected');
          });
          table.classList.add('selected');
          thisBooking.selectedTable = tableId;
          thisBooking.validate();
        });
      }
    }
    thisBooking.validate();
  }

  validate(){
    const thisBooking = this;
    const address = thisBooking.dom.address.value.length;
    const phone = thisBooking.dom.phone.value.length;
    const tableId = thisBooking.selectedTable;
    const addressMin = thisBooking.dom.address.getAttribute('minlength');
    const phoneMin = thisBooking.dom.phone.getAttribute('minlength');
    let error = 0;
    if(address < addressMin){
      thisBooking.dom.address.classList.add('error');
      error+=1;
    } else {
      thisBooking.dom.address.classList.remove('error');
    }
    if(phone < phoneMin){
      thisBooking.dom.phone.classList.add('error');
      error+=1;
    } else {
      thisBooking.dom.phone.classList.remove('error');
    }
    if(tableId === 0){
      thisBooking.dom.floor.classList.add('error');
      error+=1;
    } else{
      thisBooking.dom.floor.classList.remove('error');
    }
    if(error!=0){
      thisBooking.dom.submit.setAttribute('disabled', true);
    } else {
      thisBooking.dom.submit.removeAttribute('disabled');
    }
  }
  sendBooking(){
    const thisBooking = this;
    const url = settings.db.url + settings.db.booking;
    const booking = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: thisBooking.selectedTable,
      duration: thisBooking.hoursAmount.value,
      ppl: thisBooking.peopleAmount.value,
      starters: [],
      address: thisBooking.dom.address.value,
      phone: thisBooking.dom.phone.value,
    };
    thisBooking.dom.starters.forEach(element =>{
      if(element.checked){
        booking.starters.push(element.value);
      }
    });
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(booking),
    };
    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parserorder', parsedResponse);
      });
    thisBooking.dom.form.reset();
    thisBooking.initWidgets();
    thisBooking.getData();
  }
  
  render(element){
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper = utils.createDOMFromHTML(generatedHTML);
    thisBooking.dom.timePicker = thisBooking.dom.wrapper.querySelector(select.booking.timePicker);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.peopleAmount.setAttribute(select.widgets.amount.min, 1);
    thisBooking.dom.peopleAmount.setAttribute(select.widgets.amount.max, 4);
    thisBooking.dom.hoursAmount.setAttribute(select.widgets.amount.min, 1);
    thisBooking.dom.hoursAmount.setAttribute(select.widgets.amount.max, 4);
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.cart.address);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.cart.phone);
    thisBooking.dom.submit = thisBooking.dom.wrapper.querySelector(select.booking.formSubmit);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);
    thisBooking.dom.floor = thisBooking.dom.form.querySelector('.floor-plan');
    thisBooking.dom.confirmation = thisBooking.dom.form.querySelector('[class*=order-confirmation]');
    const bookingContainer = document.querySelector(select.containerOf.booking);
    bookingContainer.appendChild(thisBooking.dom.wrapper);
    //console.log(thisBooking.dom.confirmation);
  }
  initWidgets(){
    const thisBooking = this;
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.timePicker.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });
    thisBooking.dom.address.addEventListener('keyup', function(){
      thisBooking.validate();
    });
    thisBooking.dom.phone.addEventListener('keyup', function(){
      thisBooking.validate();
    });
    thisBooking.dom.form.addEventListener('submit', function(){
      event.preventDefault();
      thisBooking.sendBooking();
    });
    /*thisBooking.dom.submit.addEventListener('click', function(){
      thisBooking.sendBooking();
    });*/
  }
}
export default Booking;