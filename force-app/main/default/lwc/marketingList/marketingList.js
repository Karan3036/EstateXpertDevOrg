import { LightningElement, track } from 'lwc';
export default class MarketingList extends LightningElement {

    @track listView = true;
    @track rowView = false;
    
    changeViewToRow(event){
        this.rowView = true;
        this.listView =false;
    }
    changeViewToList(){
        this.listView =true;
        this.rowView = false;
    }

}