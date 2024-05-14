import { LightningElement,track,wire } from 'lwc';
import estatexpertlogo from '@salesforce/resourceUrl/estatexpertlogo';
import getContact from '@salesforce/apex/loginPageController.getContact';

import Icons from '@salesforce/resourceUrl/loginPageIcons';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from "lightning/navigation";


export default class LoginCmp extends NavigationMixin(LightningElement) {
    @track username = '';
    @track password = '';
    @track logoImageUrl =estatexpertlogo;
    @track showError1 = true;
    @track showError2 = true;
    @track showError3 = true;
    @track showError4 = true;
    @track backLogo = Icons+'/backIcon.png';
    @track emailLogo = Icons+'/emailIcon.png';
    @track passwordLogo = Icons+'/keyIcon.png';
    @track openEyes = Icons + '/openEye.png';
    @track closeEyes = Icons+'/closeEye.png';
    @track showpassword = 'password';
    @track openEye = true;
    @track closeEye = false;
    @track showSpinner = true;
   

    connectedCallback() {
        const cookieString = document.cookie;
        const cookies = cookieString.split(';');

        let contactInfo = {};
      
        for (let cookie of cookies) {

            if (cookie.includes('contactInfo')) {
        
                const contactInfoString = cookie.split('=')[1].trim();
                
                try {
                    contactInfo = JSON.parse(contactInfoString);
                } catch (error) {
                    console.error('Error parsing contactInfo:', error);
                }
          
                break;
            }
        }
        
        // Now contactInfo should contain the parsed object
        console.log('hi'+contactInfo);
    }


    validate(){
        this.showError1 = this.validateEmail();
    }

     delayedFunction() {
        this.showSpinner = false;
        console.log(this.showSpinner);
    }
    
    validateEmail() {
        const email = this.username;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    handleUsernameChange(event) {
        this.username = event.target.value;
    }

    handlePasswordChange(event) {
        this.password = event.target.value;
    }

    handleLogin() {
        
        const emailId = this.username;
        const password = this.password; 
        if(this.username == ''){
            this.showError3 = false;
            this.showError1 = true;
        }else{
            this.showError3 = true;
            this.showError2= true;
        }
        if(this.password == ''){
            this.showError4 = false;
        }else{
            this.showError4 = true;
        }
        if( this.username != '' && this.password != ''){
            getContact({emailName:emailId,password:password}).then(response => {
                if(response.message == 'Login'){
                    console.log('login');
                    const contactInfo = { email: emailId, password: password };
                    const contactInfoJson = JSON.stringify(response.contact);
                    document.cookie = `contactInfo=${contactInfoJson}; expires=Thu, 31 Dec 2026 23:59:59 GMT; path=/`;
                    console.log('Cookie:', document.cookie);
                    this[NavigationMixin.Navigate]({
                        "type": "standard__webPage",
                        "attributes": {
                            "url": "https://mvcloudsprivatelimited2-dev-ed.develop.my.site.com/s/property-list-view"
                        }
                    });
                   // document.cookie = `contactInfo=${contactInfoJson}; expires=Thu, 31 Dec 2002 23:59:59 GMT; path=/`;
                   // console.log('Cookie:', document.cookie);
                    const showToastEvent = new ShowToastEvent({
                        title: 'Login Successfully',
                        variant: 'Success',
                        mode: 'dismissable'
                    });
                    this.dispatchEvent(showToastEvent);
                }
                 if(response.message == 'Password'){
                    this.showError2 = false;
                    this.showError1 = false;
                }else{
                    this.showError2 = true;
                }
                
                if(response.message == 'EmailNot'){
                    this.showError1 = false;
                }else{
                    this.showError1 = true;
                }
            })
        }
    }

    deleteCookie(cookieName) {
        document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    }

    clickforgot(){
        this[NavigationMixin.Navigate]({

            "type": "standard__webPage",
            "attributes": {
                "url": "/ForgotPassword"
            }
        });
    }

    backClick(){
        this[NavigationMixin.Navigate]({

            "type": "standard__webPage",
            "attributes": {
                "url": "https://mvcloudsprivatelimited2-dev-ed.develop.my.site.com/s/property-list-view"
            }
        });
    }
    
    signclick(){
        this[NavigationMixin.Navigate]({

            "type": "standard__webPage",
            "attributes": {
                "url": "https://mvcloudsprivatelimited2-dev-ed.develop.my.site.com/s/login/SelfRegister"
            }
        });
    }

    togglePasswordVisibility() {
        if(this.showpassword=='text'){
            this.showpassword = 'password';
            this.openEye = true;
            this.closeEye = false;
        }else{
            this.showpassword = 'text';
            this.closeEye = true;
            this.openEye = false;
        }
    }
}