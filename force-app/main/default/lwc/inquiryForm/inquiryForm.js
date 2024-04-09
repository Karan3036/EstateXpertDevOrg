import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
// import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getInquiryFieldSet from '@salesforce/apex/InquiryFormController.getFieldSet';
import createInquiryRecord from '@salesforce/apex/InquiryFormController.createInquiryRecord';

export default class inquiryForm extends NavigationMixin(LightningElement) {
    inquiryFields = [];
    NewJson = {};
    type;
    path;
    NewArray = [];
    NewArray1 = [];
    passArray;

    @wire(getInquiryFieldSet, {
        objName: 'Inquiry__c',
        fieldSetName: 'InquiryFieldSet'
    })
    getResultsandFields({ error, data }) {
        if (data) {
            this.inquiryFields = JSON.parse(data);
            console.log(this.inquiryFields);
            console.log(this.inquiryFields.length);
            // this.fields =  this.inquiryFields.field;
            for (let i = 0; i < this.inquiryFields.length; i++) {
                this.fieldsType = this.inquiryFields[i];
                this.type = this.fieldsType['type'];
                this.path = this.fieldsType['fieldPath'];
                console.log(this.type);
                console.log(this.path);
                // this.NewJson = {
                //     path : this.path,
                //     type : this.type
                // }
                this.NewArray.push(this.type);
                this.NewArray1.push(this.path);
                // console.log(this.NewArray);
                // console.log((this.fieldsType).fieldPath);
                // console.log((this.fieldsType).type);
            }
            //   console.log(JSON.stringify(this.NewArray));
            //   console.log(this.NewJson);
            console.log(this.NewArray);


            // console.log(this.inquiryFields[0].type);
        } else if (error) {
            console.error('Error fetching inquiry fieldset', error);
        }
    }

    handleSubmit(event) {
        event.preventDefault();
        alert("success");
        // let fieldval = [];
        const fields = event.detail.fields;
        // console.log(JSON.parse(fields));
        console.log(fields);
        const jsonfields = JSON.stringify(fields);
        const jsonObject = JSON.parse(jsonfields);

        // Convert object to array of key-value pairs
        const keyValueArray = Object.entries(jsonObject);

        // Construct a Map from the array
        const mapFromJSON = new Map(keyValueArray);

        // Now you have a Map object
        console.log(mapFromJSON);
        
        // let fieldsString = JSON.stringify(fields);
        // Map<String, Object> m = (Map<String, Object>)JSON.deserializeUntyped(fieldsString);
        // for (Object obj : result) {
        //     Map < String, Object > map1 = (Map < String, Object >)obj;
        //     for (String key : map1.keyset()) {
        //         System.debug('Key -->> ' + key);
        //         System.debug('Value -->> ' + (String)map1.get(key));
        //     }

        // }
        // fieldval = fields;
        // console.log(fields);
        // console.log({fieldval});
        // console.log('fieldval-->',fieldval);
        // console.log(JSON.parse(fields));
        console.log(JSON.stringify(fields));
        // List<WrapperLine> alist = (List<WrapperLine>)JSON.deserialize(JSON.stringify(fields), List<WrapperLine>.class);
        // Map<String, Object> inquiry =  (Map<String, Object>) JSON.deserializeUntyped(JSON.stringify(fields));
        // console.log(alist);
        // console.log(fieldsString);
        // this.passArray = JSON.parse(NewArray);
        // console.log(this.passArray);
        createInquiryRecord({ mapFromJSON })
            .then(result => {
                // alert(JSON.stringify(result));
                this.handleSuccess(result);
            })
            .catch(error => {
                this.handleError(error);
            });
        // this.template.querySelector('lightning-record-edit-form').submit(fields);
    }

    // handleSuccess(recordId) {
    //     this.dispatchEvent(
    //         new ShowToastEvent({
    //             title: 'Success',
    //             message: 'Record created successfully' + recordId,
    //             variant: 'success'
    //         })
    //     );
    // }
    handleSuccess(result) {
        // const recId = event.detail.Id;
        alert('Record ' + result + ' Created Successfully');
        // this[NavigationMixin.Navigate]({
        //     type:'standard__recordPage',
        //     attributes:{
        //         recordId: recId,
        //         actionName :'view'
        //     }
        // });
    }
    // handleSuccess(event) {
    //     if (this.redirect == true) {
    //         console.log('handleSuccess' + this.redirect);
    //         let creditnoteId = event.detail.id;
    //         console.log('creditnoteId' + this.redcreditnoteIdirect);
    //         this[NavigationMixin.Navigate]({
    //             type: 'standard__recordPage',
    //             attributes: {
    //                 recordId: creditnoteId,
    //                 objectApiName: 'Inquiry__c',
    //                 actionName: 'view'
    //             }
    //         });
    //     }
    // }

    // handleError(error) {
    //     console.error('Error creating record:', error);
    //     this.dispatchEvent(
    //         new ShowToastEvent({
    //             title: 'Error',
    //             message: 'Error creating record: ' + JSON.stringify(error),
    //             variant: 'error'
    //         })
    //     );
    // }

    handleError(error) {
        console.log('Error creating record:', error.body.message);
        alert(error.body.message);
    }
}