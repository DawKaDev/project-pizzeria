import {select, settings, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import CartProduct from './CartProduct.js';
class Cart {
  constructor(element){
    const thisCart = this;
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.initActions();
    thisCart.validate();
  }
  getElements(element){
    const thisCart = this;
    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleWrapper = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.formSubmit = thisCart.dom.wrapper.querySelector(select.cart.formSubmit);
    thisCart.dom.address = thisCart.dom.form.querySelector(select.cart.address);
    thisCart.dom.phone = thisCart.dom.form.querySelector(select.cart.phone);
    thisCart.renderTotalKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];
    for(let key of thisCart.renderTotalKeys){
      thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
    }
  }
  initActions(){
    const thisCart = this;
    thisCart.dom.toggleWrapper.addEventListener('click', function(){
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function(){
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function(){
      event.preventDefault();
      thisCart.sendOrder();
    });
    thisCart.dom.address.addEventListener('keyup', function(){
      thisCart.validate();
    });
    thisCart.dom.phone.addEventListener('keyup', function(){
      thisCart.validate();
    });
  }
  add(menuProduct){
    const thisCart = this;
    const generatedHTML = templates.cartProduct(menuProduct);
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    thisCart.dom.productList.appendChild(generatedDOM);
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    thisCart.update();
  }
  update(){
    const thisCart = this;
    let deliveryFee;
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;
    for(let product of thisCart.products){
      thisCart.subtotalPrice += product.price;
      thisCart.totalNumber += product.amount;
    }
    thisCart.totalNumber === 0 ? deliveryFee = 0 : deliveryFee = thisCart.deliveryFee;
    thisCart.totalPrice = thisCart.subtotalPrice + deliveryFee;
    for(let key of thisCart.renderTotalKeys){
      for(let elem of thisCart.dom[key]){
        elem.innerHTML = thisCart[key];
      }
    }
    thisCart.dom.toggleWrapper.classList.add('animated');
    thisCart.dom.wrapper.querySelector(select.cart.totalPrice).classList.add('animated');
    thisCart.validate();
  }
  remove(cartProduct){
    const thisCart = this;
    const indeks = thisCart.products.indexOf(cartProduct);
    thisCart.products.splice(indeks, 1);
    cartProduct.dom.wrapper.remove();
    thisCart.update();
  }
  validate(){
    const thisCart = this;
    const phone = thisCart.dom.phone.value.length;
    const address = thisCart.dom.address.value.length;
    const total = thisCart.dom['totalNumber'][0].innerHTML;
    if(phone < thisCart.dom.phone.getAttribute('minlength') || address < thisCart.dom.address.getAttribute('minlength') || total == 0)
    {
      thisCart.dom.formSubmit.setAttribute('disabled', true);
    }else{
      thisCart.dom.formSubmit.removeAttribute('disabled');
    }
    if(phone < thisCart.dom.phone.getAttribute('minlength')){
      thisCart.dom.phone.classList.add('error');
    }else{
      thisCart.dom.phone.classList.remove('error');
    }
    if(address < thisCart.dom.address.getAttribute('minlength')){
      thisCart.dom.address.classList.add('error');
    }else{
      thisCart.dom.address.classList.remove('error');
    }
  }
  reset(){
    const thisCart = this;
    thisCart.products = [];
    thisCart.dom.productList.innerHTML = '';
    thisCart.dom.address.value = '';
    thisCart.dom.phone.value = '';
    thisCart.update();
    thisCart.validate();
  }
  sendOrder(){
    const thisCart = this;
    const url = settings.db.url + settings.db.order;
    const payload = {
      adress: thisCart.dom.address,
      phone: thisCart.dom.phone,
      products: [],
    };
    for(let key of thisCart.renderTotalKeys){
      payload[key] = thisCart[key];
    }
    for(let product of thisCart.products){
      payload.products.push(product.getData());
    }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parserorder', parsedResponse);
      });
    thisCart.reset();
  }
}

export default Cart;