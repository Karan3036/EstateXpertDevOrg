import { LightningElement,track,wire} from 'lwc';
import myImage from '@salesforce/resourceUrl/inquiryPageBG';
import icons from '@salesforce/resourceUrl/InquiryIcon';
import getFavorites from '@salesforce/apex/inquiryPropertyView.getFavorites';
import saveInquiry from '@salesforce/apex/inquiryPropertyView.saveInquiry';
import deleteInquiry from '@salesforce/apex/inquiryPropertyView.deleteInquiry';
import { NavigationMixin,Sh} from "lightning/navigation";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadStyle } from 'lightning/platformResourceLoader';
import customStyles from '@salesforce/resourceUrl/inquiryCss';

export default class InquiryPropertyView extends NavigationMixin(LightningElement) {
    @track tab1Active = true;
    @track imageUrl = myImage;
    @track saveIcon = icons + '/saveIcon.png';
    @track editIcon = icons + '/editIcon.png';
    @track deleteIcon = icons + '/deleteIcon.png';
    @track SaleListing ;
    @track RentListing ;
    @track FilteredListingData;
    @track ListingData;
    @track propertyMediaUrls;
    @track PropertyMedia;
    @track ListingName;
    Index;
    @track isMobile = false;

    get options() {
        return [
            { label: 'Open', value: 'open' },
            { label: 'Pending', value: 'pending' },
            { label: 'Close', value: 'close' },
        ];
    }

    
    connectedCallback() {
        // this.checkCookie();
        loadStyle(this, customStyles);
        this.listingDataForProperty();
        this.isMobile = window.innerWidth <= 900;
        window.addEventListener('resize',  ()=>{
            this.isMobile = window.innerWidth <= 900;
            console.log('Hi'+typeof this.isMobile);
        });
        // this.setBackgoundImage();
    }

    handleResize() {
        // Update isMobile value when the window is resized
        this.isMobile = window.innerWidth <= 600;
    }

    renderedCallback(){
        const BgUrl = myImage;
        const containerDiv = this.template.querySelector('.main');
        // Set background image using inline style
        containerDiv.style.backgroundImage = `url(${BgUrl})`;
        containerDiv.style.backgroundSize = "cover";
    }

    disconnectedCallback() {
        window.removeEventListener('resize', ()=>{
            this.isMobile = window.innerWidth <= 900;
            console.log('Hi'+typeof this.isMobile);
        });
    }
    
    checkCookie(){
        const cookieString = document.cookie;
        const cookies = cookieString.split(';');
        
        let contactInfo = {};
        
        for (let cookie of cookies) {
            
            if (cookie.includes('contactInfo')) {
                
                const contactInfoString = cookie.split('=')[1].trim();  
                try {
                    contactInfo = JSON.parse(contactInfoString);
                } catch (error) {
                    console.error('Error parsing contactInfo:', error);
                }
                break;
            }
        }
    }
    
    handleChange(event) {
        const pickValue = event.detail.value;
        const Index =  parseInt(event.currentTarget.dataset.id, 10);
        this.FilteredListingData[Index-1].Status = pickValue;

    }

    listingDataForProperty() {
        const con = 'a03GA00002t25RZYAY';
        getFavorites({ListingId:con}).then(result=>{
        this.ListingName = result.Listings[0].Name;
        console.log('1'+result.Listings[0].Id);
        this.propertyMediaUrls = result.Medias;
        console.log(JSON.stringify(this.propertyMediaUrls ));
        this.PropertyMedia = this.propertyMediaUrls[result.Listings[0].Property_ID__c] ? this.propertyMediaUrls[result.Listings[0].Property_ID__c] : '/sfsites/c/resource/nopropertyfound';
        this.FilteredListingData = result.Contacts;
        this.Index = 0;
        this.FilteredListingData.forEach(row => {
            // row.media_url = this.propertyMediaUrls[result.Listings[0].Property_ID__c] ? this.propertyMediaUrls[result.Listings[0].Property_ID__c] : '/sfsites/c/resource/nopropertyfound';
            this.Index = this.Index+1;
            row.Index = this.Index;
            result.LinkedListings.forEach(linked => {
                if(row.Id == linked.Contact__c){
                    row.Id = linked.Id;
                    row.InquiryDate = linked.Inquiry_Date__c;
                    row.Status = linked.Status__c;
                    row.disable = true;
                }
            })
           });
        });
        
    }

    editClick(event){
        const Index = parseInt(event.currentTarget.dataset.id, 10);
        this.FilteredListingData[Index-1].disable = !this.FilteredListingData[Index-1].disable;
        // parseInt(event.currentTarget.dataset.id, 10)
    }

    saveClick(event){
        const Index =  parseInt(event.currentTarget.dataset.id, 10);
        const LinkedListing  =  this.FilteredListingData[Index-1].Id;
        const updateValue = this.FilteredListingData[Index-1].Status;
        saveInquiry({LinkedListingId:LinkedListing,Status:updateValue}).then(result=>{
            this.FilteredListingData[Index-1].disable = true;
            const showToastEvent = new ShowToastEvent({
                title: 'Saved Successfully',
                variant: 'success',
                mode: 'dismissable',
                message: ''
            });
            this.dispatchEvent(showToastEvent);
        })
    }

    deleteClick(event){
        const Index =  parseInt(event.currentTarget.dataset.id, 10);
        const LinkedListing  =  this.FilteredListingData[Index-1].Id;
        deleteInquiry({LinkedListingId:LinkedListing}).then(result=>{
            this.listingDataForProperty();
            const showToastEvent = new ShowToastEvent({
                title: 'Deleted Successfully',
                variant: 'success',
                mode: 'dismissable',
                message: ''
            });
            this.dispatchEvent(showToastEvent);
        })
    }
}