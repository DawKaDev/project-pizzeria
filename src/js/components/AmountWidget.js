import {select, settings} from '../settings.js';
import BaseWidget from './BaseWidget.js';
class AmountWidget extends BaseWidget{
  constructor(element){
    super(element, settings.amountWidget.defaultValue);
    const thisWidget = this;
    thisWidget.getElements(element);
    thisWidget.initActions();
    thisWidget.setMinMax();
    //thisWidget.setValue(thisWidget.dom.input.value);
  }
  getElements(){
    const thisWidget = this;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
    thisWidget.min = thisWidget.dom.wrapper.getAttribute(select.widgets.amount.min);
    thisWidget.max = thisWidget.dom.wrapper.getAttribute(select.widgets.amount.max);
  }
  setMinMax(){
    const thisWidget = this;
    const minAmount = parseInt(thisWidget.min);
    const maxAmount = parseInt(thisWidget.max);
    isNaN(minAmount) ? thisWidget.min = settings.amountWidget.defaultMin : thisWidget.min = minAmount;
    isNaN(maxAmount) ? thisWidget.max = settings.amountWidget.defaultMax : thisWidget.max = maxAmount;
  }
  isValid(value){
    const thisWidget = this;
    return !isNaN(value)
     && value >= thisWidget.min 
     && value <= thisWidget.max;
  }
  renderValue(){
    const thisWidget = this;
    thisWidget.dom.input.value = thisWidget.value;
  }
  initActions(){
    const thisWidget = this;
    thisWidget.dom.input.addEventListener('change', function(){
      thisWidget.setValue(thisWidget.dom.input.value);
    });
    thisWidget.dom.linkDecrease.addEventListener('click', function(){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });
    thisWidget.dom.linkIncrease.addEventListener('click', function(){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }
}

export default AmountWidget;