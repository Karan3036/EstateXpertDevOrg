import { LightningElement,track } from 'lwc';
import { loadStyle,loadScript } from 'lightning/platformResourceLoader';
import mapbox from '@salesforce/resourceUrl/mapboxgl';
import mapboxglcss from '@salesforce/resourceUrl/mapboxglcss';
import getListingData from '@salesforce/apex/propertyListedViewController.getListingInformation';



export default class ListingMap extends LightningElement {

    @track map;
    @track isData=false;
    @track listView = true;
    @track FilteredListingData=[];
    @track ListingData=[];
    @track propertyMediaUrls=[];
    @track pagedFilteredListingData = [];
    @track mapMarkers;
    connectedCallback() {
        this.fetchListingData();

    }

    renderedCallback() {
        Promise.all([
            loadScript(this, mapbox),
        ]).then(() => {
            console.log('scriptloaded');
            this.initializeMap();
        }).catch(error => {
            console.error('Error loading Mapbox:', error);
        });
    }

  

    initializeMap() {
        
        console.log('mabboxgl',mapbox);
        mapboxgl.accessToken = 'sk.eyJ1IjoiaWFtcHVydmFuZzUiLCJhIjoiY2x1cW10amU4MXlmMzJrcDdiaHYydHlvcSJ9.HxS0i8deqwxBvNsxh3WkZg';
        const map = new mapboxgl.Map({
            container: this.template.querySelector('.map-container').id, // container ID
            center: [-74.5, 40], // starting position [lng, lat]
            zoom: 9 // starting zoom
        });
    }

    fetchListingData(){
        getListingData().then((result) => {
            console.log('result:',result);
            
            this.FilteredListingData = result.Listings;
            this.ListingData = result.Listings;
            this.propertyMediaUrls =result.Medias;
            this.ListingData.forEach(row => {
                const prop_id = row.Property_ID__c;
                row.media_url = this.propertyMediaUrls[prop_id];
            });
            this.FilteredListingData.forEach(row => {
                const prop_id = row.Property_ID__c;
                row.media_url = this.propertyMediaUrls[prop_id] ? this.propertyMediaUrls[prop_id] :'https://sellmyproperties.in/images/no-property-found.png';
            });
            // this.result_found_numbers = this.FilteredListingData.length;
            this.pagedFilteredListingData = this.FilteredListingData.slice(0, 2);
            // this.mapMarkers = this.pagedFilteredListingData.forEach(inputObject => ({
            //     location: {
            //         Latitude: -74.5,
            //         Longitude: 40
            //     },
            //     value: inputObject.Id,
            //     title: inputObject.Name,
            //     description: 'description'
            // }));
            console.log('ListingData:',this.ListingData);
            this.isData = true;
        });
    }

}