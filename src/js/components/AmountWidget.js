import {select, settings} from '../settings.js';
import BaseWidget from './BaseWidget.js';
class AmountWidget extends BaseWidget{
  constructor(element){
    super(element, settings.amountWidget.defaultMin);
    const thisWidget = this;
    thisWidget.getElements(element);
    thisWidget.initActions();
    thisWidget.setMinMax();
    thisWidget.value = settings.amountWidget.defaultValue;
    //thisWidget.setValue(thisWidget.dom.input.value);
  }
  getElements(){
    const thisWidget = this;
    //thisWidget.element = element;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
    thisWidget.dom.min = thisWidget.dom.wrapper.getAttribute(select.widgets.amount.min);
    thisWidget.dom.max = thisWidget.dom.wrapper.getAttribute(select.widgets.amount.max);
  }
  setMinMax(){
    const thisWidget = this;
    const minAmount = parseInt(thisWidget.dom.min);
    const maxAmount = parseInt(thisWidget.dom.max);
    isNaN(minAmount) ? thisWidget.dom.min = settings.amountWidget.defaultMin : thisWidget.min = minAmount;
    isNaN(maxAmount) ? thisWidget.dom.max = settings.amountWidget.defaultMax : thisWidget.max = maxAmount;
  }
  isValid(value){
    const thisWidget = this;
    return !isNaN(value)
      && value >= thisWidget.dom.min 
      && value <= thisWidget.dom.max;
  }
  renderValue(){
    const thisWidget = this;
    thisWidget.dom.input.value = thisWidget.value;
  }
  initActions(){
    const thisWidget = this;
    thisWidget.dom.input.addEventListener('change', function(){
      thisWidget.value = thisWidget.dom.input.value;
    });
    thisWidget.dom.linkDecrease.addEventListener('click', function(){
      event.preventDefault();
      thisWidget.value = thisWidget.value - 1;
    });
    thisWidget.dom.linkIncrease.addEventListener('click', function(){
      event.preventDefault();
      thisWidget.value = thisWidget.value + 1;
    });
  }
}

export default AmountWidget;