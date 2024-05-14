import { LightningElement,track,wire } from 'lwc';
import ESTATEXPERT_LOGO from '@salesforce/resourceUrl/estatexpertlogo';
import LOGINBG from '@salesforce/resourceUrl/LoginBg';
import createContact from '@salesforce/apex/registrationPageController.createContact'
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import isDuplicateEmail from '@salesforce/apex/registrationPageController.isDuplicateEmail';
import isDuplicateUserName from '@salesforce/apex/registrationPageController.isDuplicateUserName';
import { NavigationMixin } from 'lightning/navigation';
import BACK_ARROW from "@salesforce/resourceUrl/RegistartionIcons";
import EMAIL_ICON from "@salesforce/resourceUrl/RegistartionIcons";
import PHONE_ICON from "@salesforce/resourceUrl/RegistartionIcons";
import PERSON_ICON from "@salesforce/resourceUrl/RegistartionIcons";
import PASS_ICON from "@salesforce/resourceUrl/RegistartionIcons";
import CONFIRM_PASS_ICON from "@salesforce/resourceUrl/RegistartionIcons";
import getSalutation from '@salesforce/apex/registrationPageController.getSalutation';
import getLoggedUser from '@salesforce/apex/registrationPageController.getLoggedUser';



export default class RegistrationPage extends NavigationMixin (LightningElement) {

    @track estateXpertUrl = ESTATEXPERT_LOGO;
    @track registationUrl = LOGINBG;
    @track backArrow = `${BACK_ARROW}#backArrow`;
    @track emailIcon = `${EMAIL_ICON}#emailIcon`;
    @track phoneIcon = `${PHONE_ICON}#phoneIcon`;
    @track personIcon = `${PERSON_ICON}#personIcon`;
    @track passwordIcon = `${PASS_ICON}#passIcon`;
    @track confirmPassIcon = `${CONFIRM_PASS_ICON}#confirmPassIcon`;


    get backgroundStyle() {
        return `
            background-image: url(${this.registationUrl});
            `
    }
    salutationOptions = [];

    @wire(getSalutation)
    wiredSalutations({error,data}){
      if(data){
        this.salutationOptions = data.map(option =>{
          return{
            label:option,
            value:option
          };
        });
      }else if(error){
        console.error('Error occured '+error);
      }
    }


    loggedUser = [];

    @wire(getLoggedUser)
    wiredLoggedUser({error,data}){
        if(data){
            this.loggedUser = data;
        }else if(error){
        console.error('Error occured '+error);
      }
    }
    
  @track selectedUserType;

  handleUserChange(event) {
      this.selectedUserType = event.target.value;
      console.log(this.selectedUserType);
  }
  userName = '';
  salutation='';
  lastname='';
  firstname='';
  email = '';
  signupError;
  password = '';
  confirmPassword = '';
  mobileNumber = '';
  agreedToTerms = false;
  @track errorMessages = {
      signup:'',
      userName: '',
      lastname:'',
      firstname:'',
      email: '',
      password: '',
      confirmPassword: '',
      mobileNumber: '',
      terms: '',
      salutation:''
  };
  success={
    confirm: false
  };

handleInputChange(event) {
  const fieldName = event.target.name;
  const fieldValue = event.target.value;

  if (fieldName === 'salutation') {
      this.salutation = fieldValue;
      if (this.salutation) {
          this.errorMessages.salutation = '';
      }
  } else if (fieldName === 'lastname') {
      this.lastname = fieldValue;
      if (this.lastname) {
          this.errorMessages.lastname = '';
      }
  } else if (fieldName === 'firstname') {
      this.firstname = fieldValue;
      if (this.firstname) {
          this.errorMessages.firstname = '';
      }
  } else if (fieldName === 'userName') {
      this.userName = fieldValue;
      if (this.userName.length >= 5 && this.userName.length <= 8) {
          this.errorMessages.userName = '';
      }
  } else if (fieldName === 'email') {
      this.email = fieldValue.toLowerCase(); 
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(this.email)) {
          this.errorMessages.email = '';
      }
  } else if (fieldName === 'password') {
      this.password = fieldValue;
      const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
      if (regex.test(this.password)) {
          this.errorMessages.password = '';
      }
  } else if (fieldName === 'confirmPassword') {
      this.confirmPassword = fieldValue;
      if (this.password === this.confirmPassword || !fieldValue) { 
        this.errorMessages.confirmPassword = '';
        this.success.confirm = !!fieldValue; 
    } else {
        this.errorMessages.confirmPassword = '*Password does not match';
        this.success.confirm = false;
    }
  } else if (fieldName === 'mobileNumber') {
      this.mobileNumber = fieldValue;
      const phoneNumberPattern = /^\d{10}$/; 
      if (phoneNumberPattern.test(this.mobileNumber)) {
          this.errorMessages.mobileNumber = '';
      }
  } else if (fieldName === 'terms') {
      this.agreedToTerms = event.target.checked;
      if (this.agreedToTerms) {
          this.errorMessages.terms = '';
      }
  }
  this.errorMessages.signup = '';

}


  navigateLogin(event){
    this[NavigationMixin.Navigate]({

      "type": "standard__webPage",
      "attributes": {
          "url": "/"
      }
  });
  }
  

handleSubmit(event) {
    if (
        !this.selectedUserType ||
        !this.userName ||
        !this.salutation ||
        !this.firstname ||
        !this.lastname ||
        !this.email ||
        !this.mobileNumber ||
        !this.password ||
        !this.confirmPassword
    ) {
        this.errorMessages.signup = 'Please fill in all required fields';
        return;
    } else {
        if (this.userName.length < 5 || this.userName.length > 8) {
            this.errorMessages.userName = '*Username must be between 5 and 8 characters.';
        } else {
            this.errorMessages.userName = '';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.email)) {
            this.errorMessages.email = '*Please enter a valid email address.';
        } else {
            this.errorMessages.email = '';
        }
        const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
        if (!regex.test(this.password)) {
            this.errorMessages.password = '*Password must have at least 8 characters, at least 1 uppercase letter, and at least 1 special character.';
        } else {
            this.errorMessages.password = '';
        }
        if (this.password !== this.confirmPassword) {
            this.errorMessages.confirmPassword = '*Password does not match.';
            this.success.confirm = false;
        } else {
            this.errorMessages.confirmPassword = '';
            this.success.confirm = true;
        }
        const phoneNumberPattern = /^\d{10}$/;
        if (!phoneNumberPattern.test(this.mobileNumber)) {
            this.errorMessages.mobileNumber = '*Please enter a valid 10-digit phone number.';
        } else {
            this.errorMessages.mobileNumber = '';
        }

        if (
            this.errorMessages.userName ||
            this.errorMessages.email ||
            this.errorMessages.password ||
            this.errorMessages.confirmPassword ||
            this.errorMessages.mobileNumber
        ) {
            return;
        }

        isDuplicateEmail({ email: this.email })
            .then(result => {
                if (result) {
                    this.errorMessages.signup = 'Email already exists!';
                } else {
                    isDuplicateUserName({ userName: this.userName })
                        .then(result => {
                            if (result) {
                                this.errorMessages.signup = 'Username already exists!';
                            } else {
                                createContact({
                                    recordType: this.selectedUserType,
                                    userName: this.userName,
                                    salutation: this.salutation,
                                    firstname: this.firstname,
                                    lastname: this.lastname,
                                    email: this.email,
                                    mobileNumber: this.mobileNumber,
                                    password: this.password
                                })
                                    .then(result => {
                                        this.dispatchEvent(
                                            new ShowToastEvent({
                                                title: 'Success',
                                                message: 'Contact created successfully!',
                                                variant: 'success'
                                            })
                                        );
                                        this.resetForm();
                                    })
                                    .catch(error => {
                                        this.signupError = error;
                                        this.dispatchEvent(
                                            new ShowToastEvent({
                                                title: 'Error',
                                                message: this.signupError.body.message,
                                                variant: 'error'
                                            })
                                        );
                                    });
                            }
                        })
                        .catch(error => {
                            console.error('Error occurred while checking for duplicate username: ' + error);
                        });
                }
            })
            .catch(error => {
                console.error('Error occurred while checking for duplicate email: ' + error);
            });
    }
}

resetForm() {
  const radioButtons = this.template.querySelectorAll('.radioIcon');

  radioButtons.forEach(button => {
      button.checked = false;
  });
  const termsCheckbox = this.template.querySelector('.agree');
    if (termsCheckbox) {
        termsCheckbox.checked = false;
    }

  const salutationDropdown = this.template.querySelector('.drop');
  salutationDropdown.selectedIndex = 0;

    this.userName = '';
    this.salutation = '';
    this.firstname = '';
    this.lastname = '';
    this.email = '';
    this.mobileNumber = '';
    this.password = '';
    this.confirmPassword='';
    this.success.confirm = false; 
    this.agreedToTerms = false;


    this.errorMessages = {
      signup: '',
      userName: '',
      lastname: '',
      firstname: '',
      email: '',
      password: '',
      confirmPassword: '',
      mobileNumber: '',
      terms: '',
      salutation:''
  };

}
}