import { LightningElement,track,api,wire} from 'lwc';
import getAddress from '@salesforce/apex/Mapcontroller.getAddress';
import getImage from '@salesforce/apex/Mapcontroller.getImage';
import {ShowToastEvent} from 'lightning/platformShowToastEvent'
const RECORDS_PER_PAGE = 10;
export default class mapsComponent extends LightningElement {
    images ;
    @track address = [];
    searchValue = '';
    @api Id;
    @track id='';
 
    // update searchValue var when input field value change
    searchKeyword(event) {
        this.searchValue = event.target.value;
        console.log(this.searchValue);
    }
 
    // call apex method on button click 
    handleSearchKeyword() {
        console.log(this.searchValue);
        if (this.searchValue !== '') {
            getAddress({
                    searchKey: this.searchValue
                })
                .then(result => {
                    this.address = result;
                    if (Array.isArray(result) && result.length > 0) {
                        let ids = [];
                        for(let i=0;i<result.length;i++)
                        {
                            this.id = result[i].Id; // Accessing the Id property of the first item
                            console.log(this.id);
                            ids.push(result[i].Id);
                        }
                        console.log(ids);
                        const event = new CustomEvent('passids', {
                        detail: { ids: ids }
                    });
                    this.dispatchEvent(event);
                        // window.location.href = '/apex/Maps?ids=' + ids.join(',');
                    }
                })
                .catch(error => {
                   
                    const event = new ShowToastEvent({
                        title: 'Error',
                        variant: 'error',
                        message: error.body.message,
                    });
                    this.dispatchEvent(event);  
                    this.address = null;
                });
        }
        else {
            const event1 = new ShowToastEvent({
                variant: 'error',
                message: 'Search text missing..',
            });
            this.dispatchEvent(event1);
        }
    }
    handleCard(event)
    {
        this.selectedId=event.currentTarget.dataset.id;
        this.id=this.selectedId;
        console.log('test123',this.id);
        const event2 = new CustomEvent('passids', {
            detail:  this.ids
        });
        console.log('event2 call');
        this.dispatchEvent(event2);
        window.location.href = '/apex/Maps?id=' + this.id;
        // Fire custom event to notify parent Lightning app
        // const eventToSend = new CustomEvent('idselected', {
        //     detail: { id: this.id }
        // });
        // this.dispatchEvent(eventToSend);
    }

    
        // this.dispatchEvent(new CustomEvent(
        //     'getdata', 
        //         {
        //             detail: { Id:  this.Id},
        //             bubbles: true,
        //             composed: true,
        //         }
        //     ));

        @wire(getImage)
        wiredImages({ error, data }) {
            if (data) {
                this.images = data;
                console.log(this.images);
                this.dispatchImageEvent();
            } else if (error) {
                console.log('Error fetching Image')
            }
        }
        
        dispatchImageEvent() {
            const event = new CustomEvent('passimage', {
                detail: { images: this.images }
            });
            window.dispatchEvent(event);
        }
}