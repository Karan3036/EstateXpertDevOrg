import { LightningElement, api, wire } from 'lwc';
import { CurrentPageReference,NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createListingRecord from '@salesforce/apex/CreateListingByProperty.createListingRecord';

export default class CreateListingByProperty extends NavigationMixin(LightningElement) {
    @api recordId;
    isLoading = false;

    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        if (currentPageReference) {
            this.recordId = currentPageReference.state.recordId;
        }
    }

    connectedCallback() {
        const recordId = this.recordId;
        console.log(recordId);
        createListingRecord({ recordId })
            .then(result => {
                console.log(result);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Listing created successfully',
                        variant: 'success'
                    })
                );
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: this.recordId,
                        actionName: 'view',
                    },
                });
            })
            .catch(error => {
                console.error('Error creating listing', error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: error,
                        variant: 'error'
                    })
                );
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: this.recordId,
                        actionName: 'view',
                    },
                });
            });
    }
}