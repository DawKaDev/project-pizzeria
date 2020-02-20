/* global rangeSlider */
import {utils} from '../utils.js';
import {settings, select} from '../settings.js';
import BaseWidget from './BaseWidget.js';
//import rangeSlider from 'rangeSlider';

class HourPicker extends BaseWidget{
  constructor(wrapper){
    super(wrapper, settings.hours.open);
    const thisWidget = this;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.input);
    thisWidget.dom.output = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.output);
    //console.log(thisWidget);
    thisWidget.initPlugin();
    //console.log('test',thisWidget.dom.wrapper);
    thisWidget.value = settings.hours.open;
  }
  initPlugin(){
    const thisWidget = this;
    rangeSlider.create(thisWidget.dom.input, {});
    thisWidget.dom.input.addEventListener('input', function(event){
      thisWidget.value = event.target.value;
    });
  }
  parseValue(value){
    return utils.numberToHour(value);
  }
  isValid(){
    return true;
  }
  renderValue(){
    const thisWidget = this;
    thisWidget.dom.output.innerHTML = thisWidget.value;
  }
}
export default HourPicker;