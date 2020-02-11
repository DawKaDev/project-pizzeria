import {select, templates, classNames} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';
class Product{
  constructor(id, data){
    this.id = id;
    this.data = data;
    this.renderInMenu();
    this.getElements();
    this.initAccordion();
    this.initOrderForm();
    this.initAmountWidget();
    this.processOrder();
  }
  renderInMenu(){
    const generatedHTML = templates.menuProduct(this.data);
    this.element = utils.createDOMFromHTML(generatedHTML);
    const menuContainer = document.querySelector(select.containerOf.menu);
    menuContainer.appendChild(this.element);
  }
  getElements(){
    const thisProduct = this;
    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }
  initAccordion(){
    const thisProduct = this;
    /* find the clickable trigger (the element that should react to clicking) */
    //const accordion = thisProduct.element.querySelector(select.menuProduct.clickable);
    /* START: click event listener to trigger */
    thisProduct.accordionTrigger.addEventListener('click', function(){
      /* prevent default action for event */
      event.preventDefault();
      /* toggle active class on element of thisProduct */
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      /* find all active products */
      const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
      /* START LOOP: for each active product */
      activeProducts.forEach(product => {
        /* START: if the active product isn't the element of thisProduct */
        if(product!==thisProduct.element){
          /* remove class active for the active product */
          product.classList.remove(classNames.menuProduct.wrapperActive);
          /* END: if the active product isn't the element of thisProduct */
        }
        /* END LOOP: for each active product */
      });
      /* END: click event listener to trigger */
    });
  }
  initOrderForm(){
    const thisProduct = this;

    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });
    thisProduct.formInputs.forEach(input => {
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    });
    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }
  processOrder(){
    const thisProduct = this;
    const formData = utils.serializeFormToObject(thisProduct.form);
    const productParams = thisProduct.data.params;
    thisProduct.params = {};
    let price = thisProduct.data.price;

    for(let paramId in productParams){
      const param = productParams[paramId]; 
      for(let optionId in param.options){
        const option = param.options[optionId];
        const optionPrice = option.price;
        const isDefault = option.default;
        const images = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);
        if(formData.hasOwnProperty(paramId) && formData[paramId].includes(optionId)){
          if(!isDefault){
            price = price + optionPrice;
          }
          if(!thisProduct.params[paramId]){
            thisProduct.params[paramId] = {
              label: param.label,
              options: {},
            };
          }
          thisProduct.params[paramId].options[optionId] = option.label;

          for(let image of images){
            image.classList.add(classNames.menuProduct.imageVisible);
          }
        }else{
          if(isDefault){
            price = price - optionPrice;
          }
          for(let image of images){
            image.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }
    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
    thisProduct.priceElem.innerHTML = thisProduct.price;
  }
  initAmountWidget(){
    const thisProduct = this;
    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
  }
  reset(){
    const thisProduct = this;
    const productParams = thisProduct.data.params;
    thisProduct.params = {};
    for(let paramId in productParams){
      const param = productParams[paramId];
      for(let optionId in param.options){
        const option = param.options[optionId];
        //console.log(isDefault);
        //thisProduct.form.querySelector('#'+optionId).checked = false;
        if(productParams[paramId].options[optionId].hasOwnProperty('default')){
          if(param.type == 'select'){
            const select = thisProduct.form.querySelector('[name='+paramId+']');
            select.querySelector('[value='+optionId+']').selected = true;
          }else{
            thisProduct.form.querySelector('#'+optionId).checked = true;
          }
          if(!thisProduct.params[paramId]){
            thisProduct.params[paramId] = {
              label: param.label,
              options: {},
            };
          }
          thisProduct.params[paramId].options[optionId] = option.label;
        }else{
          if(param.type == 'select'){
            const select = thisProduct.form.querySelector('[name='+paramId+']');
            select.querySelector('[value='+optionId+']').selected = false;
          }else{
            thisProduct.form.querySelector('#'+optionId).checked = false;
          }
        }
      }
    }
  }
  addToCart(){
    let thisProduct = this;
    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;
    //app.cart.add(thisProduct);
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });

    thisProduct.element.dispatchEvent(event);
    //console.log(thisProduct.amountWidget);
    thisProduct.amount = thisProduct.amountWidget.min;
    thisProduct.amountWidget.input.value = thisProduct.amountWidget.min;
    thisProduct.amountWidget.value = thisProduct.amountWidget.min;
    thisProduct.reset();
    thisProduct.processOrder();
    //thisProduct = new Product(thisProduct.id, thisProduct.data);
  }
}

export default Product;