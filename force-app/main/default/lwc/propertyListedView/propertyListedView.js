import { LightningElement, track, wire } from 'lwc';
import { loadStyle, loadScript } from 'lightning/platformResourceLoader';
import logo from '@salesforce/resourceUrl/estatexpertlogo';
import Img1 from '@salesforce/resourceUrl/DemoImg1';
import Property_view_example from '@salesforce/resourceUrl/Property_view_example';
import property_icons from '@salesforce/resourceUrl/PropertyViewIcons';
import NextArrowIcon from '@salesforce/resourceUrl/NextArrowIcon';
import PrevArrowIcon from '@salesforce/resourceUrl/PrevArrowIcon';
import designcss from '@salesforce/resourceUrl/propertycssoveride';
import getListingData from '@salesforce/apex/propertyListedViewController.getListingInformation';
import getPropertyInformation from '@salesforce/apex/propertyViewController.getPropertyInformation';
import { NavigationMixin } from 'lightning/navigation';

const PAGE_SIZE = 3;

export default class Bt_HomePage extends NavigationMixin(LightningElement) {
    @track spinnerdatatable = false;
    @track dropDownClass = 'drop-down-none';
    Logo = logo;
    PropertyImg = Img1;
    propertyView = Property_view_example;
    nextArrowIcon = NextArrowIcon;
    prevArrowIcon = PrevArrowIcon;
    @track currentPage = 1;
    @track left_arrow_disabled = true;
    @track right_arrow_disabled = false;
    @track showSpinner = false;
    @track isData = false;
    @track ListingData =[];
    @track bedrooms=0;
    @track bathrooms=0;
    @track searchTerm='';
    @track result_found_numbers;
    @track FilteredListingData =[];
    @track FeaturedProperty = true;
    @track propertyMediaUrls;
    @track listing_type='';
    @track min_price='';
    @track max_price='';
    @track sq_ft='';
    @track city='';
    @track zip_code='';
    @track neighbourhood='';
    @track gridView=false;
    @track listView = true;
    @track all_property_numbers = 7;
    @track pagedFilteredListingData = [];
    @track propertyView = false;
    @track show_more_button_class='show_last_button';


    @track BedroomIcon = property_icons +'/Bedroom.png';
    @track BathroomIcon = property_icons +'/Bathroom.png';
    @track resourceUrl;
    @track propertyData =[];
    @track feature_icons;
    @track currentRecordId;
    get totalPages() {

        let totalPages = Math.ceil(this.ListingData.filter(listing =>{
            const featured_prop = this.FeaturedProperty?listing.Featured_Property__c == true:false;
            return featured_prop ;
        }).length / PAGE_SIZE);

        if(totalPages=== 1 && this.currentPage ==1){
            this.right_arrow_disabled = true;
            this.left_arrow_disabled = true;
        }
        return totalPages;
    }

    get pagedProperties() {
        const startIndex = (this.currentPage - 1) * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;
        return this.ListingData.filter(listing =>{
            const featured_prop = this.FeaturedProperty?listing.Featured_Property__c == true:false;
            return featured_prop ;
        }).slice(startIndex, endIndex);
    }

    goToPrevious() {
        if (this.currentPage!==1) {
            this.currentPage -= 1;
            this.pagedProperties;
        }
        if(this.currentPage === 1){
            this.left_arrow_disabled = true;
            this.right_arrow_disabled = false;
        }
    }

    goToNext() {
        // console.log('onNext:',this.totalPages);
        if (this.currentPage!==this.totalPages) {
            console.log('onNext:',!this.currentPage ===this.totalPages);
            this.currentPage += 1;
            this.left_arrow_disabled = false;
            this.pagedProperties;
        }
        if(this.currentPage===this.totalPages){
            this.right_arrow_disabled = true;
        }
    }

    connectedCallback() {
        console.log('Property Listed View');
        loadStyle(this, designcss);
        this.fetchListingData();
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

    ToggleFilters(){
        this.dropDownClass = this.dropDownClass === 'drop-down-none'? 'drop-down-block' : 'drop-down-none';
    }

    fetchListingData(){
        this.spinnerdatatable = true;
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
                row.Availability_Date__c = row.Availability_Date__c ? this.formatDate(row.Availability_Date__c) : 'N/A';
                row.Listing_Price__c = row.Listing_Price__c ? row.Listing_Price__c : 'TBD';
                row.Property_Features__c = row.Property_Features__c ? this.changeAmenitiesFormat(row.Property_Features__c) : row.Property_Features__c;
                row.Number_of_Bedrooms__c = row.Number_of_Bedrooms__c ? row.Number_of_Bedrooms__c : 0;
                row.Number_of_Bathrooms__c = row.Number_of_Bathrooms__c ? row.Number_of_Bathrooms__c : 0;
            });
            this.result_found_numbers = this.FilteredListingData.length;
            this.pagedFilteredListingData = this.FilteredListingData.slice(0, 6);
            console.log('ListingData:',this.ListingData);
            this.isData = true;
            setTimeout(() => {
                this.spinnerdatatable = false;
            }, 4000);
        });
    }

    // showPropertyDetails(event){
    //     this.currentRecordId = event.currentTarget.dataset.id;
    //     console.log('recordId:',this.currentRecordId);
    //     this.listView = false;
    //     this.gridView = false;
    //     this.propertyView=true;
    //     this.getPropertyDetails();
    // }

    getPropertyDetails(){
            getPropertyInformation({recordId:this.currentRecordId}).then((result) => {
                console.log('result: ',result);
                this.propertyData = result.Properties;
                this.feature_icons = result.icons;
                this.propertyData.forEach(row => {
                    if (row.Amenities__c) {
                        const amenitiesArray = row.Amenities__c.split(";");
                        row.Amenities__c = amenitiesArray.map(amenity => {
                            return {
                                name: amenity,
                                imgUrl: this.feature_icons[amenity]
                            };
                        });
                    } else {
                        row.Amenities__c = [];
                    }
                });
                console.log('amenties: ',this.propertyData);
            });
    }

    showAllProperties(){
        this.show_more_button_class = 'not-show_last_button';
        this.pagedFilteredListingData = this.FilteredListingData.slice(0,this.result_found_numbers);
    }
    searchTermValue(event){
        this.searchTerm = event.target.value;
    }

    increaseNumber(event){
        if(event.target.name==='rooms'){
            var input = this.template.querySelector('.bedrooms_number');
        }else{
            var input = this.template.querySelector('.bathrooms_number');
        }
        var val = parseInt(input.value, 10);
        if(val<10){
            input.value = val+1;
            if(event.target.name==='rooms'){
                this.bedrooms = input.value;
            }else{
                this.bathrooms = input.value;
            } 
        }
    }
    decreaseNumber(event){
        if(event.target.name==='rooms'){
            var input = this.template.querySelector('.bedrooms_number');
        }else{
            var input = this.template.querySelector('.bathrooms_number');
        }
        var val = parseInt(input.value, 10);
        if(val>0){
            input.value = val-1;
            if(event.target.name==='rooms'){
                this.bedrooms = input.value;
            }else{
                this.bathrooms = input.value;
            } 
        }
    }
    view_type(event){
        if(event.target.value==='List'){
            this.gridView = false;
            this.listView = true;
        }
        if(event.target.value==='Grid'){
            this.listView = false;
            this.gridView = true;
        }
    }

    store_filter_values(event){
        if(event.target.name==='listing_type'){
            this.listing_type = event.target.value;
        }
        if(event.target.name==='min_price'){
            this.min_price = event.target.value;
        }
        if(event.target.name==='max_price'){
            this.max_price = event.target.value;
        }
        if(event.target.name==='sq_ft'){
            this.sq_ft = event.target.value;
        }
        if(event.target.name==='city'){
            this.city = event.target.value;
        }
        if(event.target.name==='zip_code'){
            this.zip_code = event.target.value;
        }
        if(event.target.name==='neighbourhood'){
            this.neighbourhood = event.target.value;
        }

    }
    applySearch(){
        this.spinnerdatatable = true;
        console.log('searchterm:',this.searchTerm);
        console.log('bedrooms:',this.bedrooms);
        console.log('bathrooms:',this.bathrooms);
        console.log('listing type:',this.listing_type);
        console.log('min_price:',this.min_price);
        console.log('max_price:',this.max_price);
        console.log('sq_ft:',this.sq_ft);
        console.log('city:',this.city);
        console.log('zip_code:',this.zip_code);
        console.log('neighbourhood:',this.neighbourhood);

        this.pagedFilteredListingData = this.ListingData.filter(listing =>{
            const nameIncludesSearch = this.searchTerm ? listing.Name.toLowerCase().includes(this.searchTerm.toLowerCase()) : true;
            const num_of_bathrooms = this.bathrooms?listing.Number_of_Bathrooms__c == this.bathrooms:true;
            const num_of_bedrooms = this.bedrooms?listing.Number_of_Bedrooms__c == this.bedrooms:true;
            const isPropertyType = this.listing_type ? String(listing.Listing_Type__c) == String(this.listing_type) : true;
            const isPriceGreaterThan = this.min_price ? Number(listing.Listing_Price__c) >= Number(this.min_price) : true;
            const isPriceLesserThan = this.max_price ? Number(listing.Listing_Price__c) <= Number(this.max_price) : true;
            const isSqFt = this.sq_ft ? Number(listing.Sq_Ft__c) == Number(this.sq_ft) : true;
            const isCity = this.city ? listing.City__c.toLowerCase().includes(this.city.toLowerCase()) : true;
            const isZipcode = this.zip_code ? Number(listing.Postal_Code__c) <= Number(this.zip_code) : true;
            // const isNeighborhood = this.neighbourhood ? String(listing.Neighborhood_Information__c) <= String(this.neighbourhood) : true;
            return nameIncludesSearch && num_of_bathrooms && num_of_bedrooms && isPropertyType && isPriceGreaterThan && isPriceLesserThan && isSqFt && isCity && isZipcode;
        });
        console.log('FilteredListingData:',this.FilteredListingData.length);
        console.log('FilteredListingData:',this.FilteredListingData);

        if(this.pagedFilteredListingData.length <=0){
            this.isData = false;
            this.show_more_button_class = 'not-show_last_button';
            this.result_found_numbers = this.pagedFilteredListingData.length;
            this.dropDownClass ='drop-down-none';
            setTimeout(() => {
                this.spinnerdatatable = false;
            }, 4000);
        }else{
            this.isData = true;
            this.show_more_button_class = 'not-show_last_button';
            this.result_found_numbers = this.pagedFilteredListingData.length;
            this.dropDownClass ='drop-down-none';
            setTimeout(() => {
                this.spinnerdatatable = false;
            }, 4000);
        }
    }

    clearFilter(){
        this.searchTerm = '';
        this.bedrooms=0;
        this.bathrooms=0;
        this.listing_type='';
        this.min_price='';
        this.max_price='';
        this.sq_ft='';
        this.city='';
        this.zip_code='';
        this.neighbourhood='';
    }

    formatDate(inputDate) {
        const dateParts = inputDate.split('-');
        const formattedDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        return formattedDate.toLocaleDateString('en-US', options);
    }

    changeAmenitiesFormat(amenity){
        return amenity.split(';').join(' | ');
    }

}