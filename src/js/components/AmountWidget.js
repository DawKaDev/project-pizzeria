import {select, settings} from '../settings.js';
class AmountWidget{
  constructor(element){
    const thisWidget = this;
    thisWidget.getElements(element);
    thisWidget.initActions();
    thisWidget.setMinMax();
    thisWidget.value = thisWidget.min;
    thisWidget.setValue(thisWidget.input.value);
  }
  getElements(element){
    const thisWidget = this;
    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    thisWidget.min = thisWidget.element.getAttribute(select.widgets.amount.min);
    thisWidget.max = thisWidget.element.getAttribute(select.widgets.amount.max);
  }
  setMinMax(){
    const thisWidget = this;
    const minAmount = parseInt(thisWidget.min);
    const maxAmount = parseInt(thisWidget.max);
    isNaN(minAmount) ? thisWidget.min = settings.amountWidget.defaultMin : thisWidget.min = minAmount;
    isNaN(maxAmount) ? thisWidget.max = settings.amountWidget.defaultMax : thisWidget.max = maxAmount;
  }
  setValue(value){
    const thisWidget = this;
    const newValue = parseInt(value);
    if(newValue!=thisWidget.value && newValue >= thisWidget.min && newValue <= thisWidget.max){
      thisWidget.value = newValue;
      thisWidget.announce();
    }
    thisWidget.input.value = thisWidget.value;
  }
  initActions(){
    const thisWidget = this;
    thisWidget.input.addEventListener('change', function(){
      thisWidget.setValue(thisWidget.input.value);
    });
    thisWidget.linkDecrease.addEventListener('click', function(){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });
    thisWidget.linkIncrease.addEventListener('click', function(){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }
  announce(){
    const thisWidget = this;
    const event = new CustomEvent('updated', {
      bubbles: true
    });
    thisWidget.element.dispatchEvent(event);
  }
}

export default AmountWidget;