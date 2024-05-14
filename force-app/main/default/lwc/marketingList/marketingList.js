import { LightningElement, track, wire,api } from 'lwc';
import getPicklistForListingType from '@salesforce/apex/MarketingComponent.getPicklistForListingType'
export default class MarketingList extends LightningElement {


    @track listView = true;
    @track rowView = false;
   
    changeViewToRow(){
        this.listView = false;
        this.rowView = true;
    }

    changeViewToList(){
        this.listView = true;
        this.rowView = false;
    }
    // for listing and lead source dropbox
    @track listingType = [{ id: '1'}]; 
    @track listingOptions = [];
    @track selectedValue;

    handleListingChange(event) {
        this.selectedValue = event.detail.value;
    }

    @wire(getPicklistForListingType)
    wiredListingType({ error, data }) {
        if (data) {
            this.listingOptions = data.map(option => ({ label: option, value: option }));
        } else if (error) {
            // Handle error
        }
    }
     
    
    // for removing fields

    @track cities = [{ id: 1, name: '' }];
    @track bedrooms = [{ id: 2, value:'0'}];
    @track sizeMin = [{ id: 3, value:'0'}];
    @track prices = [{ id: 4, value: '0 GBP' }];
    @track leadSource = [{id: 5, placeholder: 'Filter for Lead Source...'}];
    @track listingType = [{id: 6, placeholder: 'Filter for Listing Type...'}];
    @track value;
    @track labelItem=[];


    removeCity(event) {
        const cityId = parseInt(event.target.dataset.id);
        this.cities = this.cities.filter(city => city.id !== cityId);
    }

    removeBedroom(event) {
        const bedroomId = parseInt(event.target.dataset.id);
        this.bedrooms = this.bedrooms.filter(bedroom => bedroom.id !== bedroomId);
    }

    removeSizeMin(event) {
        const sizeId = parseInt(event.target.dataset.id);
        this.sizeMin = this.sizeMin.filter(size => size.id !== sizeId);
    }

    removePrices(event){
        const priceId = parseInt(event.target.dataset.id);
        this.prices = this.prices.filter(size => size.id !== priceId);
    }

    removeLead(event){
        const leadId = parseInt(event.target.dataset.id);
        this.leadSource = this.leadSource.filter(lead => lead.id !== leadId);
    }

    removeListing(event){
        const listId = parseInt(event.target.dataset.id);
        this.listingType = this.listingType.filter(list => list.id !== listId);
    }



    removePill(event) {
        const index = event.target.name;
        this.labelItem.splice(index, 1);
    }

   
    handleInputChange(event) {
        const inputValue = event.target.value;
        if (inputValue) {
            this.labelItem.push({ label: inputValue });
        }
    }



    qtySize = 0;
    qtyBedroom = 0;

    setDecrementSize(event) {
        if(this.qtySize == 0)   this.qtySize = 0;
        else    this.qtySize = this.qtySize - 1;
    }

    setIncrementSize(event) {
        this.qtySize = this.qtySize + 1;
    }

    setDecrementBedroom(event) {
        if(this.qtyBedroom == 0)   this.qtyBedroom = 0;
        else    this.qtyBedroom = this.qtyBedroom - 1;
    }

    setIncrementBedroom(event) {
        this.qtyBedroom = this.qtyBedroom + 1;
    }

}