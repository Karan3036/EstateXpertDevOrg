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
    @track mainFeatProperty = {};


    @track firstIndexListing = 0;
    @track lastIndexListing = 4;
    @track listingType;
    @track leftArrowDisabled = true;
    @track rightArrowDisabled = false;
    @track listingLeftArrowDisabled = true;
    @track listingRightArrowDisabled = false;

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
            this.pagedFilteredListingData = this.FilteredListingData.filter(listing => {
                const isfeat = this.featProp===true ? listing.Featured_Property__c == false : false;
                return isfeat;
            }).slice(0,4);
            console.log('pagedListingData:', this.pagedFilteredListingData);
            this.featuredProperties = this.ListingData.filter(listing => {
                const isfeat = this.featProp ? listing.Featured_Property__c == true : false;
                return isfeat;
            });

            this.mainFeatProperty = this.featuredProperties[0];
            this.showFeaturedProperties = this.featuredProperties;
            setTimeout(() => {
                let element =this.template.querySelectorAll('.black')[0];
                console.log('element:',element);
                element.classList.add('black_enabled');
            }, 1000);

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
        this.template.querySelectorAll('.black_enabled').forEach(element => element.classList.remove('black_enabled'));
        event.target.classList.add('black_enabled');
    }


    goToNext() {
        this.leftArrowDisabled = false;
        this.firstIndex += 4;
        this.lastIndex += 4;
        this.showFeaturedProperties = this.featuredProperties.slice(this.firstIndex, this.lastIndex);
        if (this.lastIndex >= this.featuredProperties.length - 1) {
            this.rightArrowDisabled = true;
        }
    }
    goToPrevious() {
        this.rightArrowDisabled = false;
        this.firstIndex -= 4;
        this.lastIndex -= 4;
        this.showFeaturedProperties = this.featuredProperties.slice(this.firstIndex, this.lastIndex);
        if (this.firstIndex <= 0) {
            this.leftArrowDisabled = true;
        }
    }

    handleVarient(event) {
        // if (event.target.label === 'All') {
        //     this.AllbtnVarient = 'brand';
        //     this.RentbtnVarient = 'brand-outline';
        //     this.SalebtnVarient = 'brand-outline';
        //     this.listing_type = '';
        //     this.pagedFilteredListingData = this.FilteredListingData.filter(listing => {
        //         const isPropertyType = this.listing_type ? String(listing.Listing_Type__c) == String(this.listing_type) : true;
        //         const isfeat = this.featProp===true ? listing.Featured_Property__c == false : false;
        //         return isPropertyType && isfeat;
        //     }).slice(0,4);
        //     console.log('all:',this.pagedFilteredListingData );
        // }
        // if (event.target.label === 'Sale') {
        //     this.AllbtnVarient = 'brand-outline';
        //     this.RentbtnVarient = 'brand-outline';
        //     this.SalebtnVarient = 'brand';
        //     this.listing_type = event.target.label;
        //     console.log('listingtype:',this.listing_type);

        //     this.pagedFilteredListingData = this.FilteredListingData.filter(listing => {
        //         const isPropertyType = this.listing_type ? String(listing.Listing_Type__c) == String(this.listing_type) : true;
        //         const isfeat = this.featProp===true ? listing.Featured_Property__c == false : false;
        //         return isPropertyType && isfeat;            
        //     }).slice(0,4);
        //     console.log('Sale:',this.pagedFilteredListingData );

        // }
        // if (event.target.label === 'Rent') {
        //     this.AllbtnVarient = 'brand-outline';
        //     this.RentbtnVarient = 'brand';
        //     this.SalebtnVarient = 'brand-outline';
        //     this.listing_type = event.target.label;
        //     console.log('listingtype:',this.listing_type);

        //     console.log('listingtype:',this.listing_type);
        //     this.pagedFilteredListingData = this.FilteredListingData.filter(listing => {
        //         const isPropertyType = this.listing_type ? String(listing.Listing_Type__c) == String(this.listing_type) : true;
        //         const isfeat = this.featProp===true ? listing.Featured_Property__c == false : false;
        //         return isPropertyType && isfeat;
        //     }).slice(0,4);
            
        //     console.log('Rent:',this.pagedFilteredListingData );

        // }
        let listingType = '';
        let allbtnVarient = 'brand-outline';
        let rentbtnVarient = 'brand-outline';
        let salebtnVarient = 'brand-outline';

        if (event.target.label === 'All') {
            allbtnVarient = 'brand';
        } else if (event.target.label === 'Sale') {
            salebtnVarient = 'brand';
            listingType = event.target.label;
        } else if (event.target.label === 'Rent') {
            rentbtnVarient = 'brand';
            listingType = event.target.label;
        }

        this.AllbtnVarient = allbtnVarient;
        this.RentbtnVarient = rentbtnVarient;
        this.SalebtnVarient = salebtnVarient;
        this.listing_type = listingType;

        const filteredListings = this.FilteredListingData.filter(listing => {
            const isPropertyType = !listingType || String(listing.Listing_Type__c) === String(listingType);
            const isfeat = this.featProp === true ? listing.Featured_Property__c == false : false;
            return isPropertyType && isfeat;
        });

        this.pagedFilteredListingData =  filteredListings.slice(0, 4);

        console.log('filtered data:', this.pagedFilteredListingData);
        if (filteredListings.length <= 4) {
            this.listingRightArrowDisabled = true;
            this.listingLeftArrowDisabled = true;
        } else {
            this.listingRightArrowDisabled = false;
            // this.listingLeftArrowDisabled = false;
        }
    }

    
    goToNextListing(){
        // this.listingLeftArrowDisabled = false;
        // this.firstIndexListing = this.firstIndexListing + 4;
        // this.lastIndexListing = this.lastIndexListing + 4;
        // this.pagedFilteredListingData = this.FilteredListingData.filter(listing => {
        //     const isPropertyType = this.listing_type ? String(listing.Listing_Type__c) == String(this.listing_type) : true;
        //     const isfeat = this.featProp===true ? listing.Featured_Property__c == false : false;
        //     return isPropertyType && isfeat;
        // }).slice(this.firstIndexListing, this.lastIndexListing);
        // console.log('length:',this.featuredProperties.length);
        // if(this.lastIndexListing >= this.FilteredListingData.filter(listing => {
        //     const isPropertyType = this.listing_type ? String(listing.Listing_Type__c) == String(this.listing_type) : true;
        //     const isfeat = this.featProp===true ? listing.Featured_Property__c == false : false;
        //     return isPropertyType && isfeat;
        // }).length-1){
        //     this.listingRightArrowDisabled = true;
        // }
        this.listingLeftArrowDisabled = false;
        this.firstIndexListing += 4;
        this.lastIndexListing += 4;

        const filteredListings = this.FilteredListingData.filter(listing => {
            const isPropertyType = !this.listing_type || String(listing.Listing_Type__c) === String(this.listing_type);
            const isFeat = this.featProp === true ? listing.Featured_Property__c == false : false;
            return isPropertyType && isFeat;
        });

        this.pagedFilteredListingData = filteredListings.slice(this.firstIndexListing, this.lastIndexListing);

        console.log('length:', this.featuredProperties.length);

        if (this.lastIndexListing >= filteredListings.length - 1) {
            this.listingRightArrowDisabled = true;
        }
    }

    goTobackListing(){
        // this.listingRightArrowDisabled = false;
        // this.firstIndexListing = this.firstIndexListing - 4;
        // this.lastIndexListing = this.lastIndexListing - 4;
        // this.pagedFilteredListingData = this.FilteredListingData.filter(listing => {
        //     const isPropertyType = this.listing_type ? String(listing.Listing_Type__c) == String(this.listing_type) : true;
        //     const isfeat = this.featProp===true ? listing.Featured_Property__c == false : false;
        //     return isPropertyType && isfeat;
        // }).slice(this.firstIndexListing, this.lastIndexListing);
        // if(this.firstIndexListing <= 0){
        //     this.listingLeftArrowDisabled = true;
        // }

        this.listingRightArrowDisabled = false;
        this.firstIndexListing -= 4;
        this.lastIndexListing -= 4;

        const filteredListings = this.FilteredListingData.filter(listing => {
            const isPropertyType = !this.listing_type || String(listing.Listing_Type__c) === String(this.listing_type);
            const isFeat = this.featProp === true ? listing.Featured_Property__c == false : false;
            return isPropertyType && isFeat;
        });

        this.pagedFilteredListingData = filteredListings.slice(this.firstIndexListing, this.lastIndexListing);

        if (this.firstIndexListing <= 0) {
            this.listingLeftArrowDisabled = true;
        }
    }

}