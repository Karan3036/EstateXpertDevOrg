import { LightningElement,track,wire } from 'lwc';
import estatexpertlogo from '@salesforce/resourceUrl/estatexpertlogo';
import getContact from '@salesforce/apex/loginPageController.getContact';
import 	LoginBg from '@salesforce/resourceUrl/LoginBgs';
import 	svgIcons from '@salesforce/resourceUrl/svgIcons';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from "lightning/navigation";


export default class LoginCmp extends NavigationMixin(LightningElement) {
    @track username = '';
    @track password = '';
    logoImageUrl ='';
    showError1 = true;
    showError2 = true;
    showError3 = true;
    showError4 = true;
    svgIcon1
    svgIcon2
    svgIcon3
    showpassword = 'password';
    @track showSpinner = true;
    @track LoginBgUrl = LoginBg;
    svgIconsList = [];

    loadSvgIcons() {
        fetch(svgIcons)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load SVG icons');
                }
                return response.text(); // Return the Promise to chain another .then()
            })
            .then(data => {
                // Split the text into individual SVG icons
                this.svgIconsList = data.split('===');
                this.template.querySelector('.back-div').innerHTML = this.svgIconsList[0];
                this.template.querySelector('.email-icon').innerHTML = this.svgIconsList[1];
                this.template.querySelector('.password-icon').innerHTML = this.svgIconsList[2];
                // this.template.querySelector('.eye-icon').innerHTML = this.svgIconsList[3];
                console.log(this.svgIcon1);
            })
            .catch(error => {
                console.error('Error loading SVG icons:', error);
            });
    }
    

    connectedCallback() {
    //    this.showSpinner = false;
    //    this.showSpinner = false;
       this.loadSvgIcons();
       this.logoImageUrl = estatexpertlogo;
       this.LoginBgUrl = LoginBg;
       
       setTimeout(() =>{
            this.showSpinner = false;
       }, 3000);
    }

    // renderedCallback(){
    //     setTimeout(this.delayedFunction, 3000);
        // this.logoImageUrl = estatexpertlogo;
    //     console.log('hi'+estatexpertlogo);
    //     console.log('hi'+LoginBg);
    //     // this.LoginBgUrl = LoginBg;
    //     // const containerDiv = this.template.querySelector('[data-id="container"]');
    //     // // Set background image using inline style
    //     // containerDiv.style.backgroundImage = `url(${this.LoginBgUrl})`;
    // }

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
        
        // if(this.username == ''){
        //     this.showError3 = false;
        //     this.showError1 = true;
        // }else{
        //     this.showError3 = true;
        // }
    }

    handlePasswordChange(event) {
        this.password = event.target.value;
        // if(this.username == ''){
        //     this.showError4 = false;
        //     this.showError2 = true;
        // }else{
        //     this.showError4 = true;
        // }
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
                    // Log the cookie to console
                    console.log('Cookie:', document.cookie);
                    window.location.href = 'https://mvcloudsprivatelimited2-dev-ed.develop.my.site.com/s/';
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
        // Set the expiration date of the cookie to a date in the past
        document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    }

    togglePasswordVisibility() {
        if(this.showpassword=='text'){
            this.showpassword = 'password';
        }else{
            this.showpassword = 'text';
        }
    }
}