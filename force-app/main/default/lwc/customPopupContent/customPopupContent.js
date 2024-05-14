// PopupContent.js
import { LightningElement, api } from 'lwc';

export default class customPopupContent extends LightningElement {
    @api name;
    @api images;
    @api address;
}