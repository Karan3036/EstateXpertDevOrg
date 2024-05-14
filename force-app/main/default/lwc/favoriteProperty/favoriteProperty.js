import { LightningElement,track,wire,api } from 'lwc';
import myImage from '@salesforce/resourceUrl/agentViewImg';
import icons from '@salesforce/resourceUrl/favoritepageIcons';
import getFavorites from '@salesforce/apex/favoritePropertyClass.getFavorites';


export default class FavoriteProperty extends LightningElement {
    @track bedIcon = icons+'/bedIcon.png';
    @track bathIcon = icons+'/bathIcon.png';
    @track areaIcon = icons+'/areaIcon.png';
    @track approveIcon = icons+'/approveIcon.png';
    @track securityIcon = icons + '/securityIcon.png';
    @track ContactId = '003GA000045yhZYYAY';
    @track FilteredListingData;
    @track ListingData;
    @track propertyMediaUrls;
  
    connectedCallback(){
        // this.checkCookie();
        const con = this.ContactId;
        getFavorites({ContactId:con}).then(result=>{
            this.listingDataForProperty(result);
        })
    }

    listingDataForProperty(result) {
        
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
                    this.ContactId = contactInfo.Id;
                } catch (error) {
                    console.error('Error parsing contactInfo:', error);
                }
                break;
            }
        }
    }


    removeLike(event){
        const listingId = event.target.dataset.id;
        removeLike({ContactId:this.ContactId,ListingId:listingId}).then(result => {
            console.log(result);
        });
        
    }
}