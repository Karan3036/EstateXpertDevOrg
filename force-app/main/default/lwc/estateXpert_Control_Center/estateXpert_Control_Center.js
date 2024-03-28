import { LightningElement, track } from 'lwc';
import { loadStyle, loadScript } from 'lightning/platformResourceLoader';
import getPicklistValues from '@salesforce/apex/controlCenterController.getPicklistValues';
import getIcons from '@salesforce/apex/controlCenterController.getIcons';
import updateFeatureIconRecord from '@salesforce/apex/controlCenterController.updateFeatureIconRecord';
import uploadFile from '@salesforce/apex/controlCenterController.uploadFile';
import designcss from '@salesforce/resourceUrl/controlCenterCss';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class EstateXpert_Control_Center extends LightningElement {


    isInitalRender = true;
    selectionModel = false;
    @track pickListvalue = [];
    @track iconsValue = [];
    @track isEditing = false;
    @track displayIcon = false;
    fullIconsValue = [];
    @track iconsName;
    @track iconsURL;
    fileData;
    // name = 'Control Center';
    // message = 'Hover your mouse over any tile on the right to learn more about that feature.'

    connectedCallback() {
        // this.fetchPicklistValue();
        loadStyle(this, designcss);
        this.fetchIconsFromStaticResource();
    }

    renderedCallback() {
        try {
            if (this.isInitalRender) {
                console.log("Estate Xpert Control Center Rendered");
                const body = document.querySelector("body");

                const style = document.createElement('style');
                style.innerText = `
                        .slds-template_default {
                            padding: 0 !important;
                        }
                `;

                body.appendChild(style);
                this.isInitalRender = false;
            }
        } catch (error) {
            console.log(' error in render : ', error.messsage);

        }
    }

    openSelectionModel() {
        this.selectionModel = true;
        this.fetchPicklistValue();
    }

    handleCloseModal() {
        this.selectionModel = false;
    }

    fetchPicklistValue() {
        getPicklistValues()
            .then(result => {
                console.log('result:', result);
                result.sort((a, b) => a.name.localeCompare(b.name));
                this.pickListvalue = [];

                result.forEach(item => {
                    if (item.iconURL) {
                        this.pickListvalue.push({
                            name: item.name,
                            iconURL: item.iconURL.Icon_URL__c,
                            iconname: item.iconURL.Icon_Name__c
                        });
                    } else {
                        this.pickListvalue.push({
                            name: item.name,
                            iconURL: '',
                            iconname: ''
                        });
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching picklist values:', error);
            });
    }

    editIconValue(event) {
        const clickedName = event.target.dataset.name;
        this.iconsName = event.target.dataset.iconname;
        this.iconsURL = event.target.dataset.icon;
        this.pickListvalue = this.pickListvalue.map(item => ({
            ...item,
            isEditing: item.name === clickedName ? true : false
        }));
    }

    closeEditFields(event) {
        const clickedName = event.target.dataset.name;
        this.pickListvalue = this.pickListvalue.map(item => ({
            ...item,
            isEditing: item.name === clickedName ? false : item.isEditing
        }));
        const valIndex = this.pickListvalue.findIndex(item => item.name === clickedName);
        if (valIndex !== -1) {
            this.pickListvalue[valIndex].iconURL = this.iconsURL; // Clear the icon URL
            this.pickListvalue[valIndex].iconname = this.iconsName; // Clear the icon name
        }
    }

    fetchIconsFromStaticResource() {
        getIcons()
            .then(result => {
                console.log('result:', result);
                this.iconsValue = [];

                result.forEach(item => {

                    this.iconsValue.push({
                        name: item.Name,
                        iconURL: '/resource/' + item.Name,
                        Id: item.Id
                    });
                    this.fullIconsValue.push({
                        name: item.Name,
                        iconURL: '/resource/' + item.Name,
                        Id: item.Id
                    });

                });
            })
            .catch(error => {
                console.error('Error fetching picklist values:', error);
            });
    }

    searchIconData(event) {
        this.displayIcon = true;
        event.stopPropagation();
    }

    keyupIconData(event) {
        const searchTerm = event.target.value.toLowerCase();

        if (searchTerm === '') {
            this.iconsValue = [...this.fullIconsValue];
            return;
        }

        this.iconsValue = this.fullIconsValue.filter(icon => icon.name.toLowerCase().includes(searchTerm));
    }

    hideList() {
        this.displayIcon = false;
    }

    clearInput(event) {
        const name = event.target.dataset.name;
        console.log(name + " clicked");
        const valIndex = this.pickListvalue.findIndex(item => item.name === name);
        if (valIndex !== -1) {
            this.pickListvalue[valIndex].iconURL = ''; // Clear the icon URL
            this.pickListvalue[valIndex].iconname = ''; // Clear the icon name
        }
    }

    preventHide(event) {
        event.preventDefault();
    }

    clickHandlerIcon(event) {
        this.displayIcon = false;
        const selectedIcon = event.currentTarget.dataset.value;
        const name = event.currentTarget.dataset.name;
        const valIndex = this.pickListvalue.findIndex(item => item.name === name);
        if (valIndex !== -1) {
            this.pickListvalue[valIndex].iconURL = '/resource/' + selectedIcon;
            this.pickListvalue[valIndex].iconname = selectedIcon;
        }
        console.log(this.pickListvalue);
    }

    saveIconDetails(event) {
        const name = event.currentTarget.dataset.name;
        const iconName = event.currentTarget.dataset.iconname;
        const iconURL = event.currentTarget.dataset.icon;
        updateFeatureIconRecord({ FeatureIconName:name, IconName:iconName, IconUrl:iconURL })
            .then(result => {
                console.log('result:', result);
                this.pickListvalue = this.pickListvalue.map(item => ({
                    ...item,
                    isEditing: item.name === name ? false : item.isEditing
                }));
            })
            .catch(error => {
                console.error('Error fetching picklist values:', error);
            });
    }

    openfileUpload(event) {
        const file = event.target.files[0]
        var reader = new FileReader()
        reader.onload = () => {
            var base64 = reader.result.split(',')[1]
            this.fileData = {
                'filename': file.name,
                'base64': base64
            }
            console.log(this.fileData)
        }
        reader.readAsDataURL(file)
    }
    
    handleClick(){
        const {base64, filename} = this.fileData
        uploadFile({ base64, filename}).then(result=>{
            this.fileData = null
            let title = `${filename} uploaded successfully!!`
            this.toast(title)
        })
    }

    toast(title){
        const toastEvent = new ShowToastEvent({
            title, 
            variant:"success"
        })
        this.dispatchEvent(toastEvent)
    }

    removeImg() {
        this.fileData = null;
    }

}