import { LightningElement, track } from 'lwc';
import estatexpertlogo from '@salesforce/resourceUrl/estatexpertlogo';
import LoginBg from '@salesforce/resourceUrl/LoginBg';
import ForgotPasswordSvg from '@salesforce/resourceUrl/ForgotPasswordSvg';
import ContactEmail from '@salesforce/apex/ForgetAndResetPasswordController.getContactEmail';
import SendEmail from '@salesforce/apex/SendEmailForOtp.sendEmail';
import validateOTP from '@salesforce/apex/ForgetAndResetPasswordController.validateOTP';
import resetContactPassword from '@salesforce/apex/ForgetAndResetPasswordController.resetContactPassword';
import PasswordEncryption from '@salesforce/apex/EncryptDecryptController.processEncryption';
import { NavigationMixin } from 'lightning/navigation';

export default class forgetAndResetPassword extends NavigationMixin(LightningElement) {
    logoImageUrl = '';
    @track inputValue;
    @track errorMessage;
    @track email;
    @track DoubleCode;
    @track verificationCode = '';
    @track inputCode = '';
    @track otpGeneratedTime;
    @track NewPass = '';
    @track NewRePass = '';
    @track encryptedPW = '';
    @track showNewPassword = 'password';
    @track showReenterPassword = 'password';
    @track open2Eye = true;
    @track close2Eye = false;
    @track open3Eye = true;
    @track close3Eye = false;
    @track LoginBgUrl = LoginBg;
    @track showForgotPassword = true;
    @track showOTPVerification = false;
    @track showResetPassword = false;
    svgIconsList = [];

    loadSvgIcons() {
        fetch(ForgotPasswordSvg)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load SVG icons');
                }
                return response.text(); // Return the Promise to chain another .then()
            })
            .then(data => {
                // console.log('OUTPUT : ',data);
                // Split the text into individual SVG icons
                this.svgIconsList = data.split('===');
                if (this.showForgotPassword == true) {
                    this.template.querySelector('.back-div').innerHTML = this.svgIconsList[0];
                    this.template.querySelector('.email-icon').innerHTML = this.svgIconsList[1];
                }
                if (this.showOTPVerification == true) {
                    this.template.querySelectorAll('.line').forEach(line => {
                        line.innerHTML = this.svgIconsList[2];
                    });

                    this.template.querySelector('.resend-icon').innerHTML = this.svgIconsList[3];
                }
                if (this.showResetPassword == true) {
                    this.template.querySelectorAll('.password-icon').forEach(icon => {
                        icon.innerHTML = this.svgIconsList[4];
                    });
                    this.template.querySelectorAll('.openEye').forEach(icon => {
                        icon.innerHTML = this.svgIconsList[5];
                    });
                    this.template.querySelectorAll('.closeEye').forEach(icon => {
                        icon.innerHTML = this.svgIconsList[6];
                    });
                }
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
    }

    handleBackClick() {
        if (this.showForgotPassword) {
            this[NavigationMixin.Navigate]({
                "type": "standard__webPage",
                "attributes": {
                    "url": "/"
                }
            });
            this.showForgotPassword = false;
            this.showOTPVerification = false;
            this.showResetPassword = false;
            this.errorMessage = '';
        }
        if (this.showOTPVerification) {
            this.inputCode = '';
            this.showForgotPassword = true;
            this.showOTPVerification = false;
            this.showResetPassword = false;
            this.errorMessage = '';
        }
        else if (this.showResetPassword) {
            this.showOTPVerification = true;
            this.showForgotPassword = false;
            this.showResetPassword = false;
            this.errorMessage = '';
        }
    }

    handleInputChange(event) {
        this.errorMessage = '';
        this.inputValue = event.target.value;
    }

    handleSubmit() {
        this.errorMessage = '';
        if (!this.inputValue) {
            this.errorMessage = 'Please enter an Username or Email.';
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        ContactEmail({ inputValue: this.inputValue })
            .then(result => {
                if (result && result.length > 0) {
                    console.log(result);
                    this.email = result;
                    this.DoubleCode = Math.floor(100000 + Math.random() * 900000); // Generate random 6-digit code
                    this.verificationCode = (Math.round(this.DoubleCode)).toString();
                    console.log(this.verificationCode);
                    SendEmail({ toSend: this.email, verificationCode: this.verificationCode })
                        .then((result) => {
                            this.otpGeneratedTime = result;
                            console.log(result);
                        })
                        .catch((err) => {
                            console.log(err);
                        })
                    this.showForgotPassword = false;
                    this.showOTPVerification = true;
                    this.errorMessage = '';
                } else {
                    console.log(result);
                    this.showForgotPassword = true;
                    this.showOTPVerification = false;
                    this.showResetPassword = false;
                    if (emailRegex.test(this.inputValue)) {
                        this.errorMessage = 'No contact record found with the provided email.';
                        this.inputValue = '';
                    } else {
                        this.errorMessage = 'No contact record found with the provided username.';
                        this.inputValue = '';
                    }
                }
            })
            .catch(error => {
                console.log(error);
                this.errorMessage = 'An error occurred while checking contact records';
            });
    }

    handleResendClick() {
        console.log('Resend clicked');
        this.clearOtpFields();
        this.errorMessage = '';
        this.DoubleCode = Math.floor(100000 + Math.random() * 900000); // Generate random 6-digit code
        this.verificationCode = (Math.round(this.DoubleCode)).toString();
        console.log(this.verificationCode);
        console.log(this.email);
        this.startAnimation();
        SendEmail({ toSend: this.email, verificationCode: this.verificationCode })
            .then((result) => {
                this.otpGeneratedTime = result;
                console.log(result);
            })
            .catch((err) => {
                console.log(err);
            })
    }

    clearOtpFields() {
        const otpFields = this.template.querySelectorAll('.verify-fields');
        otpFields.forEach(field => {
            field.value = ''; // Set the value to an empty string
        });
    }

    startAnimation() {
        const svgElement = this.template.querySelector('.resend-icon');
        if (svgElement) {
            svgElement.classList.add('rotate-animation'); // Add the rotation CSS class
        }
    }

    handleVerificationCode(event) {
        const inputField = event.target;
        const index = parseInt(inputField.dataset.index, 10);
        console.log(index);
        const value = inputField.value;
        console.log(value);

        // Allow only digits
        if (/\D/.test(value)) {
            inputField.value = value.replace(/\D/g, ''); // Remove non-digit characters
        }

        // Ensure that only a single digit is entered
        if (value.length > 1) {
            inputField.value = value.charAt(0); // Limit to one character
        }

        // Move focus to the next field if a digit is entered
        if (value && index < 5) {

            const nextField = this.template.querySelector(`input[data-index="${index + 1}"]`);
            if (nextField) {
                setTimeout(() => {
                    nextField.focus();
                }, 50); // Delayed to ensure smooth focus transition
            }
        }

        if (!value && index > 0) {
            const prevField = document.querySelector(`input[data-index="${index - 1}"]`);
            if (prevField) {
                setTimeout(() => {
                    prevField.focus();
                }, 50);
            }
        }

        // Update the input code with the concatenated values from all fields
        this.updateInputCode();
    }

    updateInputCode() {
        const fields = this.template.querySelectorAll('.verify-fields');
        this.inputCode = Array.from(fields).map(field => field.value).join('');
        console.log(this.inputCode);
    }

    handleKeyDown(event) {
        const index = parseInt(event.target.dataset.index, 10); // Get the current index

        if (event.key === 'Backspace' && !event.target.value && index > 0) {
            const prevField = this.template.querySelector(`input[data-index="${index - 1}"]`);
            if (prevField) {
                setTimeout(() => {
                    prevField.focus(); // Move focus to the previous field
                }, 50);
            }
        }
    }

    handleVerify() {
        if (!this.inputCode) {
            this.errorMessage = 'Please enter the OTP.';
        }
        console.log(this.inputCode);
        validateOTP({ submittedOtp: this.inputCode, verificationCode: this.verificationCode, otpGeneratedTime: this.otpGeneratedTime })
            .then((isValid) => {
                if (isValid) {
                    this.showForgotPassword = false;
                    this.showOTPVerification = false;
                    this.showResetPassword = true;
                    this.errorMessage = ''; // Clear error message
                    console.log('OTP validated successfully');
                } else {
                    this.clearOtpFields();
                    this.errorMessage = 'Invalid or expired OTP. Please try again.';
                }
            })
            .catch((error) => {
                console.error('Error validating OTP:', error);
                this.errorMessage = 'An error occurred while validating OTP. Please try again.';
            });
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

    handlePassSubmit() {
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
        if (!regex.test(this.NewPass)) {
            this.errorMessage = 'Password must have at least 8 characters, at least one uppercase letter, and at least one special character(!@#$%^&*).';
            return;
        }

        this.errorMessage = ''; // Clear any previous error messages
        PasswordEncryption({ passKey: this.NewPass })
            .then((result) => {
                this.encryptedPW = result;
                console.log('Encrypting password:' + this.encryptedPW);
                return resetContactPassword({ newPassword: this.encryptedPW, email: this.email });
            })
            .then(() => {
                this.NewPass = '';
                this.NewRePass = '';
                this[NavigationMixin.Navigate]({
                    "type": "standard__webPage",
                    "attributes": {
                        "url": "/"
                    }
                });
            })
            .catch(error => {
                this.errorMessage = 'Failed to update password. Please try again later.';
                console.error('Error updating password:', error);
            });
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