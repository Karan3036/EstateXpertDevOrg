// import { LightningElement, wire, api, track } from 'lwc';
// import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
// import Street from '@salesforce/schema/Property__c.Street__c';
// import City from '@salesforce/schema/Property__c.City__c';
// import PostalCode from '@salesforce/schema/Property__c.Postal_Code__c';
// import Name from '@salesforce/schema/Property__c.Name';
// import State from '@salesforce/schema/Property__c.State__c';
// import Country from '@salesforce/schema/Property__c.Country__c';
// // import Image from '@salesforce/schema/PropertyMedia__c.FilenameUrlEncoded__c';

// export default class PropertiesMap extends LightningElement {
//     @api recordId;
//     @track mapMarkers;
//     @track openModal = false;

//     @wire(getRecord, {
//         recordId: '$recordId',
//         fields: [ Street, City, PostalCode, State, Country, Name ]
//     })
//     fetchAcc({ data, error }) {
//         if (data) {
//             this.mapMarkers = [
//                 {
//                     location: {
//                         Name: data.fields.Name.value,
//                         Street: data.fields.Street__c.value,
//                         City: data.fields.City__c.value,
//                         State: data.fields.State__c.value,
//                         Country: data.fields.Country__c.value,
//                         PostalCode: data.fields.Postal_Code__c.value,
//                     },
//                     title:data.fields.Name.value,
//                     // description:'<div onclick="handleClick()" style="color:red"><b>Hello</b></div>'
//                     description: '<img src="https://estatexpertlistingimages.s3.amazonaws.com/5570215.jpgwatermarkwatermark">'
//                 }   
//             ];
//             console.log('this.mapMarkers => ', JSON.stringify(this.mapMarkers));
//         } else if (error) {
//             console.error('ERROR => ', error);
//         }
//     }
    
    // handleClick()
    // {
    //     console.log('hello');
    //     var img = document.createElement('img'); 
    //     // Set the src attribute to the URL of the image 
    //     img.src = 'https://estatexpertlistingimages.s3.amazonaws.com/5570215.jpgwatermarkwatermark'; 
    //     // Append the img element to the document body or another element 
    //     document.body.appendChild(img); 
    // }

    // get imageUrl() {
    //     if (this.propertyMedia.data) {
    //         return this.propertyMedia.data.fields.FilenameUrlEncoded__c.value;
    //     }
    //     return null;
    // }
    
    // handleMarkerSelect()
    // {
    //     console.log('Clicked on marker!!');
    // }
    // showModal() {
    //     this.openModal = true;
    // }
    // closeModal() {
    //     this.openModal = false;
    // }
// }


// import { LightningElement, wire, api, track } from 'lwc';
// import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
// import Street from '@salesforce/schema/Property__c.Street__c';
// import City from '@salesforce/schema/Property__c.City__c';
// import PostalCode from '@salesforce/schema/Property__c.Postal_Code__c';
// import Name from '@salesforce/schema/Property__c.Name';
// import State from '@salesforce/schema/Property__c.State__c';
// import Country from '@salesforce/schema/Property__c.Country__c';
// // import getCoordinates from '@salesforce/apex/PropertyControllerV2.getCoordinates';

// export default class PropertiesMap extends LightningElement {
//     @api recordId;
//     @track mapMarkers;
//     @track googleMapsLink;

//     @wire(getRecord, {
//         recordId: '$recordId',
//         fields: [ Street, City, PostalCode, State, Country, Name ]
//     })
//     fetchAcc({ data, error }) {
//         if (data) {
//             const address = `${data.fields.Street__c.value}, ${data.fields.City__c.value}, ${data.fields.State__c.value}, ${data.fields.Country__c.value}, ${data.fields.Postal_Code__c.value}`;

//             this.googleMapsLink = `https://www.google.com/maps?q=${encodeURIComponent(address)}`;
//             console.log(this.googleMapsLink);
            
//             this.mapMarkers = [
//                 {
//                     location: {
//                         Name: data.fields.Name.value,
//                         Street: data.fields.Street__c.value,
//                         City: data.fields.City__c.value,
//                         State: data.fields.State__c.value,
//                         Country: data.fields.Country__c.value,
//                         PostalCode: data.fields.Postal_Code__c.value,
//                     },
//                     title: data.fields.Name.value,
//                     description: '<img src="https://estatexpertlistingimages.s3.amazonaws.com/5570215.jpgwatermarkwatermark">'
//                 }   
//             ];
//         } else if (error) {
//             console.error('ERROR => ', error);
//         }
//     }
// }



// PropertiesMap.js (LWC)
// import { LightningElement, wire, api, track } from 'lwc';
// import { getRecord } from 'lightning/uiRecordApi';
// import geocodeAddress from '@salesforce/apex/PropertyControllerV2.geocodeAddress';

// export default class PropertiesMap extends LightningElement {
//     @api recordId;
//     @track mapMarkers;
//     @track googleMapsLink;

//     @wire(getRecord, { recordId: '$recordId' })
//     fetchAcc({ data, error }) {
//         if (data) {
//             const address = `${data.fields.Street__c.value}, ${data.fields.City__c.value}, ${data.fields.State__c.value}, ${data.fields.Country__c.value}, ${data.fields.Postal_Code__c.value}`;
//             this.googleMapsLink = `https://www.google.com/maps?q=${encodeURIComponent(address)}`;
            
//             geocodeAddress({ address: address })
//                 .then(result => {
//                     if (result) {
//                         const { latitude, longitude } = result;
//                         this.mapMarkers = [{
//                             location: {
//                                 latitude: latitude,
//                                 longitude: longitude,
//                             },
//                             title: data.fields.Name.value,
//                             description: '<img src="https://estatexpertlistingimages.s3.amazonaws.com/5570215.jpgwatermarkwatermark">'
//                         }];
//                     }
//                 })
//                 .catch(error => {
//                     console.error('Error fetching coordinates:', error);
//                 });
//         } else if (error) {
//             console.error('ERROR => ', error);
//         }
//     }
// }



// import { LightningElement, wire } from 'lwc';
// import getCoordinates from '@salesforce/apex/PropertyControllerV2.getCoordinates';

// export default class PropertiesMap extends LightningElement {
//     markers = []; // Initialize markers array

//     // Wire method to fetch coordinates
//     @wire(getCoordinates, { street: '1600 Amphitheatre Parkway', city: 'Mountain View', state: 'CA', postalCode: '94043', country: 'USA' })
//     wiredCoordinates({ error, data }) {
//         if (data) {
//             // Parse latitude and longitude from data
//             let [latitude, longitude] = data.split(',');
//             // Create marker object
//             let marker = {
//                 location: {
//                     Latitude: latitude,
//                     Longitude: longitude
//                 }
//             };
//             // Set markers array with the marker
//             this.markers = [marker];
//         } else if (error) {
//             console.error('Error fetching coordinates:', error);
//         }
//     }
// }


// import { LightningElement, wire, api, track } from 'lwc';
// import { getRecord } from 'lightning/uiRecordApi';
// import Street from '@salesforce/schema/Property__c.Street__c';
// import City from '@salesforce/schema/Property__c.City__c';
// import PostalCode from '@salesforce/schema/Property__c.Postal_Code__c';
// import Name from '@salesforce/schema/Property__c.Name';
// import State from '@salesforce/schema/Property__c.State__c';
// import Country from '@salesforce/schema/Property__c.Country__c';
// import getCoordinates from '@salesforce/apex/PropertyControllerV2.getCoordinates';


// export default class PropertiesMap extends LightningElement {
//     @api recordId;
//     @track mapMarkers;
//     @track googleMapsLink;

//     @wire(getRecord, {
//         recordId: '$recordId',
//         fields: [ Street, City, PostalCode, State, Country, Name ]
//     })
//     fetchAcc({ data, error }) {
//         if (data) {
//             const address = `${data.fields.Street__c.value}, ${data.fields.City__c.value}, ${data.fields.State__c.value}, ${data.fields.Country__c.value}, ${data.fields.Postal_Code__c.value}`;

//             this.googleMapsLink = `https://www.google.com/maps?q=${encodeURIComponent(address)}`;
//             console.log(this.googleMapsLink);

//             this.mapMarkers = [
//                 {
//                     location: {
//                         Street: data.fields.Street__c.value,
//                         City: data.fields.City__c.value,
//                         State: data.fields.State__c.value,
//                         Country: data.fields.Country__c.value
//                     },
//                     title: data.fields.Name.value,
//                     description: '<img src="https://estatexpertlistingimages.s3.amazonaws.com/5570215.jpgwatermarkwatermark">'
//                 }   
//             ];
//         } else if (error) {
//             console.error('ERROR => ', error);
//         }
//     }
// }


import { LightningElement, wire, api, track } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import getCoordinatesFromGoogleMapsLink from '@salesforce/apex/PropertyControllerV2.getCoordinatesFromGoogleMapsLink';

export default class PropertiesMap extends LightningElement {
    @api recordId;
    @track mapMarkers = [];
    @track googleMapsLink;

    @wire(getRecord, {
        recordId: '$recordId',
        fields: [ 'Property__c.Street__c', 'Property__c.City__c', 'Property__c.Postal_Code__c', 'Property__c.State__c', 'Property__c.Country__c', 'Property__c.Name' ]
    })
    fetchAcc({ data, error }) {
        if (data) {
            const address = `${data.fields.Street__c.value}, ${data.fields.City__c.value}, ${data.fields.State__c.value}, ${data.fields.Country__c.value}, ${data.fields.Postal_Code__c.value}`;
            const googleMapsLink = 'https://maps.app.goo.gl/3fJ9ggbRUoE5TSSc9';

            // Call the Apex method to get coordinates
            getCoordinatesFromGoogleMapsLink({ googleMapsLink: googleMapsLink })
                .then(result => {
                    if (result.latitude && result.longitude) {
                        // Set mapMarkers here
                        this.mapMarkers = [{
                            location: {
                                Latitude: parseFloat(result.latitude),
                                Longitude: parseFloat(result.longitude)
                            },
                            title: data.fields.Name.value,
                            description: '<img src="https://estatexpertlistingimages.s3.amazonaws.com/5570215.jpgwatermarkwatermark">'
                        }];
                    }
                })
                .catch(error => {
                    // Handle error
                    console.error('Error fetching coordinates: ', error);
                });
        } else if (error) {
            console.error('ERROR => ', error);
        }
    }
}