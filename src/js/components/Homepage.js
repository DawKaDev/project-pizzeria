/* global tns */
import {settings, select, templates} from '../settings.js';
import {utils} from '../utils.js';
class Homepage {
  constructor(element){
    const thisHomepage = this;
    thisHomepage.getData();
    thisHomepage.render(element);
    thisHomepage.initWidgets();
  }
  getData(){
    const thisHomepage = this;
    const url = settings.db.url + settings.db.gallery;
    thisHomepage.data = {};
    thisHomepage.data.images = [
      '<img src="images/gallery/pizza-4.jpg">',
      '<img src="images/gallery/pizza-5.jpg">',
      '<img src="images/gallery/pizza-6.jpg">',
      '<img src="images/gallery/pizza-7.jpg">',
      '<img src="images/gallery/pizza-8.jpg">',
      '<img src="images/gallery/pizza-9.jpg">'
    ];
    thisHomepage.data.slide = [
      {
        'image': '<img src="images/gallery/pizza-3.jpg">',
        'title': 'Amazing Service!',
        'content': 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus pariatur autem atque quam assumenda quibusdam?',
        'author': 'Anton Petersen'
      },
      {
        'image': '<img src="images/gallery/pizza-9.jpg">',
        'title': 'See you soon!',
        'content': 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus pariatur autem atque quam assumenda quibusdam?',
        'author': 'Maggie Brown'
      },
      {
        'image': '<img src="images/gallery/pizza-7.jpg">',
        'title': 'Must have',
        'content': 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus pariatur autem atque quam assumenda quibusda?',
        'author': 'Drake White'
      }
    ];

    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){
        console.log('parsed',parsedResponse);
      });
  }
  render(element){
    const thisHomepage = this;
    const generatedHTML = templates.homepage(thisHomepage.data);
    thisHomepage.dom = {};
    thisHomepage.dom.wrapper = element;
    thisHomepage.dom.wrapper = utils.createDOMFromHTML(generatedHTML);
    thisHomepage.dom.slider = thisHomepage.dom.wrapper.querySelector('.slider-container');
    const homepageContainer = document.querySelector(select.containerOf.homepage);
    homepageContainer.appendChild(thisHomepage.dom.wrapper);
  }
  initWidgets()
  {
    const thisHomepage = this;
    thisHomepage.dom.slider = tns({
      container: '.slider-container',
      navPosition: 'bottom',
      controls: false,
      autoplay: false,
      loop: true
    });
  }
}
export default Homepage;