import { LightningElement, track, api } from 'lwc';
// import { createRecord } from 'lightning/uiRecordApi';
// import conObject from '@salesforce/schema/Contact';
// import conFirstName from '@salesforce/schema/Contact.FirstName';
// import conLastName from '@salesforce/schema/Contact.LastName';
// import conBday from '@salesforce/schema/Contact.Birthdate';
// import conEmail from '@salesforce/schema/Contact.Email';

export default class AutomationOnListing extends LightningElement {
    
    @track isShowModal = false;
    @track emailSubject = '';
    @track draftEmail = '';

    showModalBox() {  
        this.isShowModal = true;
    }

    handleSubjectChange(event){
        this.emailSubject = event.detail.value;
        console.log(this.emailSubject);
    }

    handledraftEmail(event) {
        this.draftEmail = event.detail.value;
        console.log(this.draftEmail);
    }

    handleEmailsend(){
        
    }
    
    hideModalBox() {  
        this.isShowModal = false;
    }
}