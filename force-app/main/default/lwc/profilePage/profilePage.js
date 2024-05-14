import { LightningElement, track, wire } from 'lwc';
import estatexpertlogo from '@salesforce/resourceUrl/estatexpertlogo';
import profileBackground from '@salesforce/resourceUrl/profileBackground';
import newEstateLogo from '@salesforce/resourceUrl/newEstateLogo';
import { NavigationMixin } from 'lightning/navigation';
import demoImg from '@salesforce/resourceUrl/DemoImg1';
import { getRecord } from 'lightning/uiRecordApi';
import updateContact from '@salesforce/apex/ProfileController.updateContact';
import getContact from '@salesforce/apex/ProfileController.getContact';
import getGender from  '@salesforce/apex/ProfileController.getGender';
import saveContactAttachment from  '@salesforce/apex/ProfileController.saveContactAttachment';
import getContactImageAttachments from  '@salesforce/apex/ProfileController.getContactImageAttachments';


export default class ProfilePage  extends NavigationMixin (LightningElement) {
    @track logoImageUrl = estatexpertlogo;
    @track profilepicUrl = demoImg;
    @track profileBack = profileBackground;
    @track mobileLogoUrl = newEstateLogo;

    @track userId;
    @track name = '';
    @track firstName = '';
    @track lastName = '';
    @track gender = '';
    @track dob = '';
    @track age = '';
    @track phoneNumber = '';
    @track email = '';
    @track addressLine = '';
    @track city = '';
    @track pincode = '';
    @track state = '';
    @track country = '';
    @track description = '';
    @track dealsIn = '';
    @track operatesIn = '';
    @track recordTypeName;
    @track isAboutField = true;

    

    get backgroundStyle() {
        return `background-image: url(${this.profilepicUrl});`;
    }

    get backgroundImgStyle() {
        return `background-image: url(${this.profileBack}); width:100%; background-repeat:no-repeat; background-size:cover;`;
    }

    connectedCallback() {
        const userData = this.getCookie('contactInfo');
        console.log(userData);
        if (userData) {
            this.userId = userData.Id;
            console.log(this.userId);
            this.fetchContactData(this.userId);
        }else{
            this.navigateLogin();
        }
    }
    
    
    navigateLogin(event){
    this[NavigationMixin.Navigate]({

      "type": "standard__webPage",
      "attributes": {
          "url": "/login"
      }
  });
  }
  
    

    @wire(getRecord, { recordId: '$userId', fields: ['Contact.Name', 'Contact.MobilePhone', 'Contact.Email', 'Contact.RecordType.Name'] })
    wiredContact({ error, data }) {
        if (data) {
            this.recordTypeName = data.fields.RecordType.value.fields.Name.value;
            this.name = data.fields.Name.value;
            this.phoneNumber = data.fields.MobilePhone.value;
            this.email = data.fields.Email.value;
           
           console.log('Record Type Name:', this.recordTypeName);
           if (this.recordTypeName === 'Seller' || this.recordTypeName === 'Buyer') {
            this.isAboutField = false;
        } else {
            this.isAboutField = true; 
        }
        } else if (error) {
            console.error('Error fetching contact data', error);
        }
    }

    @wire(getContact, { contactId: '$userId' })
    wiredContactData({ error, data }) {
        if (data) {
            this.name = data.Name;
            this.phoneNumber = data.MobilePhone;
            this.email = data.Email;
            this.city = data.City__c;
            this.state = data.State__c;
            this.addressLine = data.Address_Line__c;
            this.pincode = data.Pincode__c;
            this.country = data.Country__c;
            this.description = data.Description;
            this.dealsIn = data.Deals_In__c;
            this.operatesIn = data.Deals_In__c;
            this.dob = data.Date_of_Birth__c;
            this.gender = data.Gender__c;
            this.age = data.Age__c;
            console.log(this.gender);

            const genderRadios = this.template.querySelectorAll('input[name="userGender"]');
        genderRadios.forEach(radio => {
            if (radio.value === this.gender) {
                radio.click();
            }
        });

        } else if (error) {
            console.error('Error fetching contact', error);
        }
    }

    genderOptions = [];

    @wire(getGender)
    wiredGender({error,data}){
        if(data){
            this.genderOptions = data;
        }else if(error){
            console.error('Error occured '+error);
        }
    }


    getCookie(name) {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [cookieName, cookieValue] = cookie.trim().split('=');
            if (cookieName === name) {
                return JSON.parse(decodeURIComponent(cookieValue));
            }
        }
        return null;
    }

    fetchContactData(userId) {
        this.userId = userId; 
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                // this.profilepicUrl = reader.result;
                this.saveAttachment(file);
            };
            reader.readAsDataURL(file);
        }
    }

    saveAttachment(file) {
        const reader = new FileReader();
        reader.onload = () => {
            const base64Data = reader.result.split(',')[1];
            const fileName = file.name;
            const contentType = file.type;
            saveContactAttachment({ contactId: this.userId, fileName, base64Data, contentType })
            .then(result => {
                console.log('Attachment saved with Id: ', result);
                this.profilepicUrl = 'data:image/jpeg;base64,' + base64Data;
            })
                .catch(error => {
                    console.error('Error saving attachment: ', error);
                });
        };
        reader.readAsDataURL(file);
    }

    @wire(getContactImageAttachments, {contactId: '$userId'})
    wiredAttachments({ error, data }) {
        if (data) {
            this.profilepicUrl = 'data:image/jpeg;base64,' + data;
            console.log('Image retrieved successfully!');
        } else if (error) {
            console.log('error in image ', error);
        }
    }

  
    calculateAge(dob) {
        const today = new Date();
        const birthDate = new Date(dob);
        if (!isNaN(birthDate.getTime())) {
            const ageDiff = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                this.age = ageDiff - 1;
            } else {
                this.age = ageDiff;
            }
        } else {
            console.error("Invalid date of birth:", dob);
        }
    }

    uploadProfileImage() {
        const inputElement = this.template.querySelector('input[type="file"]');
        inputElement.click();
    }

    handleInputChange(event) {
        const { name, value } = event.target;
    
        if (name === 'phoneNumber') {
            this.phoneNumber = value;
        } else if (name === 'dob') {
            this.dob = value;
            
           
            this.calculateAge(this.dob);
            console.log(this.age);
        } else if (name === 'email') {
            this.email = value;
        } else if (name === 'city') {
            this.city = value;
        } else if (name === 'state') {
            this.state = value;
        } else if (name === 'country') {
            this.country = value;
        } else if (name === 'pincode') {
            this.pincode = value;
        } else if (name === 'addressLine') {
            this.addressLine = value;
        } else if (name === 'description') {
            this.description = value;
        } else if (name === 'deals') {
            this.dealsIn = value;
        } else if (name === 'operates') {
            this.operatesIn = value;
        } else if (name === 'userGender') {
            this.gender = value;
        } else if (name === 'name') {
            const nameArray = value.split(' ');
            const firstName = nameArray[0];
            const lastName = nameArray.slice(1).join(' ');
    
            this.name = value;
            this.firstName = firstName;
            this.lastName = lastName;
        }
    }
    


    handleSave() {
        let fieldsToUpdate = {};

         console.log(fieldsToUpdate); 
        
        if (this.phoneNumber) {
            fieldsToUpdate.MobilePhone = this.phoneNumber;
        }
        if (this.firstName) {
            fieldsToUpdate.FirstName = this.firstName;
        }
        if (this.lastName) {
            fieldsToUpdate.LastName = this.lastName;
        }
        
        if (this.email) {
            fieldsToUpdate.Email = this.email;
        }
        if(this.dob) {
            fieldsToUpdate.Date_of_Birth__c = this.dob;
            fieldsToUpdate.Age__c = this.age; 
        }
        if(this.gender){
            fieldsToUpdate.Gender__c = this.gender;
        }
        if (this.addressLine) {
            fieldsToUpdate.Address_Line__c = this.addressLine;
        }
        if (this.city) {
            fieldsToUpdate.City__c = this.city;
        }
        if (this.state) {
            fieldsToUpdate.State__c = this.state;
        }
        if (this.country) {
            fieldsToUpdate.Country__c = this.country;
        }
        if (this.pincode) {
            fieldsToUpdate.Pincode__c = this.pincode;
        }
         if (this.dealsIn) {
            fieldsToUpdate.Deals_In__c = this.dealsIn;
        }
        if (this.description) {
            fieldsToUpdate.Description = this.description;
        }
        if (this.operatesIn) {
            fieldsToUpdate.Operates_In__c = this.operatesIn;
        }
        
        if (Object.keys(fieldsToUpdate).length === 0) {
            return;
        }
        
    
        updateContact({ 
            contactId: this.userId,
            fieldsToUpdate: fieldsToUpdate
        })
        .then(result => {
            console.log(fieldsToUpdate + ' updated success!!');
        })
        .catch(error => {
            console.error('error occured!! ', error);
        })

    }
    
}