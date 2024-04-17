import { LightningElement, track, wire } from 'lwc';
import plvimg from '@salesforce/resourceUrl/plvimgs';
import getListingData from '@salesforce/apex/propertyListedViewController.getListingInformation';
import { NavigationMixin } from 'lightning/navigation';

import property_icons from '@salesforce/resourceUrl/PropertyViewIcons';
import featPropIcons from '@salesforce/resourceUrl/plvimgs';
import Property_view_example from '@salesforce/resourceUrl/Property_view_example';
import background from '@salesforce/resourceUrl/bgimghomepage';
import getListingData1 from '@salesforce/apex/propertyListedViewController.getListingInformation';

const PAGE_SIZE = 1;

export default class Bt_HomePage extends NavigationMixin(LightningElement) {

    @track spinnerdatatable = false;
    @track dropDownClass = 'drop-down-none';
    @track currentPage = 1;
    @track left_arrow_disabled = true;
    @track right_arrow_disabled = false;
    @track isData = false;
    @track ListingData = [];
    @track bedrooms = 0;
    @track bathrooms = 0;
    @track searchTerm = '';
    @track result_found_numbers;
    @track FilteredListingData = [];
    @track FeaturedProperty = true;
    @track propertyMediaUrls;
    @track listing_type = '';
    @track min_price = '';
    @track max_price = '';
    @track sq_ft = '';
    @track city = '';
    @track zip_code = '';
    @track gridView = false;
    @track listView = false;
    @track columnView = true;
    @track pagedFilteredListingData = [];
    @track show_more_button_class = 'show_last_button';
    @track sortingProperties = 'View All';
    @track selectedOption = 'Column';

    isInitalRender = true;

    propertybg = plvimg + '/plvimgs/propertybg.png';
    logo = plvimg + '/plvimgs/estatexpertlogo.png';
    BedroomIcon = plvimg + '/plvimgs/Bedroom.png';
    BathroomIcon = plvimg + '/plvimgs/Bathroom.png';
    plvimg1 = plvimg + '/plvimgs/plvimg1.png';
    plvimg2 = plvimg + '/plvimgs/plvimg2.png';
    plvimg3 = plvimg + '/plvimgs/plvimg3.png';
    plvimg4 = plvimg + '/plvimgs/plvimg4.png';


    // First tab variables

    @track BathroomSqftIcon = plvimg + '/plvimgs/BathroomSqft.png';
    @track bgImage = background;
    propertyView = Property_view_example;


    @track featuredProperties = [];

    @track ListingData1 = [];
    @track FilteredListingData1 = [];
    @track propertyMediaUrls1 = [];
    @track result_found_numbers1 = 0;
    @track pagedFilteredListingData1 = [];

    @track SalebtnVarient = 'brand-outline';
    @track RentbtnVarient = 'brand-outline';
    @track AllbtnVarient = 'brand';
    @track featProp = true;
    @track showFeaturedProperties = [];
    @track firstIndex = 0;
    @track lastIndex = 4;

    @track firstIndex_listing = 0;
    @track lastIndex_listing = 4;
    @track listing_type1;
    @track left_arrow_disabled1 = true;
    @track right_arrow_disabled1 = false;
    @track listing_left_arrow_disabled = true;
    @track listing_right_arrow_disabled = false;

    @track mainFeatProperty = {};

    @track homeBedrooms = 0;
    @track homeBathrooms = 0;

    get totalPages() {
        let totalPages = Math.ceil(this.ListingData.filter(listing => {
            const featured_prop = this.FeaturedProperty ? listing.Featured_Property__c == true : false;
            return featured_prop;
        }).length / PAGE_SIZE);

        if (totalPages === 1 && this.currentPage == 1) {
            this.right_arrow_disabled = true;
            this.left_arrow_disabled = true;
        }
        return totalPages;
    }

    get pagedProperties() {
        const startIndex = (this.currentPage - 1) * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;
        return this.ListingData.filter(listing => {
            const featured_prop = this.FeaturedProperty ? listing.Featured_Property__c == true : false;
            return featured_prop;
        }).slice(startIndex, endIndex);
    }

    goToPrevious() {
        if (this.currentPage !== 1) {
            this.currentPage -= 1;
            this.right_arrow_disabled = false;
            this.pagedProperties;
        } else if (this.currentPage === 1) {
            this.left_arrow_disabled = true;
        }
    }

    goToNext() {
        if (this.currentPage !== this.totalPages) {
            this.currentPage += 1;
            this.left_arrow_disabled = false;
            this.pagedProperties;
        } else if (this.currentPage === this.totalPages) {
            this.right_arrow_disabled = true;
        }
    }

    connectedCallback() {
        this.fetchListingData();
        this.fetchListingData1();
    }


    renderedCallback() {
        this.template.querySelectorAll("a").forEach(element => {
            element.addEventListener("click", evt => {
                let target = evt.currentTarget.dataset.tabId;

                this.template.querySelectorAll("a").forEach(tabel => {
                    if (tabel === element) {
                        tabel.classList.add("active-tab");
                    } else {
                        tabel.classList.remove("active-tab");
                    }
                });
                this.template.querySelectorAll(".tab").forEach(tabdata => {
                    tabdata.classList.remove("active-tab-content");
                });
                this.template.querySelector('[data-id="' + target + '"]').classList.add("active-tab-content");
            });
        });
        if (this.isInitalRender) {
            const body = document.querySelector("body");

            const style = document.createElement('style');
            style.innerText = `
                .slds-input-has-icon_left-right .slds-input{
                    border: none;
                }
                
                .sort-selected .slds-button__icon {
                    fill: #49735A !important;
                }
                
                .leftButton .slds-button__icon{
                    fill: rgba(18, 82, 174, 1);
                    width: 3rem;
                    height: 3rem;
                }
                
                .rightButton .slds-button__icon{
                    fill: rgba(18, 82, 174, 1);
                    width: 3rem;
                    height: 3rem;
                }
                
                .leftButton .slds-button:hover .slds-button__icon, .slds-button:focus .slds-button__icon, .slds-button:active .slds-button__icon, .slds-button[disabled] .slds-button__icon, .slds-button:disabled .slds-button__icon {
                    fill: rgba(18, 82, 174, 0.5);
                }
                
                .rightButton .slds-button:hover .slds-button__icon, .slds-button:focus .slds-button__icon, .slds-button:active .slds-button__icon, .slds-button[disabled] .slds-button__icon, .slds-button:disabled .slds-button__icon {
                    fill: rgba(18, 82, 174, 0.5);
                }
            `;

            body.appendChild(style);
            this.isInitalRender = false;
        }
    }


    tabing() {
        const target = "tab1";
        this.template.querySelectorAll("a").forEach(tabel => {
            tabel.classList.remove("active-tab");
        });
        this.template.querySelectorAll(".tab").forEach(tabdata => {
            tabdata.classList.remove("active-tab-content");
        });
        this.template.querySelector('[data-tab-id="' + target + '"]').classList.add("active-tab");
        this.template.querySelector('[data-id="' + target + '"]').classList.add("active-tab-content");
    }

    ToggleFilters() {
        this.dropDownClass = this.dropDownClass === 'drop-down-none' ? 'drop-down-block' : 'drop-down-none';
    }

    fetchListingData() {
        this.spinnerdatatable = true;
        getListingData().then((result) => {
            console.log('result:', result);

            this.FilteredListingData = result.Listings;
            this.ListingData = result.Listings;
            this.propertyMediaUrls = result.Medias;
            this.ListingData.forEach(row => {
                const prop_id = row.Property_ID__c;
                row.media_url = this.propertyMediaUrls[prop_id];
            });
            this.FilteredListingData.forEach(row => {
                const prop_id = row.Property_ID__c;
                row.media_url = this.propertyMediaUrls[prop_id] ? this.propertyMediaUrls[prop_id] : '/sfsites/c/resource/nopropertyfound';
                row.Availability_Date__c = row.Availability_Date__c ? this.formatDate(row.Availability_Date__c) : 'N/A';
                row.Listing_Price__c = row.Listing_Price__c ? row.Listing_Price__c : 'TBD';
                row.Property_Features__c = row.Property_Features__c ? this.changeAmenitiesFormat(row.Property_Features__c) : row.Property_Features__c;
            });
            this.result_found_numbers = this.FilteredListingData.length;
            this.pagedFilteredListingData = this.FilteredListingData.slice(0, 6);
            console.log('ListingData:', this.ListingData);
            this.isData = true;
            this.spinnerdatatable = false;
        });
    }

    showPropertyDetails(event) {
        try {
            var listRecordId = event.currentTarget.dataset.id;
            console.log('listRecordId:', listRecordId);
            this[NavigationMixin.Navigate]({
                type: 'comm__namedPage',
                attributes: {
                    name: 'PropertyView__c',
                },
                state: {
                    c__listingrecordid: listRecordId
                }
            });
        } catch (error) {
            console.log('error-->', error);
        }
    }

    showAllProperties() {
        const nextPageStartIndex = this.pagedFilteredListingData.length;
        const nextPageEndIndex = nextPageStartIndex + 6;

        // If there are no more items to display, exit
        if (nextPageStartIndex >= this.FilteredListingData.length) {
            return;
        }

        // Slice the next page of data from the filtered list
        const nextPageData = this.FilteredListingData.slice(nextPageStartIndex, nextPageEndIndex);

        // Append the next page data to the existing paged data
        this.pagedFilteredListingData = [...this.pagedFilteredListingData, ...nextPageData];

        // Hide the "Show more" button if there are no more items to display
        if (nextPageEndIndex >= this.FilteredListingData.length) {
            this.show_more_button_class = 'not-show_last_button';
        }
    }

    searchTermValue(event) {
        this.searchTerm = event.target.value;
    }

    increaseNumber(event) {
        if (event.target.name === 'rooms') {
            var input = this.template.querySelector('.bedrooms_number');
        } else {
            var input = this.template.querySelector('.bathrooms_number');
        }
        var val = parseInt(input.value, 10);
        if (val < 10) {
            input.value = val + 1;
            if (event.target.name === 'rooms') {
                this.bedrooms = input.value;
            } else {
                this.bathrooms = input.value;
            }
        }
    }

    decreaseNumber(event) {
        if (event.target.name === 'rooms') {
            var input = this.template.querySelector('.bedrooms_number');
        } else {
            var input = this.template.querySelector('.bathrooms_number');
        }
        var val = parseInt(input.value, 10);
        if (val > 0) {
            input.value = val - 1;
            if (event.target.name === 'rooms') {
                this.bedrooms = input.value;
            } else {
                this.bathrooms = input.value;
            }
        }
    }

    store_filter_values(event) {
        if (event.target.name === 'listing_type') {
            this.listing_type = event.target.value;
        } else if (event.target.name === 'min_price') {
            this.min_price = event.target.value;
        } else if (event.target.name === 'max_price') {
            this.max_price = event.target.value;
        } else if (event.target.name === 'sq_ft') {
            this.sq_ft = event.target.value;
        } else if (event.target.name === 'city') {
            this.city = event.target.value;
        } else if (event.target.name === 'zip_code') {
            this.zip_code = event.target.value;
        }
    }

    applySearch() {
        this.spinnerdatatable = true;
        console.log('searchterm:', this.searchTerm);
        console.log('bedrooms:', this.bedrooms);
        console.log('bathrooms:', this.bathrooms);
        console.log('listing type:', this.listing_type);
        console.log('min_price:', this.min_price);
        console.log('max_price:', this.max_price);
        console.log('sq_ft:', this.sq_ft);
        console.log('city:', this.city);
        console.log('zip_code:', this.zip_code);

        this.pagedFilteredListingData = this.ListingData.filter(listing => {
            const nameIncludesSearch = this.searchTerm ? listing.Name.toLowerCase().includes(this.searchTerm.toLowerCase()) : true;
            const num_of_bathrooms = this.bathrooms ? listing.Number_of_Bathrooms__c == this.bathrooms : true;
            const num_of_bedrooms = this.bedrooms ? listing.Number_of_Bedrooms__c == this.bedrooms : true;
            const isPropertyType = this.listing_type ? String(listing.Listing_Type__c) == String(this.listing_type) : true;
            const isPriceGreaterThan = this.min_price ? Number(listing.Listing_Price__c) >= Number(this.min_price) : true;
            const isPriceLesserThan = this.max_price ? Number(listing.Listing_Price__c) <= Number(this.max_price) : true;
            const isSqFt = this.sq_ft ? Number(listing.Sq_Ft__c) == Number(this.sq_ft) : true;
            const isCity = this.city ? listing.City__c.toLowerCase().includes(this.city.toLowerCase()) : true;
            const isZipcode = this.zip_code ? Number(listing.Postal_Code__c) <= Number(this.zip_code) : true;
            return nameIncludesSearch && num_of_bathrooms && num_of_bedrooms && isPropertyType && isPriceGreaterThan && isPriceLesserThan && isSqFt && isCity && isZipcode;
        });

        console.log('FilteredListingData:', this.FilteredListingData.length);
        console.log('FilteredListingData:', this.FilteredListingData);

        if (this.pagedFilteredListingData.length <= 0) {
            this.isData = false;
            this.show_more_button_class = 'not-show_last_button';
            this.result_found_numbers = this.pagedFilteredListingData.length;
            this.dropDownClass = 'drop-down-none';
            this.spinnerdatatable = false;
        } else {
            this.isData = true;
            this.show_more_button_class = 'not-show_last_button';
            this.result_found_numbers = this.pagedFilteredListingData.length;
            this.dropDownClass = 'drop-down-none';
            this.spinnerdatatable = false;
        }
    }

    clearFilter() {
        this.searchTerm = '';
        this.bedrooms = 0;
        this.bathrooms = 0;
        this.listing_type = '';
        this.min_price = '';
        this.max_price = '';
        this.sq_ft = '';
        this.city = '';
        this.zip_code = '';
    }

    formatDate(inputDate) {
        const dateParts = inputDate.split('-');
        const formattedDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        return formattedDate.toLocaleDateString('en-US', options);
    }

    changeAmenitiesFormat(amenity) {
        return amenity.split(';').join(' | ');
    }

    handleSortBySelect(event) {
        var selectedValue = event.detail.value;
        if (selectedValue == 'viewall') {
            this.sortingProperties = 'View All';
            this.fetchListingData();
        } else if (selectedValue == 'availability') {
            this.sortingProperties = 'Availability';
            this.pagedFilteredListingData = this.ListingData.filter(listing => {
                return listing.Availability_Date__c !== 'N/A';
            });
            this.result_found_numbers = this.pagedFilteredListingData.length;
        }
    }

    handleUpClick() {
        switch (this.selectedOption) {
            case 'Grid':
                this.selectedOption = 'Column';
                this.columnView = true;
                this.gridView = false;
                this.listView = false;
                break;
            case 'List':
                this.selectedOption = 'Grid';
                this.columnView = false;
                this.gridView = true;
                this.listView = false;
                break;
            default:
                break;
        }
    }

    handleDownClick() {
        switch (this.selectedOption) {
            case 'Column':
                this.selectedOption = 'Grid';
                this.columnView = false;
                this.gridView = true;
                this.listView = false;
                break;
            case 'Grid':
                this.selectedOption = 'List';
                this.columnView = false;
                this.gridView = false;
                this.listView = true;
                break;
            default:
                break;
        }
    }


    // First tab js methods







    fetchListingData1() {
        getListingData1().then((result) => {
            console.log('result:', result);
            this.FilteredListingData1 = result.Listings;
            this.ListingData1 = result.Listings;
            this.propertyMediaUrls1 = result.Medias;
            this.ListingData1.forEach(row => {
                const prop_id = row.Property_ID__c;
                row.media_url = this.propertyMediaUrls1[prop_id] ? this.propertyMediaUrls1[prop_id] : '/sfsites/c/resource/nopropertyfound';
                row.isSale = row.Listing_Type__c === 'Sale' ? true : false;
                row.isRent = row.Listing_Type__c === 'Rent' ? true : false;
            });
            this.FilteredListingData1.forEach(row => {
                const prop_id = row.Property_ID__c;
                row.isSale = row.Listing_Type__c === 'Sale' ? true : false;
                row.isRent = row.Listing_Type__c === 'Rent' ? true : false;
                row.media_url = this.propertyMediaUrls1[prop_id] ? this.propertyMediaUrls1[prop_id] : '/sfsites/c/resource/nopropertyfound';
            });
            this.result_found_numbers1 = this.FilteredListingData1.length;
            this.pagedFilteredListingData1 = this.FilteredListingData1.slice(0, 4);
            console.log('ListingData1:', this.ListingData1);

            this.featuredProperties = this.ListingData1.filter(listing => {
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
        this.template.querySelectorAll('.black_enabled').forEach(element => element.classList.remove('black_enabled'));
        event.target.classList.add('black_enabled');
    }

    goToNext1() {
        this.left_arrow_disabled1 = false;
        this.firstIndex = this.firstIndex + 4;
        this.lastIndex = this.lastIndex + 4;
        this.showFeaturedProperties = this.featuredProperties.slice(this.firstIndex, this.lastIndex);
        console.log('length:', this.featuredProperties.length);
        if (this.lastIndex >= this.featuredProperties.length - 1) {
            this.right_arrow_disabled1 = true;
        }
    }

    goToPrevious1() {
        this.right_arrow_disabled1 = false;
        this.firstIndex = this.firstIndex - 4;
        this.lastIndex = this.lastIndex - 4;
        this.showFeaturedProperties = this.featuredProperties.slice(this.firstIndex, this.lastIndex);
        if (this.firstIndex <= 0) {
            this.left_arrow_disabled1 = true;
        }
    }


    handleVarient(event) {
        if (event.target.label === 'All') {
            this.AllbtnVarient = 'brand';
            this.RentbtnVarient = 'brand-outline';
            this.SalebtnVarient = 'brand-outline';
            this.listing_type1 = '';
            this.pagedFilteredListingData1 = this.FilteredListingData1.filter(listing => {
                const isPropertyType = this.listing_type1 ? String(listing.Listing_Type__c) == String(this.listing_type1) : true;
                return isPropertyType;
            }).slice(0, 9);
        }
        if (event.target.label === 'Sale') {
            this.AllbtnVarient = 'brand-outline';
            this.RentbtnVarient = 'brand-outline';
            this.SalebtnVarient = 'brand';
            this.listing_type1 = event.target.label;
            this.pagedFilteredListingData1 = this.FilteredListingData1.filter(listing => {
                const isPropertyType = this.listing_type1 ? String(listing.Listing_Type__c) == String(this.listing_type1) : true;
                return isPropertyType;
            }).slice(0, 9);
        }
        if (event.target.label === 'Rent') {
            this.AllbtnVarient = 'brand-outline';
            this.RentbtnVarient = 'brand';
            this.SalebtnVarient = 'brand-outline';
            this.listing_type1 = event.target.label;
            this.pagedFilteredListingData1 = this.FilteredListingData1.filter(listing => {
                const isPropertyType = this.listing_type1 ? String(listing.Listing_Type__c) == String(this.listing_type1) : true;
                return isPropertyType;
            }).slice(0, 9);
        }
    }
    
    goToNextListing() {
        // this.pagedFilteredListingData1 = this.FilteredListingData1.slice(4,8);
        this.listing_left_arrow_disabled = false;
        this.firstIndex_listing = this.firstIndex_listing + 4;
        this.lastIndex_listing = this.lastIndex_listing + 4;
        this.pagedFilteredListingData1 = this.FilteredListingData1.slice(this.firstIndex_listing, this.lastIndex_listing);
        console.log('length:', this.featuredProperties.length);
        if (this.lastIndex_listing >= this.FilteredListingData1.slice(0, 13).length - 1) {
            this.listing_right_arrow_disabled = true;
        }
    }

    goTobackListing() {
        this.listing_right_arrow_disabled = false;
        this.firstIndex_listing = this.firstIndex_listing - 4;
        this.lastIndex_listing = this.lastIndex_listing - 4;
        this.pagedFilteredListingData1 = this.FilteredListingData1.slice(this.firstIndex_listing, this.lastIndex_listing);
        if (this.firstIndex_listing <= 0) {
            this.listing_left_arrow_disabled = true;
        }
    }

    switchToPropertyTab() {
        this.template.querySelectorAll(".tab-menu a").forEach(tab => {
            tab.classList.remove("active-tab");
        });
    
        this.template.querySelectorAll(".tab").forEach(tabContent => {
            tabContent.classList.remove("active-tab-content");
        });
    
        this.template.querySelector('[data-id="tab2"]').classList.add("active-tab-content");
        this.template.querySelector('[data-tab-id="tab2"]').classList.add("active-tab");
    }

    applySearchOnProperty() {
        this.homeBedrooms = 0;
        this.homeBathrooms = 0;
        console.log('homeBedrooms--->',this.homeBedrooms);
        console.log('homeBathrooms--->',this.homeBathrooms);
    }
    
}
