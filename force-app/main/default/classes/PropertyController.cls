public with sharing class PropertyController {
    @AuraEnabled(cacheable=false)
    public static Id createContactAndProperty(String brokerFirstName, String brokerLastName, String brokerEmail, String brokerPhone, String propertyLandmark, String propertyStreet, String propertyCity, String propertyState, String propertyCountry, String propertyType, String propertyDescription) {
        Contact newContact = new Contact(
            FirstName = brokerFirstName,
            LastName = brokerLastName,
            Email = brokerEmail,
            Phone = brokerPhone
        );
        insert newContact;
        
        Property__c newProperty = new Property__c(
            Property_Broker__c = newContact.Id,
            Landmark__c = propertyLandmark,
            Street__c = propertyStreet,
            City__c = propertyCity,
            State__c = propertyState,
            Country__c = propertyCountry,
            Property_Type__c = propertyType,
            Description__c = propertyDescription
        );
        insert newProperty;
        return  newProperty.Id;
    }

    @AuraEnabled
    public static Boolean createmediaforlisting(String Name, Decimal Size, String recordId, String externalUrl){
        PropertyMedia__c Media = new PropertyMedia__c();
        Media.FilenameUrlEncoded__c = externalUrl;
        Media.ExternalLink__c = externalUrl;
        Media.Name = Name;
        Media.Size__c = Size;
        Media.Property__c = recordId;
        insert Media;
        return true;
    }

    @AuraEnabled (cacheable=true)
    public static AWS_Config__c getS3ConfigSettings(){
        return AWS_Config__c.getOrgDefaults();
    }
}