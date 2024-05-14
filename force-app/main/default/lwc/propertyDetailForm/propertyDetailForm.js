import { LightningElement, track , wire } from 'lwc';
import getPicklistValues from '@salesforce/apex/PropertyDetailFormController.getPicklistValues';
import awsuploadbg from '@salesforce/resourceUrl/awsuploadbg';
import readFieldSet from '@salesforce/apex/PropertyDetailFormController.readFieldSet';
import { loadStyle, loadScript } from 'lightning/platformResourceLoader';
import PropertyDetailFormCss from '@salesforce/resourceUrl/PropertyDetailFormCss';
import getMetadataRecords from '@salesforce/apex/PropertyDetailFormController.getCustomMetadataRecords';
import saveProperty from '@salesforce/apex/PropertyDetailFormController.saveProperty';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class PropertyDetailForm extends NavigationMixin(LightningElement) {


    @track isLoading = true;
    @track metadataRecords = [];
    @track selectedPropertyTags = [];

    @track selectedPropertyType;
    @track propertyTypes = [];
    @track selectedType;
    @track cityValue = '';
    @track localityValue = '';
    @track bedroomValue = 0;
    @track bathroomValue = 0;
    @track balconyValue = 0;
    @track selectedFloorNumber;
    @track selectedTotalFloors;
    @track selectedFurnishedStatus;
    @track floorNumbers = [];
    @track totalFloors = [];
    @track furnishedStatus = [];
    @track coveredArea;
    @track carpetArea;
    @track coveredAreaUnit = 'SqFeet';
    @track carpetAreaUnit = 'SqFeet';
    @track selectedTransactionType;
    @track selectedPossessionStatus;
    @track selectedMonth;
    @track selectedYear;
    @track expectedPrice;
    @track pricepersqft;
    @track selectedPriceType;
    @track subscription;
    @track brokerages = [];
    @track selectedBrokerageType;
    @track selectedTag = ''; 
    @track bookingAmount;
    @track maintenanceCharges;
    @track selectedResponseOfBroker;
    @track uploadedFileName;

    @track fieldSetData;
    @track dynamicValues = {};
    fields = [];

    @track awsbgupload = awsuploadbg;

    transformOptions(data) {
        return data.map(option => {
            return {
                label: option,
                value: option
            };
        });
    }

    subscriptionOptions = [
        { label: 'Monthly', value: 'Monthly' },
        { label: 'Quarterly', value: 'Quarterly' },
        { label: 'Yearly', value: 'Yearly' },
        { label: 'One-Time', value: 'One-Time' },
        { label: 'Per sq. Unit Monthly', value: 'Per sq. Unit Monthly' }
    ];

    async connectedCallback() {

        this.fetchMetadata();

        Promise.all([
            loadStyle(this, PropertyDetailFormCss)
        ])
        .then(() => {
            console.log('Sucess');

        })
        .catch(error => {
            console.error('Error loading scripts', error);
        });

        this.propertyTypes = await this.fetchPicklistValues('Property_Type__c');
        this.isLoading = false;
        this.floorNumbers = await this.fetchPicklistValues('Floor_No__c');
        this.totalFloors = await this.fetchPicklistValues('Total_Floors__c');
        this.furnishedStatus = await this.fetchPicklistValues('Furnished_Status__c');
        this.brokerages = await this.fetchPicklistValues('Brokerage__c');
    }

    fetchMetadata() {
        getMetadataRecords()
            .then(result => {
                console.log('result ==> ' , result);
                this.metadataRecords = result;
            })
            .catch(error => {
                console.error('Error fetching metadata:', error);
            });
    }

    async fetchPicklistValues(fieldName) {
        try {
            const result = await getPicklistValues({ fieldName: fieldName });
            return this.transformOptions(result);
        } catch (error) {
            console.error('Error loading picklist values for ' + fieldName, error);
            return [];
        }
    }

    get monthOptions() {
        return [
            { label: 'January', value: 'January' },
            { label: 'February', value: 'February' },
            { label: 'March', value: 'March' },
            { label: 'April', value: 'April' },
            { label: 'May', value: 'May' },
            { label: 'June', value: 'June' },
            { label: 'July', value: 'July' },
            { label: 'August', value: 'August' },
            { label: 'September', value: 'September' },
            { label: 'October', value: 'October' },
            { label: 'November', value: 'November' },
            { label: 'December', value: 'December' }
        ];
    }

    get yearOptions() {
        let years = [];
        const currentYear = new Date().getFullYear();
        for (let i = currentYear; i <= currentYear + 5; i++) {
            years.push({ label: `${i}`, value: `${i}` });
        }
        return years;
    }

    areaUnits = [
        { label: 'Sq. Feet', value: 'SqFeet',selected: true},
        { label: 'Sq. Meter', value: 'SqMeter' }
    ];

    incrementBedroom() {
        this.bedroomValue++;
        console.log('Bedrooms ==> ' + this.bedroomValue);
    }

    decrementBedroom() {
        if(this.bedroomValue > 0) {
            this.bedroomValue--;
            console.log('Bedrooms ==> ' + this.bedroomValue);
        }
    }

    incrementBathroom() {
        this.bathroomValue++;
        console.log('bathroomValue ==> ' + this.bathroomValue);
    }

    decrementBathroom() {
        if(this.bathroomValue > 0) {
            this.bathroomValue--;
            console.log('bathroomValue ==> ' + this.bathroomValue);
        }
    }

    incrementBalcony() {
        this.balconyValue++;
        console.log('balconyValue ==> ' + this.balconyValue);
    }

    decrementBalcony() {
        if (this.balconyValue > 0) {
            this.balconyValue--;
            console.log('balconyValue ==> ' + this.balconyValue);
        }
    }

    async handlePropertyTypeChange(event) {
        this.isLoading = true;
        this.selectedPropertyType = event.detail.value;

        const selectedRecord = this.metadataRecords.find(record => record.MasterLabel === this.selectedPropertyType);
        console.log('selectedRecord ==> ' + selectedRecord);
        this.selectedPropertyTags = selectedRecord ? selectedRecord.tags.split(';') : [];
        console.log('selectedPropertyTags ==> ' + this.selectedPropertyTags);

        console.log('Selected Property Type:', this.selectedPropertyType);

        let fieldset = '';
        let object = 'Property__c';

        if (this.selectedPropertyType === 'Flat / Apartment') {
            fieldset = 'Flat_Apartment';
        }
        else if(this.selectedPropertyType === 'Residential Land / Plot'){
            fieldset = 'Residential_Land_Plot';
        }
        else if(this.selectedPropertyType === 'Commercial shop'){
            fieldset = 'Commercial_shop';
        }
        else if(this.selectedPropertyType === 'Commercial office space'){
            fieldset = 'Commercial_office_space';
        }
        else if(this.selectedPropertyType === 'Commercial Land'){
            fieldset = 'Commercial_Land';
        }
        else if(this.selectedPropertyType === 'Penthouse'){
            fieldset = 'Penthouse';
        }
        else{
            this.isLoading = false;
        }
        
        if(fieldset != '' || fieldset != null){
            readFieldSet({ fieldSetName: fieldset , ObjectName: object })
            .then((data) => {
                console.log('data:', data);
                this.fieldSetData = data.map(field => {
                    if (field.PicklistValues) {
                        const picklistOptions = field.PicklistValues.split(';').map(option => ({
                            label: option,
                            value: option
                        }));
                        return { ...field, picklistOptions };
                    } else if (field.BooleanValues) {
                        const booleanOptions = field.BooleanValues.split(';').map(option => ({
                            label: option,
                            value: option
                        }));
                        return { ...field, booleanOptions };
                    } else {
                        return field;
                    }
                });
                console.log('fieldSetData:', this.fieldSetData);
                this.isLoading = false;
            })
            .catch((error) => {
                console.log(error);
            });
        }
    }    
    
    handleInputChange(event) {
        const { name, value } = event.target;
        console.log(`Name: ${name}, Value: ${value}`);
    
        if (name === 'floorNumber') {
            this.selectedFloorNumber = value;
        } else if (name === 'totalFloors') {
            this.selectedTotalFloors = value;
        } else if (name === 'furnishedStatus') {
            this.selectedFurnishedStatus = value;
        } else if (name === 'Month') {
            this.selectedMonth = value;
        } else if (name === 'Year') {
            this.selectedYear = value;
        } else if(name === 'coveredArea'){
            this.coveredArea = value;
        }else if (name === 'coveredAreaUnit') {
            this.selectedCoveredAreaUnit = value;
        }else if(name === 'carpetArea'){
            this.carpetArea = value;
        }else if (name === 'carpetAreaUnit') {
            this.selectedCarpetAreaUnit = value;
        } else if (name === 'City') {
            this.cityValue = value;
        } else if (name === 'locality') {
            this.localityValue = value;
        } else if (name === 'BookingAmount') {
            this.bookingAmount = value;
        } else if (name === 'MaintenanceCharges') {
            this.maintenanceCharges = value;
        } else if (name === 'priceType') {
            this.selectedPriceType = value;
        }else if( name === 'userType'){
            this.selectedType = value;
        }else if(name === 'transactionType'){
            this.selectedTransactionType = value;
        }else if( name === 'possessionStatus'){
            this.selectedPossessionStatus = value;
        }else if(name === 'totalprice'){
            this.expectedPrice = value;
        }else if(name === 'pricepersqft'){
            this.pricePerSqft = value;
        }else if(name === 'subscriptionType'){
            this.selectedSubscriptionType = value;
        }else if(name === 'brokeragetype'){
            this.selectedBrokerageType = value;
        }
    }

    get isFlatOrApartment() {
        return (this.selectedPropertyType === 'Flat / Apartment' || this.selectedPropertyType === 'Penthouse');
    }
      
    handleDynamicInputChange(event){
        const { label, value } = event.target;

        this.dynamicValues[label.trim()] = value;
        console.log('dynamicValues ==> ' , this.dynamicValues);
    }

    
    handleChildSelect(event) {
        console.log('Clicked');
    
        // const selectedTag = event.target.textContent.trim();
        const selectedTag = event.currentTarget.dataset.tag;
        this.selectedTag = selectedTag; 
        console.log('Selected tag:', selectedTag);
    
        const children = this.template.querySelectorAll('.child');
        console.log(children);
        children.forEach(child => {
            child.classList.remove('clicked');
        });
        event.currentTarget.classList.add('clicked');
    }

    handleSave(event){
        if(this.cityValue == null || this.cityValue == ''){
            this.showErrorToast('City Value Cannot be null');
            return;
        }

        if(this.localityValue == null || this.localityValue == ''){
            this.showErrorToast('Locality Value Cannot be null');
            return;
        }


        const propertyDetails = {
            selectedPropertyType: this.selectedPropertyType,
            selectedType: this.selectedType,
            cityValue: this.cityValue,
            localityValue: this.localityValue,
            bedroomValue: this.bedroomValue,
            bathroomValue: this.bathroomValue,
            balconyValue: this.balconyValue,
            selectedFloorNumber: this.selectedFloorNumber,
            selectedTotalFloors: this.selectedTotalFloors,
            selectedFurnishedStatus: this.selectedFurnishedStatus,
            coveredArea: this.coveredArea,
            carpetArea: this.carpetArea,
            coveredAreaUnit: this.coveredAreaUnit,
            carpetAreaUnit: this.carpetAreaUnit,
            selectedTransactionType: this.selectedTransactionType,
            selectedPossessionStatus: this.selectedPossessionStatus,
            selectedMonth: this.selectedMonth,
            selectedYear: this.selectedYear,
            expectedPrice: this.expectedPrice,
            pricepersqft: this.pricepersqft,
            selectedPriceType: this.selectedPriceType,
            subscription: this.subscription,
            selectedBrokerageType: this.selectedBrokerageType,
            selectedTag: this.selectedTag,
            bookingAmount: this.bookingAmount,
            maintenanceCharges: this.maintenanceCharges,
            selectedResponseOfBroker: this.selectedResponseOfBroker,
            uploadedFileName: this.uploadedFileName,
            dynamicValues: this.dynamicValues
        };

        saveProperty({ propertyDetails: JSON.stringify(propertyDetails) })
            .then(result => {
                console.log('Property saved successfully:', result);
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: result,
                        objectApiName: 'Property__c',
                        actionName: 'view'
                    }
                });
            })
            .catch(error => {
                console.error('Error saving property:', error);
            });

    }

    handleImageUpload(event) {
        const files = event.target.files;
        if (files && files.length > 0) {
            const fileName = files[0].name;
            this.uploadedFileName = fileName;
            // console.log('Uploaded Image Name:', fileName);
        }
    }

    showSuccessToast(message) {
        const evt = new ShowToastEvent({
            title: 'Success',
            message: message,
            variant: 'success',
            mode: 'dismissable'
        });
        this.dispatchEvent(evt);
    }
    
    showErrorToast(message) {
        const evt = new ShowToastEvent({
            title: 'Error',
            message: message,
            variant: 'error',
            mode: 'dismissable'
        });
        this.dispatchEvent(evt);
    }

}