import { LightningElement,api } from 'lwc';
import storeCustomSettings from '@salesforce/apex/MapFieldCmp.storeCustomSettings';

export default class mapFieldsCmp extends LightningElement {
    @api recordId;

    createPropertyRecord() {
       let listingRecordId = this.recordId;
       storeCustomSettings({listingRecordId})
            .then(result => {
                console.log(result);
            })
           
    }
}