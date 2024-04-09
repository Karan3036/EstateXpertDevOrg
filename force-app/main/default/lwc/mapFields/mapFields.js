import { LightningElement, api, track, wire } from 'lwc';
import getObjectFields from '@salesforce/apex/MapFieldCmp.getObjectFields';
import saveMappings from '@salesforce/apex/MapFieldCmp.saveMappings';
import getMetadata from '@salesforce/apex/MapFieldCmp.getMetadata';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class MapFieldsCmp extends LightningElement {
    @api recordId;
    @track selectedValues = [];
    @track comboboxes = [];
    @track dropDownPairs = [];
    ListingOptions = [];
    MainListingOptions = [];
    updateListing = [];
    updateProperty = [];
    PropertyOptions = [];
    MainPropertyOptions = [];
    checkboxValue = false;
    isLoading = false;
    options = [{ label: 'Sync', value: 'option1' }];
    selectedListingFieldApiName;
    @track showConfirmationModal = false;
    

    connectedCallback(){
        this.isLoading = true;
        getObjectFields({objectName: 'Listing__c'}).then(data => {
            const excludedFields = ['Id', 'OwnerId','CreatedById', 'CreatedDate', 'LastModifiedById', 'LastModifiedDate', 'SystemModstamp','Year_Built__c','LastViewedDate','LastReferencedDate','RecordTypeId','Listing_RecordType__c','IsDeleted'];
            const filteredFields = data.filter(field => !excludedFields.includes(field.apiName));
            if (data) {
                this.MainListingOptions = filteredFields.map((field) => ({
                    label: field.label,
                    value: field.apiName,
                    dataType: field.dataType // Remember the data type
                }));
                this.ListingOptions = this.MainListingOptions;
            } else if (error) {
                console.error('Error fetching Listing field data', error);
            }
        }).catch(error => {
            console.error('Error fetching metadata:', error);
        });


        getObjectFields({objectName: 'Property__c'}).then(data => {
            const excludedFields = ['Property_ID__c', 'OwnerId','Year_Built__c','Property_RecordType__c','RecordTypeId','CreatedById', 'CreatedDate', 'LastModifiedById', 'LastModifiedDate', 'SystemModstamp','IsDeleted'];
            const filteredFields = data.filter(field => !excludedFields.includes(field.apiName));
            if (data) {
                this.MainPropertyOptions = filteredFields.map((field) => ({
                    label: field.label,
                    value: field.apiName,
                    dataType: field.dataType // Remember the data type
                }));
                this.filterPropertyOptions();
                this.getMetadataFunction();
            } else if (error) {
                console.error('Error fetching Property field data', error);
            }
        }).catch(error => {
            console.error('Error fetching metadata:', error);
        });

        
            this.filterAndUpdateListingOptions();
        
    }



    //Get metadata from the record and set in picklists pair 
    getMetadataFunction(){
        
        getMetadata().then(result => {
            this.parseAndSetMappings(result[0]);
            this.setCheckboxValue(result[1]);
            this.isLoading = false;
        }).catch(error => {
            console.error('Error fetching metadata:', error);
            this.isLoading = false;
        });
        this.filterAndUpdateListingOptions();
        
    }

    parseAndSetMappings(mappingString) {
        const mappings = mappingString.split(';');
        mappings.forEach(mapping => {
            const [selectedListing, selectedProperty] = mapping.split(':');
            if (selectedListing && selectedProperty) {
                const newPair = {
                    id: this.dropDownPairs.length,
                    selectedListing: selectedListing,
                    selectedProperty: selectedProperty,
                    listingOptions: this.ListingOptions,
                    propertyOptions: this.filterPropertyOptions(selectedListing),
                    isPropertyPicklistDisabled: false
                };
                this.dropDownPairs.push(newPair);
                this.filterAndUpdateListingOptions();
                this.filterAndUpdatePropertyOptions();

            }
        });
    }

    setCheckboxValue(checkboxValue){
        if(checkboxValue == 'true'){
            this.checkboxValue = true;
        }else{
            this.checkboxValue = false;
        }
    }




    //Filter the property base on the selected listing
    filterPropertyOptions(selectedListing) {
        if (!selectedListing) return; // No listing field selected yet
        // console.log(selectedListing);
        const selectedListingField = this.ListingOptions.find(
            (option) => option.value === selectedListing
        );
        // console.log('Selected Listing Field:', selectedListingField);
        if (!selectedListingField || !selectedListingField.dataType) {
            return;
        }
        this.PropertyOptions = [...this.MainPropertyOptions];
        this.PropertyOptions = this.PropertyOptions.filter((option) => {
            return option.dataType === selectedListingField.dataType;
        });
        this.filterAndUpdatePropertyOptions();
        return this.PropertyOptions;
    }




    //Handle picklists selection
    handleSourceFieldChange(event) {
        const index = event.target.dataset.index;
        // console.log(index);
        this.selectedListingFieldApiName = event.detail.value;
       
       this.dropDownPairs[index].selectedListing = event.detail.value;
       this.dropDownPairs[index].propertyOptions = this.filterPropertyOptions(this.selectedListingFieldApiName);
       this.dropDownPairs[index].isPropertyPicklistDisabled = false;
       //this.filterPropertyOptions();
       this.filterAndUpdateListingOptions();
       
    }

    handleDestinationFieldChange(event) {
        // Implement if needed
        const index = event.target.dataset.index;
        this.dropDownPairs[index].selectedProperty = event.detail.value;


    }


    //Exculde the selected picklists values from both lisitng and property
    filterAndUpdateListingOptions() {
        this.updateListing = this.MainListingOptions;
        const selectedListingValues = this.dropDownPairs.map(pair => pair.selectedListing);
    
        selectedListingValues.forEach(selectedValue => {
            this.excludeSelectedOptionFromListing(selectedValue);
        });
        this.ListingOptions = this.updateListing;
        this.updateListing = [];
    }

    filterAndUpdatePropertyOptions() {
        this.updateProperty = this.MainPropertyOptions;
        const selectedListingValues = this.dropDownPairs.map(pair => pair.selectedProperty);
    
        selectedListingValues.forEach(selectedValue => {
            this.excludeSelectedOptionFromProperty(selectedValue);
        });
        this.PropertyOptions = this.updateProperty;
        this.updateProperty = [];
    }

    excludeSelectedOptionFromListing(selectedValue) {
        this.updateListing = this.updateListing.filter(option => option.value !== selectedValue);

        console.log('Update Listing'+this.ListingOptions.length);
    }

    excludeSelectedOptionFromProperty(selectedValue) {
        this.updateProperty = this.updateProperty.filter(option => option.value !== selectedValue);

        console.log('Update Proprty'+this.ListingOptions.length);
    }



    //Add and delete pair of picklists
    addNewPair() {
        // console.log('Before adding new pair - Listing Options:', this.ListingOptions);
        
        this.filterAndUpdateListingOptions();
        this.filterAndUpdatePropertyOptions();
        const newPair = {
            id: this.dropDownPairs.length,
            selectedListing: '',
            selectedProperty: '', 
            listingOptions: this.ListingOptions, 
            propertyOptions: [] , 
            isPropertyPicklistDisabled: true 
        };
        // console.log('After adding new pair - Listing Options:', this.ListingOptions);
        
        this.dropDownPairs.push(newPair);
        
    }

    deletePair(event) {
        const index = event.target.value;
        const selectedListingFieldApiName = this.dropDownPairs[index].selectedListing;
        
        this.dropDownPairs = this.dropDownPairs.filter((pair, i) => i !== index);
        this.filterAndUpdateListingOptions();
        this.filterAndUpdatePropertyOptions();
    }

    handleCheckboxChange() {
       if(this.checkboxValue==false){
        this.checkboxValue = true;
       }else{
        this.checkboxValue = false;
       }
       console.log(this.checkboxValue);
    }



    //Handle the mapping to store in metadata type
    createMappingString() {
        let mappingString = '';
        for (let i = 0; i < this.dropDownPairs.length; i++) {
            const pair = this.dropDownPairs[i];
            if (pair.selectedListing && pair.selectedProperty) {
                mappingString += pair.selectedListing + ':' + pair.selectedProperty + ';';
            }
        }
        mappingString = mappingString.slice(0, -1);
        return mappingString;
    }

    saveMappingsToMetadata() {
        const mappingsData = this.createMappingString();
        const checkboxValue = this.checkboxValue;
        // console.log(mappingsData);
        saveMappings({ mappingsData , checkboxValue})
            .then(result => {
                console.log('Mappings saved successfully:', result);
                this.showToast('Success', 'Mappings saved successfully', 'success');
                // Optionally handle success
            })
            .catch(error => {
                console.error('Error saving mappings:', error);
                this.showToast('Error', 'Error saving mappings', 'error');
                // Optionally handle error
            });
    }

  
    //Conformation modal and the alert
    handleAddPairClick() {
        // Show the confirmation modal when "Add Pair" is clicked
        this.showConfirmationModal = true;
    }

    handleConfirmAddPair() {
        // Handle adding a new pair here
        this.saveMappingsToMetadata();

        // Close the confirmation modal
        this.showConfirmationModal = false;
    }

    closeConfirmationModal() {
        // Close the confirmation modal if canceled
        this.showConfirmationModal = false;
    }

    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(toastEvent);
    }

}