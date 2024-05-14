import { LightningElement,track } from 'lwc';
import plvimg from '@salesforce/resourceUrl/plvimgs';
import getListingData from '@salesforce/apex/propertyListedViewController.getListingInformation';
import Property_view_example from '@salesforce/resourceUrl/Property_view_example';
import background from '@salesforce/resourceUrl/bgimghomepage';

const PAGE_SIZE = 1;

export default class PropertyComponent extends LightningElement{

    @track left_arrow_disabled = true;
    @track right_arrow_disabled = false;
    @track searchTerm = '';
    @track sortingProperties = 'View All';
    @track columnView = true;
    @track gridView = false;
    @track listView = false;
    @track result_found_numbers;
    @track isData = false;
    @track pagedFilteredListingData = [];
    @track bedrooms = 0;
    @track homeBedrooms = 0;
    @track bathrooms = 0;
    @track homeBathrooms = 0;
    @track currentPage = 1;
    @track spinnerdatatable = false;
    selectionModel = false;
    @track pagedFilteredListingData = [];
    @track ListingData = []
    @track listing_type = '';
    @track FilteredListingData = [];
    @track show_more_button_class = 'show_last_button';
    @track result_found_numbers;
    @track dropDownClass = 'drop-down-none';
    @track propertyMediaUrls;
    isInitalRender = true;

    propertybg = plvimg + '/plvimgs/propertybg.png';
    logo = plvimg + '/plvimgs/estatexpertlogo.png';
    BedroomIcon = plvimg + '/plvimgs/Bedroom.png';
    BathroomIcon = plvimg + '/plvimgs/Bathroom.png';
    plvimg1 = plvimg + '/plvimgs/plvimg1.png';
    plvimg2 = plvimg + '/plvimgs/plvimg2.png';
    plvimg3 = plvimg + '/plvimgs/plvimg3.png';
    plvimg4 = plvimg + '/plvimgs/plvimg4.png';


   connectedCallback() {
     this.getAllListingsRecord();
       //this.showPropertyDetails();
        
    }

    redirectToSecondTab() {
       /* this.template.querySelectorAll(".tab-menu a").forEach(tab => {
            tab.classList.remove("active-tab");
        });

        this.template.querySelectorAll(".tab").forEach(tabContent => {
            tabContent.classList.remove("active-tab-content");
        });*/

        this.template.querySelector('[data-id="tab2"]').classList.add("active-tab-content");
        this.template.querySelector('[data-tab-id="tab2"]').classList.add("active-tab");
    }

    getAllListingsRecord(){
        getListingData().then((result) => {
            console.log('result:', result);

            this.listingDataForProperty(result);
            //this.listingDataForHome(result);
        });
    }

    listingDataForProperty(result) {
        this.spinnerdatatable = true;
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
                    height: 18px;
                    width: 18px;
                    margin-bottom: 2px;
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

                .container12 .slds-button__icon{
                    fill: white;
                    width: 1rem;
                    height: 1rem;
                }

                .container12 .slds-button:focus .slds-button__icon{
                    fill: white;
                }

                .container12 .slds-button:hover .slds-button__icon{
                    fill: white;
                }
                
                .closeIcon .slds-icon-text-default {
                    height: 25px;
                    width: 25px;
                }

                .leftButton .slds-button:focus .slds-button__icon,
                .rightButton .slds-button:focus .slds-button__icon{
                    fill: rgba(18, 82, 174, 1);
                }

                .leftButton .slds-button:hover .slds-button__icon,
                .rightButton .slds-button:hover .slds-button__icon{
                    fill: rgba(18, 82, 174, 1);
                }
            `;

            body.appendChild(style);
            this.isInitalRender = false;
        }
    }

    applySearchOnProperty() {
        this.bedrooms = this.homeBedrooms;
        this.bathrooms = this.homeBathrooms;
        this.redirectToSecondTab();
        this.applySearch();
    }

    increaseNumber1(event) {
        if (event.target.name === 'rooms') {
            var input = this.template.querySelector('.bedrooms_number1');
        } else {
            var input = this.template.querySelector('.bathrooms_number1');
        }
        var val = parseInt(input.value, 10);
        if (val < 10) {
            input.value = val + 1;
            if (event.target.name === 'rooms') {
                this.homeBedrooms = input.value;
            } else {
                this.homeBathrooms = input.value;
            }
        }
    }

    decreaseNumber1(event) {
        if (event.target.name === 'rooms') {
            var input = this.template.querySelector('.bedrooms_number1');
        } else {
            var input = this.template.querySelector('.bathrooms_number1');
        }
        var val = parseInt(input.value, 10);
        if (val > 0) {
            input.value = val - 1;
            if (event.target.name === 'rooms') {
                this.homeBedrooms = input.value;
            } else {
                this.homeBathrooms = input.value;
            }
        }
    }

    handleViewOfProperty(event) {
        var selectedValue = event.detail.value;
        if (selectedValue == 'coloumnview') {
            this.columnView = true;
            this.gridView = false;
            this.listView = false;
        } else if (selectedValue == 'gridview') {
            this.columnView = false;
            this.gridView = true;
            this.listView = false;
        } else if (selectedValue == 'listview') {
            this.columnView = false;
            this.gridView = false;
            this.listView = true;
        }
    }

    get pagedProperties() {
        const startIndex = (this.currentPage - 1) * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;
        return this.ListingData.filter(listing => {
            const featured_prop = this.FeaturedProperty ? listing.Featured_Property__c == true : false;
            return featured_prop;
        }).slice(startIndex, endIndex);
    }

    /*showPropertyDetails(event) {
        try {
         
            var listRecordId = event.currentTarget.dataset.id;
            console.log('listRecordId:', listRecordId);
           
            this[NavigationMixin.Navigate]({
                type: 'comm__namedPage',
                attributes: {
                    name: 'PropertyView__c',
                    //url: '/c/propertyView_Community?listRecordId=' +listRecordId
                },
                state: {
                    c__listingrecordid: listRecordId
                }
            });
        } catch (error) {
            console.log('error-->', error);
        }
    }*/

    switchToPropertyTab() {
        this.redirectToSecondTab();
        this.getAllListingsRecord();
        this.show_more_button_class = 'show_last_button'
        this.bedrooms = 0;
        this.bathrooms = 0;
    }

    showPropertyDetails(event) {
        try {
         
            var listRecordId = event.currentTarget.dataset.id;
            console.log('listRecordId:', listRecordId);
           
            this[NavigationMixin.Navigate]({
                type: 'comm__namedPage',
                attributes: {
                    name: 'PropertyView__c',
                    //url: '/c/propertyView_Community?listRecordId=' +listRecordId
                },
                state: {
                    c__listingrecordid: listRecordId
                }
            });
        } catch (error) {
            console.log('error-->', error);
        }
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
        console.log('currentPage-->',this.currentPage);
        console.log('totalPages-->',this.totalPages);
        if (this.currentPage !== this.totalPages) {
            this.currentPage += 1;
            this.left_arrow_disabled = false;
            this.pagedProperties;
        } else if (this.currentPage === this.totalPages) {
            this.right_arrow_disabled = true;
        }
    }
    searchTermValue(event) {
        this.searchTerm = event.target.value;
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
        this.selectionModel = false;
        this.clearFilter();
        console.log('1');
        console.log('Listing Data'+this.ListingData);
        console.log('2');
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
            console.log(this.spinnerdatatable);
            console.log(this.pagedFilteredListingData.length);
            this.isData = false;
            this.show_more_button_class = 'not-show_last_button';
            this.result_found_numbers = this.pagedFilteredListingData.length;
            this.dropDownClass = 'drop-down-none';
            this.spinnerdatatable = false;
        } else {
            console.log(this.spinnerdatatable);
            console.log(this.pagedFilteredListingData.length);
            this.isData = true;
            this.show_more_button_class = 'not-show_last_button';
            this.result_found_numbers = this.pagedFilteredListingData.length;
            this.dropDownClass = 'drop-down-none';
            this.spinnerdatatable = false;
        }
    }
    ToggleFilters() {
        this.selectionModel = true;
    }
    handleSortBySelect(event) {
        var selectedValue = event.detail.value;
        if (selectedValue == 'viewall') {
            this.sortingProperties = 'View All';
            this.getAllListingsRecord();
            this.show_more_button_class = 'show_last_button'
        } else if (selectedValue == 'availability') {
            this.sortingProperties = 'Availability';
            this.pagedFilteredListingData = this.ListingData.filter(listing => {
                return listing.Availability_Date__c !== 'N/A';
            });
            this.result_found_numbers = this.pagedFilteredListingData.length;
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
}