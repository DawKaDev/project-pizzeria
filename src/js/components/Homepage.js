/* global tns */
import {settings, select, templates} from '../settings.js';
import {utils} from '../utils.js';
class Homepage {
  constructor(element){
    const thisHomepage = this;
    thisHomepage.getData(element);
  }
  getData(element){
    const thisHomepage = this;
    const db = settings.db.url;
    thisHomepage.data = {};
    Promise.all([
      fetch(db + settings.db.gallery),
      fetch(db + settings.db.quatation),
    ])
      .then(function([galleryResponse, quatationResponse]){
        return Promise.all([
          galleryResponse.json(),
          quatationResponse.json(),
        ]);
      })
      .then(function([gallery, quatation]){
        thisHomepage.data.images = gallery;
        thisHomepage.data.slide = quatation;
        thisHomepage.render(element);
      });
  }
  render(element){
    const thisHomepage = this;
    const generatedHTML = templates.homepage(thisHomepage.data);
    thisHomepage.dom = {};
    thisHomepage.dom.wrapper = element;
    thisHomepage.dom.wrapper = utils.createDOMFromHTML(generatedHTML);
    thisHomepage.dom.slider = thisHomepage.dom.wrapper.querySelector(select.containerOf.slider);
    const homepageContainer = document.querySelector(select.containerOf.homepage);
    homepageContainer.appendChild(thisHomepage.dom.wrapper);
    thisHomepage.initWidgets();
  }
  initWidgets()
  {
    const thisHomepage = this;
    thisHomepage.dom.slider = tns({
      container: select.containerOf.slider,
      navPosition: 'bottom',
      controls: false,
      autoplay: false,
      loop: true
    });
  }
}
export default Homepage;