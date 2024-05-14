import { LightningElement,track,wire} from 'lwc';
import myImage from '@salesforce/resourceUrl/agentViewImg';
import icons from '@salesforce/resourceUrl/agentPageIcons';
import getListings from '@salesforce/apex/agentPropertyView.getListings';
export default class AgentPropertyView extends LightningElement {
    @track tab1Active = true;
    @track tab2Active = false;
    @track tab3Active = false;
    @track imageUrl = myImage;
    @track bedIcon ;
    @track bathIcon ;
    @track carIcon ;
    @track deskIcon ;
    @track locationIcon ;
    FilteredListingData;
    SaleListing =[];
    RentListing =[];
    ListingData;
    result_found_numbers;
    pagedFilteredListingData;
    isData;
    spinnerdatatable;

    
    connectedCallback() {
        this.bedIcon = icons + '/bedIcon.png'; 
        this.bathIcon = icons + '/bedIcon.png';
        this.carIcon = icons + '/bedIcon.png';
        this.deskIcon = icons + '/deskIcon.png';
        this.locationIcon = icons + '/location.png';
        getListings()
        .then(result => {
           this.setListings(result);
           console.log(result);
        })
        .catch(error => {
            console.error('Error fetching Property field data', error);
        });
        this.checkCookie();
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

    handleTabClick(event){
        const btn =  event.currentTarget.dataset.tabId;
        console.log(typeof btn);
        if(btn == '1'){
            this.tab1Active = true;
            this.tab2Active = false;
            this.tab3Active = false;
        }else if(btn == '2'){
            this.tab1Active = false;
            this.tab2Active = true;
            this.tab3Active = false;
        }else if(btn == '3'){
            this.tab1Active = false;
            this.tab2Active = false;
            this.tab3Active = true;
        }
        this.selectBtn(btn);
    }

    selectBtn(btn){
        this.template.querySelectorAll("button").forEach(tabel => {
            
                tabel.classList.remove("activebtn");
          
        });
        this.template.querySelector('[data-tab-id="' + btn + '"]').classList.add("activebtn");
    }

    setListings(result){
        this.spinnerdatatable = true;
        this.FilteredListingData = result.Listings;
        this.ListingData = result.Listings;
        this.propertyMediaUrls = result.Medias;
        this.ListingData.forEach(row => {
            const prop_id = row.Property_ID__c;
            row.media_url = this.propertyMediaUrls[prop_id];
        });
        this.FilteredListingData.forEach(row => {
            if(row.Listing_Type__c === 'Sale'){
                this.SaleListing.push(row);
            }else if(row.Listing_Type__c === 'Rent'){
                this.RentListing.push(row);
            }
            const prop_id = row.Property_ID__c;
            row.media_url = this.propertyMediaUrls[prop_id] ? this.propertyMediaUrls[prop_id] : '/sfsites/c/resource/nopropertyfound';
            
            row.Listing_Price__c = row.Listing_Price__c ? row.Listing_Price__c : 'TBD';
            
            console.log('type'+row.Listing_Type__c);
        });
        console.log('1'+JSON.stringify(this.SaleListing));
        console.log('2'+JSON.stringify(this.RentListing));
        this.result_found_numbers = this.FilteredListingData.length;
        this.pagedFilteredListingData = this.FilteredListingData.slice(0, 6);
        console.log('ListingData:', this.ListingData);
        this.isData = true;
        this.spinnerdatatable = false;
    }

}