import { LightningElement, track } from 'lwc';

export default class WhatsappIntegration extends LightningElement {
    @track selectedPhoneNumber;

    phoneNumbers = [
        { label: '+91 98989 24118', value: '+91 98989 24118' },
        { label: '+91 95586 80273', value: '+91 95586 80273' }
    ];

    handlePhoneNumberChange(event) {
        this.selectedPhoneNumber = event.detail.value;
        console.log('SelectedPhone NUmber :::' , this.selectedPhoneNumber);
    }

    handleSubmit(event){
        console.log('Clicked');
    }
}