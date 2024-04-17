import { LightningElement, track } from 'lwc';
import property_icons from '@salesforce/resourceUrl/PropertyViewIcons';
import featPropIcons from '@salesforce/resourceUrl/plvimgs';
import Property_view_example from '@salesforce/resourceUrl/Property_view_example';
import background from '@salesforce/resourceUrl/bgimghomepage';
import getListingData from '@salesforce/apex/propertyListedViewController.getListingInformation';

export default class EstateXpert_Home_Page extends LightningElement {

    @track BedroomIcon = property_icons + '/Bedroom.png';
    @track BathroomIcon = property_icons + '/Bathroom.png';
    @track BathroomSqftIcon = property_icons + '/BathroomSqft.png';
    @track bgImage = background;
    propertyView = Property_view_example;

    @track featBedroomIcon = featPropIcons + '/plvimgs/plvimg1.png';
    @track featBathroomIcon = featPropIcons + '/plvimgs/plvimg2.png';
    @track featCarspaceIcon = featPropIcons + '/plvimgs/plvimg3.png';
    @track featStudyIcon = featPropIcons + '/plvimgs/plvimg4.png';


    @track featuredProperties = [];

    @track ListingData = [];
    @track FilteredListingData = [];
    @track propertyMediaUrls = [];
    @track result_found_numbers = 0;
    @track pagedFilteredListingData = [];
    @track currentPage = 1;

    @track SalebtnVarient = 'brand-outline';
    @track RentbtnVarient = 'brand-outline';
    @track AllbtnVarient = 'brand';
    @track featProp = true;
    @track showFeaturedProperties = [];
    @track firstIndex = 0;
    @track lastIndex = 4;

    @track firstIndex_listing = 0;
    @track lastIndex_listing = 4;
    @track listing_type;
    @track left_arrow_disabled = true;
    @track right_arrow_disabled = false;
    @track listing_left_arrow_disabled = true;
    @track listing_right_arrow_disabled = false;

    @track mainFeatProperty = {};
    connectedCallback() {
        this.fetchListingData();
    }

    fetchListingData() {
        getListingData().then((result) => {
            console.log('result:', result);
            this.FilteredListingData = result.Listings;
            this.ListingData = result.Listings;
            this.propertyMediaUrls = result.Medias;
            this.ListingData.forEach(row => {
                const prop_id = row.Property_ID__c;
                row.media_url = this.propertyMediaUrls[prop_id]? this.propertyMediaUrls[prop_id] : '/sfsites/c/resource/nopropertyfound';
                row.isSale = row.Listing_Type__c==='Sale'?true:false;
                row.isRent = row.Listing_Type__c==='Rent'?true:false;
            });
            this.FilteredListingData.forEach(row => {
                const prop_id = row.Property_ID__c;
                row.isSale = row.Listing_Type__c==='Sale'?true:false;
                row.isRent = row.Listing_Type__c==='Rent'?true:false;
                row.media_url =this.propertyMediaUrls[prop_id] ? this.propertyMediaUrls[prop_id] : '/sfsites/c/resource/nopropertyfound';
                });
            this.result_found_numbers = this.FilteredListingData.length;
            this.pagedFilteredListingData = this.FilteredListingData.slice(0,4);
            console.log('ListingData:', this.ListingData);

            this.featuredProperties = this.ListingData.filter(listing => {
                const isfeat = this.featProp ? listing.Featured_Property__c == true : false;
                return isfeat;
            });
            this.mainFeatProperty = this.featuredProperties[0];
            this.showFeaturedProperties = this.featuredProperties;

        });
    }

    get nextProperties() {
        this.showFeaturedProperties = this.featuredProperties.slice(this.firstIndex, this.lastIndex);
        return this.showFeaturedProperties;
    }
    handleBoxClick(event) {
        console.log('boxcalled');
        const selectedImageId = event.currentTarget.dataset.id;
        const selectedIndex = this.featuredProperties.findIndex(image => image.Id === selectedImageId);
        this.mainFeatProperty = this.featuredProperties[selectedIndex];
        this.template.querySelectorAll('.black_enabled').forEach(element =>element.classList.remove('black_enabled'));
        event.target.classList.add('black_enabled');


    }
    goToNext() {
        this.left_arrow_disabled = false;
        this.firstIndex = this.firstIndex + 4;
        this.lastIndex = this.lastIndex + 4;
        this.showFeaturedProperties = this.featuredProperties.slice(this.firstIndex, this.lastIndex);
        console.log('length:',this.featuredProperties.length);
        if(this.lastIndex >= this.featuredProperties.length-1){
            this.right_arrow_disabled = true;
        }
    }
    goToPrevious() {
        this.right_arrow_disabled = false;
        this.firstIndex = this.firstIndex - 4;
        this.lastIndex = this.lastIndex - 4;
        this.showFeaturedProperties = this.featuredProperties.slice(this.firstIndex, this.lastIndex);
        if(this.firstIndex <= 0){
            this.left_arrow_disabled = true;
        }
    }


    handleVarient(event) {
        if (event.target.label === 'All') {
            this.AllbtnVarient = 'brand';
            this.RentbtnVarient = 'brand-outline';
            this.SalebtnVarient = 'brand-outline';
            this.listing_type = '';
            this.pagedFilteredListingData = this.FilteredListingData.filter(listing => {
                const isPropertyType = this.listing_type ? String(listing.Listing_Type__c) == String(this.listing_type) : true;
                return isPropertyType;
            }).slice(0,9);
        }
        if (event.target.label === 'Sale') {
            this.AllbtnVarient = 'brand-outline';
            this.RentbtnVarient = 'brand-outline';
            this.SalebtnVarient = 'brand';
            this.listing_type = event.target.label;
            this.pagedFilteredListingData = this.FilteredListingData.filter(listing => {
                const isPropertyType = this.listing_type ? String(listing.Listing_Type__c) == String(this.listing_type) : true;
                return isPropertyType;
            }).slice(0,9);
        }
        if (event.target.label === 'Rent') {
            this.AllbtnVarient = 'brand-outline';
            this.RentbtnVarient = 'brand';
            this.SalebtnVarient = 'brand-outline';
            this.listing_type = event.target.label;
            this.pagedFilteredListingData = this.FilteredListingData.filter(listing => {
                const isPropertyType = this.listing_type ? String(listing.Listing_Type__c) == String(this.listing_type) : true;
                return isPropertyType;
            }).slice(0,9);
        }
    }
    goToNextListing(){
        // this.pagedFilteredListingData = this.FilteredListingData.slice(4,8);
        this.listing_left_arrow_disabled = false;
        this.firstIndex_listing = this.firstIndex_listing + 4;
        this.lastIndex_listing = this.lastIndex_listing + 4;
        this.pagedFilteredListingData = this.FilteredListingData.slice(this.firstIndex_listing, this.lastIndex_listing);
        console.log('length:',this.featuredProperties.length);
        if(this.lastIndex_listing >= this.FilteredListingData.slice(0,13).length-1){
            this.listing_right_arrow_disabled = true;
        }
    }

    goTobackListing(){
        this.listing_right_arrow_disabled = false;
        this.firstIndex_listing = this.firstIndex_listing - 4;
        this.lastIndex_listing = this.lastIndex_listing - 4;
        this.pagedFilteredListingData = this.FilteredListingData.slice(this.firstIndex_listing, this.lastIndex_listing);
        if(this.firstIndex_listing <= 0){
            this.listing_left_arrow_disabled = true;
        }
    }


}