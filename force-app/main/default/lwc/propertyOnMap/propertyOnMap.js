import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';

export default class PropertyOnMap extends LightningElement {
    @api recordId;
    mapMarkers = [];

    @wire(getRecord, { recordId: '$recordId', layoutTypes: ['Full'] })
    wiredRecord({ error, data }) {
        if (data) {
            const recordData = data.fields;
            const location = this.getLocationFromRecord(recordData);

            if (location) {
                this.mapMarkers = [{
                    location,
                    title: 'Location'
                }];
            } else {
                console.error('No location information found in record data');
            }
        } else if (error) {
            console.error('Error loading record', error);
        }
    }

    getLocationFromRecord(recordData) {
        // for property
        if (recordData.Street__c && recordData.City__c && recordData.State__c && recordData.Country__c && recordData.Postal_Code__c) {
            return {
                Street: recordData.Street__c.value,
                City: recordData.City__c.value,
                State: recordData.State__c.value,
                Country: recordData.Country__c.value,
                PostalCode: recordData.Postal_Code__c.value
            };
            // for lising
        } else if (recordData.Area__c && recordData.City__c && recordData.State__c && recordData.Postal_Code__c) {
            return {
                Street: recordData.Area__c.value,
                City: recordData.City__c.value,
                State: recordData.State__c.value,
                PostalCode: recordData.Postal_Code__c.value

            };
        }
        return null;
    }
}