import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getInquiryFieldSet from '@salesforce/apex/InquiryFormController.getFieldSet';
import createInquiryRecord from '@salesforce/apex/InquiryFormController.createInquiryRecord';

export default class inquiryForm extends NavigationMixin(LightningElement) {
    inquiryFields = [];
    type;
    path;
    NewArray = [];
    NewArray1 = [];

    @wire(getInquiryFieldSet, {
        objName: 'Inquiry__c',
        fieldSetName: 'InquiryFieldSet'
    })
    getResultsandFields({ error, data }) {
        if (data) {
            this.inquiryFields = JSON.parse(data);
            console.log(this.inquiryFields);
            console.log(this.inquiryFields.length);
            for (let i = 0; i < this.inquiryFields.length; i++) {
                this.fieldsType = this.inquiryFields[i];
                this.type = this.fieldsType['type'];
                this.path = this.fieldsType['fieldPath'];
                console.log(this.type);
                console.log(this.path);
                this.NewArray.push(this.type);
                this.NewArray1.push(this.path);
            }
            console.log(this.NewArray);
        } else if (error) {
            console.error('Error fetching inquiry fieldset', error);
        }
    }

    handleSubmit(event) {
        event.preventDefault();
        const fields = event.detail.fields;
        console.log(fields);
        const jsonfields = JSON.stringify(fields);
        const jsonObject = JSON.parse(jsonfields);
        const keyValueArray = Object.entries(jsonObject);
        const mapFromJSON = new Map(keyValueArray);
        console.log(mapFromJSON);
        console.log(JSON.stringify(fields));

        createInquiryRecord({ fieldss: Object.fromEntries(mapFromJSON) })
            .then(result => {
                console.log(result);
                console.log(JSON.stringify(result));
                this.handleSuccess(result);
            })
            .catch(error => {
                this.handleError(error);
            });
    }

    handleSuccess(result) {
        const inputFields = this.template.querySelectorAll('lightning-input-field');
        if (inputFields) {
            inputFields.forEach(field => {
                field.reset();
            });
        }
    }

    handleError(error) {
        console.log('Error creating record:', error.body.message);
        alert(error.body.message);
    }
}