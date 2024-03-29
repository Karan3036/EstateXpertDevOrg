public with sharing class MapFieldCmp implements Metadata.DeployCallback {

    @AuraEnabled
    public static String storeCustomSettings(String listingRecordId) {
        Listing__c listing = [SELECT City__c, Property_ID__c,Listing_Description__c, Listing_Price__c, Name ,List_Date__c, Number_Of_Bathrooms__c, Number_Of_Floors__c, Year_Built__c FROM Listing__c WHERE Id =: listingRecordId LIMIT 1];
        String PropertyId = createPropertyFromMetadata(listing.City__c, listing.Listing_Description__c, listing.Name);
        listing.Property_ID__c = PropertyId;
        update listing;
        // Asynchronously call method to create custom metadata
        createUpdateMetadataAsync('Map_Listing_Property.' + listingRecordId, listingRecordId, listing.City__c, listing.Listing_Description__c, listing.Listing_Price__c, listing.Name);
        
        return 'Successfully initiated metadata creation';
    }

    @future
    public static void createUpdateMetadataAsync(String fullName, String label, String city, String description, Decimal price, String title) {
        Metadata.CustomMetadata customMetadata = new Metadata.CustomMetadata();
        customMetadata.fullName = fullName;
        customMetadata.label = label;

        // Add individual fields to the custom metadata
        Metadata.CustomMetadataValue cityValue = new Metadata.CustomMetadataValue();
        cityValue.field = 'City__c';
        cityValue.value = city;
        customMetadata.values.add(cityValue);

        Metadata.CustomMetadataValue descriptionValue = new Metadata.CustomMetadataValue();
        descriptionValue.field = 'Listing_Description__c';
        descriptionValue.value = description;
        customMetadata.values.add(descriptionValue);

        Metadata.CustomMetadataValue priceValue = new Metadata.CustomMetadataValue();
        priceValue.field = 'Listing_Price__c';
        priceValue.value = String.valueOf(price);
        customMetadata.values.add(priceValue);

        Metadata.CustomMetadataValue titleValue = new Metadata.CustomMetadataValue();
        titleValue.field = 'Listing_Title__c';
        titleValue.value = title;
        customMetadata.values.add(titleValue);

        Metadata.DeployContainer mdContainer = new Metadata.DeployContainer();
        mdContainer.addMetadata(customMetadata);

        Id jobId = Metadata.Operations.enqueueDeployment(mdContainer, new MapFieldCmp());
        
        
    }

    public void handleResult(Metadata.DeployResult result, Metadata.DeployCallbackContext context) {
        if (result.status == Metadata.DeployStatus.Succeeded) {
            System.debug(' success : '+ result);
        } else {
            System.debug(' fail : '+ result);
        }
    }

    // Method to create Property record using custom metadata values
    public static String createPropertyFromMetadata(String city, String description, String name) {
        Property__c property = new Property__c();
        property.City__c = city;
        property.Description__c = description;
        property.Name = name;

        insert property;
        return property.Id;
    }
}