import { LightningElement, track } from 'lwc';
import Footersvg from '@salesforce/resourceUrl/FooterSVG';

export default class FooterCmp extends LightningElement {
    @track image = Footersvg + '/footer-image.png';
    @track bg = Footersvg + '/blue-bg.png';
    @track grpImage = Footersvg + '/grp-image.png';
    @track rect = Footersvg + '/rect.png';
    @track twittoricon = Footersvg + '/twitter-Icon.png';
    @track facebookicon = Footersvg + '/facebook-Icon.png';
    @track linkdinicon = Footersvg + '/linkdin-Icon.png';
    @track instagramicon = Footersvg + '/instagram-Icon.png';
    @track phone = Footersvg + '/phone.png';
    @track email = Footersvg + '/email.png';

    handleInputPhone() {
        // This opens the default phone dialer with a predefined number
        console.log('phone click');
        const phoneNumber = "+917940372991";
        window.location.href = `tel:${phoneNumber}`;
    }

    handleInputEmail() {
        // This opens the default email application to compose an email
        console.log('email click');
        window.location.href = 'mailto:info@mvclouds.com';
    }

}