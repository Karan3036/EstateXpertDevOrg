import { LightningElement, track } from 'lwc';
import estatexpertlogo from '@salesforce/resourceUrl/estatexpertlogo';
import LoginBg from '@salesforce/resourceUrl/LoginBg';
import ResetPasswordSvg from '@salesforce/resourceUrl/ForgotPasswordSvg';
import resetContactPassword from '@salesforce/apex/ForgetAndResetPasswordController.resetContactPassword';
import PasswordEncryption from '@salesforce/apex/EncryptDecryptController.processEncryption';
import checkOldPassword from '@salesforce/apex/ForgetAndResetPasswordController.checkOldPassword';
import { NavigationMixin } from 'lightning/navigation';

export default class ResetPassword extends NavigationMixin(LightningElement) {
    logoImageUrl = '';
    @track errorMessage;
    @track OldPass = '';
    @track NewPass = '';
    @track NewRePass = '';
    @track encryptedPW = '';
    @track encryptedOldPW = '';
    @track decryptedPW = '';
    @track showOldPassword = 'password';
    @track showNewPassword = 'password';
    @track showReenterPassword = 'password';
    @track open1Eye = true;
    @track close1Eye = false;
    @track open2Eye = true;
    @track close2Eye = false;
    @track open3Eye = true;
    @track close3Eye = false;
    @track LoginBgUrl = LoginBg;
    svgIconsList = [];

    loadSvgIcons() {
        fetch(ResetPasswordSvg)
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
                    // this.template.querySelector('.email-icon').innerHTML = this.svgIconsList[1];
                    // this.template.querySelectorAll('.line').forEach(line => {
                    //     line.innerHTML = this.svgIconsList[2];
                    // });

                    // this.template.querySelector('.resend-icon').innerHTML = this.svgIconsList[3];
                    this.template.querySelectorAll('.password-icon').forEach(icon => {
                        icon.innerHTML = this.svgIconsList[4];
                    });
                    this.template.querySelectorAll('.openEye').forEach(icon => {
                        icon.innerHTML = this.svgIconsList[5];
                    });
                    this.template.querySelectorAll('.closeEye').forEach(icon => {
                        icon.innerHTML = this.svgIconsList[6];
                    });
            })
            .catch(error => {
                console.error('Error loading SVG icons:', error);
            });
    }

    connectedCallback() {
        this.logoImageUrl = estatexpertlogo;
    }

    renderedCallback() {
        this.loadSvgIcons();
        this.logoImageUrl = estatexpertlogo;
        console.log('hi' + estatexpertlogo);
        console.log('hi' + LoginBg);
        // const containerDiv = this.template.querySelector('[data-id="container"]');
        // // Set background image using inline style
        // containerDiv.style.backgroundImage = `url(${this.LoginBgUrl})`;
        // containerDiv.style.backgroundSize = "cover";
        // // containerDiv.style.height = '49.2em';
        // containerDiv.style.width = '100%';
        // this.getCookie('contactInfo');
    }

    handleBackClick() {
        this[NavigationMixin.Navigate]({
            "type": "standard__webPage",
            "attributes": {
                "url": "/"
            }
        });
    }

    handleOldPassChange(event) {
        this.errorMessage = '';
        this.OldPass = event.target.value;
    }

    handleNewPassChange(event) {
        this.errorMessage = '';
        this.NewPass = event.target.value;
    }

    handleNewRePassChange(event) {
        this.errorMessage = '';
        this.NewRePass = event.target.value;
    }

    preventPaste(event) {
        event.preventDefault();
    }

    // getCookie(cname) {
    //     let name = cname + "=";
    //     let decodedCookie = decodeURIComponent(document.cookie);
    //     let ca = decodedCookie.split(';');
    //     for(let i = 0; i < ca.length; i++) {
    //       let c = ca[i];
    //       while (c.charAt(0) == ' ') {
    //         c = c.substring(1);
    //       }
    //       if (c.indexOf(name) == 0) {
    //         return c.substring(name.length, c.length);
    //       }
    //     }
    //     return "";
    // }



    handlePassSubmit() {
        this.errorMessage = '';
        if (this.OldPass === '' && this.NewPass === '' && this.NewRePass === '') {
            this.errorMessage = 'All fields are required!';
            return;
        }

        if (this.OldPass === '') {
            this.errorMessage = 'Old password field must be filled.';
            return;
        }

        if (this.NewPass === '') {
            this.errorMessage = 'New password field must be filled.';
            return;
        }

        if (this.NewRePass === '') {
            this.errorMessage = 'Re-enter password field must be filled.';
            return;
        }

        if (this.NewPass !== this.NewRePass) {
            this.errorMessage = 'Passwords do not match. Please try again.';
            return;
        }

        const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
        if ((!regex.test(this.NewPass)) || (!regex.test(this.OldPass))) {
            this.errorMessage = 'Password must have at least 8 characters, at least one uppercase letter, and at least one special character.';
            return;
        }

        this.errorMessage = ''; // Clear any previous error messages

        // Get the contactInfo cookie value
        // const contactInfoCookie = this.getCookie('contactInfo');

        // // If there's a value, parse it as JSON
        // if (contactInfoCookie) {
        //     console.log(contactInfoCookie);
        //     const contactInfo = JSON.parse(contactInfoCookie);
        //     console.log('Contact Info:', contactInfo);
        // } else {
        //     console.log('Contact Info cookie not found.');
        // }

        this.email = 'griva1009@gmail.com';
        checkOldPassword({ email: this.email, oldPassword: this.OldPass })
            .then((isOldPasswordCorrect) => {
                if (!isOldPasswordCorrect) {
                    this.errorMessage = 'Old password is incorrect. Please try again.';
                    return;
                }

                PasswordEncryption({ passKey: this.NewPass })
                    .then((result) => {
                        this.encryptedPW = result;
                        console.log('Encrypting password:' + this.encryptedPW);
                        return resetContactPassword({ newPassword: this.encryptedPW, email: this.email });
                    })
                    .then(() => {
                        this.NewPass = '';
                        this.NewRePass = '';
                        this.OldPass = '';
                        this[NavigationMixin.Navigate]({
                            "type": "standard__webPage",
                            "attributes": {
                                "url": "/"
                            }
                        });
                        // this.errorMessage = 'Password updated successfully.';
                    })
                    .catch(error => {
                        this.errorMessage = 'Failed to update password. Please try again later.';
                        console.error('Error updating password:', error);
                    });
            })
            .catch((error) => {
                this.errorMessage = 'Error checking old password.';
                console.error('Error checking old password:', error);
            });
    }

    toggleOldPasswordVisibility() {
        if (this.showOldPassword == 'text') {
            this.showOldPassword = 'password';
            this.open1Eye = true;
            this.close1Eye = false;
        } else {
            this.showOldPassword = 'text';
            this.close1Eye = true;
            this.open1Eye = false;
        }
    }

    toggleNewPasswordVisibility() {
        if (this.showNewPassword == 'text') {
            this.showNewPassword = 'password';
            this.open2Eye = true;
            this.close2Eye = false;
        } else {
            this.showNewPassword = 'text';
            this.close2Eye = true;
            this.open2Eye = false;
        }
    }

    toggleReNewPasswordVisibility() {
        if (this.showReenterPassword == 'text') {
            this.showReenterPassword = 'password';
            this.open3Eye = true;
            this.close3Eye = false;
        } else {
            this.showReenterPassword = 'text';
            this.close3Eye = true;
            this.open3Eye = false;
        }
    }
}