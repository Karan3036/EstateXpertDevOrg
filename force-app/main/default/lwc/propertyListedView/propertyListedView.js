import { LightningElement, track, wire } from 'lwc';
import { loadStyle, loadScript } from 'lightning/platformResourceLoader';
import logo from '@salesforce/resourceUrl/estatexpertlogo';
import Img1 from '@salesforce/resourceUrl/DemoImg1';
import Property_view_example from '@salesforce/resourceUrl/Property_view_example';
import NextArrowIcon from '@salesforce/resourceUrl/NextArrowIcon';
import PrevArrowIcon from '@salesforce/resourceUrl/PrevArrowIcon';
import designcss from '@salesforce/resourceUrl/propertycssoveride';
import getListingData from '@salesforce/apex/propertyListedViewController.getListingInformation';
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
    @track showSpinner = false;
    @track isData = false;
    @track ListingData =[];
    @track bedrooms = 1;
    @track bathrooms=1;
    @track searchTerm;
    @track FilteredListingData =[];
    @track FeaturedProperty = true;
    @track propertyMediaUrls;


    get totalPages() {
        return Math.ceil(this.ListingData.filter(listing =>{
            const featured_prop = this.FeaturedProperty?listing.Featured_Property__c == true:false;
            return featured_prop ;
        }).length / PAGE_SIZE);
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
    }

    goToNext() {
        // console.log('onNext:',this.totalPages);
        if (this.currentPage!==this.totalPages) {
            console.log('onNext:',!this.currentPage ===this.totalPages);
            this.currentPage += 1;
            this.pagedProperties;
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
        getListingData().then((result) => {
            console.log('result:',result);
            this.FilteredListingData = result.Listings;
            this.ListingData = result.Listings;
            this.propertyMediaUrls =result.Medias;
            console.log('ListingData:',this.propertyMediaUrls);
            this.isData = true;
        });
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
    applySearch(){
        this.showSpinner = true;
        // setTimeout(() => {
            this.FilteredListingData = this.ListingData.filter(listing =>{
                const nameIncludesSearch = this.searchTerm ? listing.City__c.toLowerCase().includes(this.searchTerm.toLowerCase()) : true;
                const num_of_bathrooms = this.bathrooms?listing.Number_of_Bathrooms__c == this.bathrooms:true;
                const num_of_bedrooms = this.bedrooms?listing.Number_of_Bedrooms__c == this.bedrooms:true;
                return nameIncludesSearch && num_of_bathrooms && num_of_bedrooms;
            });
            console.log('FilteredListingData:',this.FilteredListingData.length);
            if(this.FilteredListingData.length <=0){
                this.isData = false;
            }else{
                this.isData = true;
            }
            this.showSpinner = false;
        // }, 1000);
        
    }

}