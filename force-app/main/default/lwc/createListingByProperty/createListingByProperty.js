import { LightningElement,track,api,wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import createListingRecord from '@salesforce/apex/CreateListingByProperty.createListingRecord';

export default class CreateListingByProperty extends LightningElement {
    @api recordId;
    isLoading = false;

    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        if (currentPageReference) {
            this.recordId = currentPageReference.state.recordId;
        }
    }

    connectedCallback(){
        // this.isLoading = true;
        const recordId = this.recordId;
        console.log(recordId);
        createListingRecord({recordId}).then(result => {
           console.log(result);
        //    this.isLoading = false;
        })
    }

}