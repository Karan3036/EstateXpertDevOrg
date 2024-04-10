import { LightningElement } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import mapbox from '@salesforce/resourceUrl/MapboxJS';
import mapboxcss from '@salesforce/resourceUrl/MapboxCSS';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class mapsComponent extends LightningElement {    
    connectedCallback() {
        Promise.all([
            loadStyle(this, mapboxcss)
            // loadScript(this, mapbox + '/mapbox.js'),
        ]).then(() => {
            this.mapboxInitialized();
        })
        .catch(error => {
            console.error('Error loading Maps:', error);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error loading Maps',
                    message: 'An error occurred while loading Maps. See console for details.',
                    variant: 'error'
                })
            );
        });
    }
    mapboxInitialized(){
        mapboxgl.accessToken = "sk.eyJ1IjoiaGFyc2h2NTM0IiwiYSI6ImNsdXM1dDcxdTBmZWcycXVqZ2dhYzRiaGQifQ._f1CiXROzdbnb4kRbGSyXg";
        const map = new mapboxgl.Map({
            container:  this.template.querySelector('.map').id, // container ID
            style: 'mapbox://styles/mapbox/streets-v12', // style URL
            center: [-74.5, 40], // starting position [lng, lat]
            zoom: 9 
        });
    }
}