import { LightningElement, api, wire, track } from 'lwc';
import getForm from '@salesforce/apex/FieldSetController.getForm';
import fetchListings from '@salesforce/apex/FieldSetController.fetchListings';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
// import UserName from '@salesforce/schema/User.Name';
// import { createRecord } from 'lightning/uiRecordApi';
// import userId from '@salesforce/user/Id';


export default class ListingWizardCmp extends NavigationMixin(LightningElement) {
    @api objectName = 'Listing__c';
    @api recordId;
    @api fieldSet = 'New_Listing';
    @track fields;
    @track mylist = [{name:'Create the new property',show:true,key:''}];
    @track foundDupli;
    @api message;
    a_Record_URL
    name;
    country;
    city;
    state;
    area;
    isLoading = true;
    isLoading2 = false;
    propertyId;
    isHandlingFieldChange = false;

    connectedCallback() {
        this.loadFormData();
        console.log(this.message);
        console.log(this.recordId);
        this.a_Record_URL = window.location.origin;
    }

    loadFormData() {
        getForm({ recordId: this.recordId, objectName: this.objectName, fieldSetName: this.fieldSet })
            .then(result => {
                console.log('Data:'+ JSON.stringify(result));
                if (result) {
                    this.fields = result.Fields;
                    this.error = undefined;
                }
                // this.isLoading = false;
                
            })
            .catch(error => {
                console.log(error);
                this.error = error;
            })
            .finally(() => {
                this.isLoading = false; 
            });
    }

    saveClick(event) {
        console.log('hi');
    
      
        event.preventDefault(); 

        const fields = event.detail.fields;

        // Update the PropertyId field value here
        fields['Property_Id__c'] = this.propertyId; 
        console.log(JSON.stringify(fields));
        // Submit the form with updated field values
        this.template.querySelector('lightning-record-edit-form').submit(fields);
    }

    handleButtonClick() {
        const inputFields = this.template.querySelectorAll('lightning-input-field');
        let fieldsData = {};
    
        inputFields.forEach(field => {
            fieldsData[field.fieldName] = field.value;
        });
    
        fieldsData['Property_ID__c'] = this.propertyId; 
    
        if (this.validateFields()) {
        this.template.querySelector('lightning-record-edit-form').submit(fieldsData);
        }
    }

    clearForm() {
        // Clear all input fields in the form
        const inputFields = this.template.querySelectorAll('lightning-input-field');
        inputFields.forEach(field => {
            field.reset();
        });
    }
    
    

    validateFields() {
        return [...this.template.querySelectorAll("lightning-input-field")].reduce((validSoFar, field) => {
            return (validSoFar && field.reportValidity());
        }, true);
    }

    handleSuccess(event) {
        this.showMessage('Record Saved Successfully', 'success');
        const recordId = event.detail.id;
        console.log('Record created:', recordId);
        window.open(this.a_Record_URL+'/lightning/r/Listing__c/' + recordId + '/view', '_blank');
     
    }

    handleError(event) {
        this.template.querySelector('[data-id="message"]').setError(event.detail.detail);
        event.preventDefault();
    }

    showMessage(message, variant) {
        const showToastEvent = new ShowToastEvent({
            title: 'Record Save',
            variant: variant,
            mode: 'dismissable',
            message: message
        });
        this.dispatchEvent(showToastEvent);
    }

    // handleFieldChange(event){
    //     const fieldName = event.target.fieldName;
    //     const fieldValue = event.target.value;

    //     try{
    //         // Perform actions based on the field name and value
    //         // this.mylist = [{name:'Create the new property',show:true,key:''}];
    //         if (fieldName === 'Name') {
    //             this.name = fieldValue;
    //         } else if (fieldName === 'Country__c') {
    //             this.country = fieldValue;
    //         }
    //          else if (fieldName === 'City__c') {
    //             this.city = fieldValue;
    //         }
    //         else if (fieldName === 'State__C') {
    //             this.state = fieldValue;    
    //         }
    //          else if (fieldName === 'Area__c') {
    //             this.area = fieldValue;
    //         }
    //         if (this.name != '' || this.country != '' || this.state!='' || this.area!='' || this.city!='') {
    //             if(fieldName === 'Name' || fieldName === 'Country__c'||fieldName === 'City__c'||fieldName === 'State__C'){
                    
    //                     this.fetchList();

    //             }
    //         }
    //         if(this.name == ''&& this.country == "" && this.city ==""  ){
    //             this.foundDupli = false;
    //         }
    //     }
    //     catch (error) {
          
    //         const showToastEvent = new ShowToastEvent({
    //             title: 'Fields Change',
    //             variant: 'Error',
    //             mode: 'dismissable',
    //             message: error
    //         });
    //         this.dispatchEvent(showToastEvent);
    //     }

    // }
    

    async handleFieldChange(event) {
        
        if (this.isHandlingFieldChange) {
            return;
        }
    
        this.isHandlingFieldChange = true;
    
        const fieldName = event.target.fieldName;
        const fieldValue = event.target.value;
    
        try {
           
            this.mylist = [{name:'Create the new property',show:true,key:''}];
            if (fieldName === 'Name') {
                this.name = fieldValue;
            } else if (fieldName === 'Country__c') {
                this.country = fieldValue;
            } else if (fieldName === 'City__c') {
                this.city = fieldValue;
            } else if (fieldName === 'State__C') {
                this.state = fieldValue;
            } else if (fieldName === 'Area__c') {
                this.area = fieldValue;
            }
    
            
            if (this.name !== '' || this.country !== '' || this.state !== '' || this.area !== '' || this.city !== '') {
                if (fieldName === 'Name' || fieldName === 'Country__c' || fieldName === 'City__c' || fieldName === 'State__C') {
                    setTimeout(() => {
                        this.fetchList();
                    }, 1000);
                //    await this.fetchList();
                }
            }
            if (this.name === '' && this.country === "" && this.city === "") {
                this.foundDupli = false;
            }
        } catch (error) {
            // Handle any errors
            const showToastEvent = new ShowToastEvent({
                title: 'Fields Change',
                variant: 'Error',
                mode: 'dismissable',
                message: error
            });
            this.dispatchEvent(showToastEvent);
        } finally {
            
            this.isHandlingFieldChange = false;
        }
    }
    
    fetchList() {

        console.log('In fetch list');
        try {
            let listObj = { 'sobjectType': 'Property__c' };
            
            if (this.name != '') {
                listObj.Name = this.name;
                listObj.City__c = this.city;
                listObj.State__c = this.state;
                listObj.Country__c = this.country;

                console.log('In the Search Prop'+listObj);
                
                fetchListings({ listin: listObj })
                    .then(result => {
                        console.log({result});
                        
                        this.foundDupli = true;
                        if(result != null){
                            if (Object.keys(result).length > 0 ) {
                                this.foundDupli = true;
                                this.isLoading2 = true;
        
                                setTimeout(() => {
                                    this.isLoading2 = false;
                                    this.mylist = [{ name: 'Create the new property', show: true, key: '' }];
                                    for (let key in result) {
                                        if(key.split('::')[0] != ''){
                                            this.mylist.push({
                                                value: result[key],
                                                key: key.split('::')[0],
                                                name: key.split('::')[1],
                                                address: key.split('::')[2],
                                                count: result[key].length
                                            });
                                        }
                                        
                                    }
                                }, 1000);
                                console.log({mylist});
                        }
                        } else {
    
                            setTimeout(() => {
                                this.isLoading2 = false;
                                this.foundDupli = false;
                            }, 1000);
                        }
    
                    })
                    .catch(error => {
                        console.log({ error });
                    });
            }else{
                setTimeout(() => {
                    this.isLoading2 = false;
                    this.foundDupli = false;
                }, 1000);

            }

        } catch (error) {
            this.dispatchEvent(new CustomEvent('error', {
                detail: {
                    method: 'ListingPage, Method: fetchList()',
                    error: error.message
                }
            }));
        }
    }

    getRadio(event) {
        try{
            this.propertyId = event.target.value;
            console.log(this.propertyId);
        }catch(e){
            const showToastEvent = new ShowToastEvent({
                title: 'Error to select property',
                variant: 'Error',
                mode: 'dismissable',
                message: e
            });
            this.dispatchEvent(showToastEvent);
        }
    }


    handleAcco(event) {
   
        try {

            event.currentTarget.querySelector('.showIconclass').classList.toggle('rotateIcon');
            this.id2 = event.currentTarget.id;
            this.id2 = this.id2.split('-')[0];
            var dId = event.target.id;
            dId = dId.split('-')[0];
            const cols = this.template.querySelectorAll('[data-id="' + this.id2 + '"]');
            

            cols.forEach(e => {
                e.classList.toggle('showH');
            })

        } catch (error) {
       
            const showToastEvent = new ShowToastEvent({
                title: 'Handle the listing accordian',
                variant: 'Error',
                mode: 'dismissable',
                message: error
            });
            this.dispatchEvent(showToastEvent);
        }
    }

    
    linkOpener(event) {
   
        try {
            var listingId = event.target.dataset.record;
            console.log(listingId);
            if(listingId != ''){
                window.open(this.a_Record_URL+'/lightning/r/Property__c/' + listingId + '/view', '_blank');
            
            }
        } catch (error) {
   
            const showToastEvent = new ShowToastEvent({
                title: 'Error to open property',
                variant: 'Error',
                mode: 'dismissable',
                message: error
            });
            this.dispatchEvent(showToastEvent);
        }
    }

    linkOpenerListing(event) {

        try {
            var listingId = event.target.dataset.record;
            if(listingId != ''){
                    window.open(this.a_Record_URL+'/lightning/r/Listing__c/' + listingId + '/view', '_blank');
            }
           
       
        } catch (error) {
       
            const showToastEvent = new ShowToastEvent({
                title: 'Error to open listing',
                variant: 'Error',
                mode: 'dismissable',
                message: error
            });
            this.dispatchEvent(showToastEvent);
        }
    }
}