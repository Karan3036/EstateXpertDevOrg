import { LightningElement, track, api } from 'lwc';
import { loadStyle, loadScript } from 'lightning/platformResourceLoader';
import mapboxCss from '@salesforce/resourceUrl/MapboxCSS';
import mapboxJs from '@salesforce/resourceUrl/MapboxJS';


export default class Mapboxpoc extends LightningElement {

    @api mapCenter; // Example: Receive map center coordinates as an input property
    mapboxInitialized = false;

    // Access Token :-  sk.eyJ1IjoiaGFyc2h2NTM0IiwiYSI6ImNsdXM2Ym1hdjBnMXEyanBhaDloNGo4MGMifQ.nmUKpFUr8VSHskkfz2PijA


    renderedCallback() {
        if (this.mapboxInitialized) {
            return;
        }

        Promise.all([
            loadScript(this, mapboxJs),
            loadStyle(this, mapboxCss)
        ])
        .then(() => {
            console.log('Map Loaded Success')
            this.initializeMapbox();
        })
        .catch(error => {
            console.error('Error loading Mapbox:', error);
        });
    }

    initializeMapbox() {
        const mapContainer = this.template.querySelector('.map');
        const map = new mapboxgl.Map({
            accessToken: 'sk.eyJ1IjoiaGFyc2h2NTM0IiwiYSI6ImNsdXM2Ym1hdjBnMXEyanBhaDloNGo4MGMifQ.nmUKpFUr8VSHskkfz2PijA', // Replace with your token
            container: mapContainer,
            style: 'mapbox://styles/mapbox/streets-v11', // Feel free to customize
            center: this.mapCenter || [-96, 37.8], // Default to US if center not provided
            zoom: 3 
        });

        // ... Add basic Mapbox controls (optional) ...
        map.addControl(new mapboxgl.NavigationControl());

        this.mapboxInitialized = true;
    }
    
}