public with sharing class propertyListedViewController {

    public class WrapperClass{
        @AuraEnabled
        public List<Listing__c> Listings;  
        @AuraEnabled
        public Map<Id, String> Medias;            
    }

    @AuraEnabled
    public static WrapperClass getListingInformation(){
        try {
            List<Listing__c> listing = [SELECT Id,Name,Property_Photos__c,Area__c,City__c,State__c,Postal_Code__c,Number_of_Bathrooms__c,Number_of_Bedrooms__c,Sq_Ft__c,Property_ID__c,
                                               Listing_Price__c,Listing_Type__c,Featured_Property__c FROM Listing__c];

            List<Id> propertyIds = new List<Id>();                                   
            for(Listing__c listing_rec :listing) {
                propertyIds.add(listing_rec.Property_ID__c);
            }      

            List<PropertyMedia__c> medias = [SELECT Id,FilenameUrlEncoded__c,Property__c FROM PropertyMedia__c WHERE Property__c IN:propertyIds];

            Map<Id, String> propertyMediaUrlsMap = new Map<Id, String>();
            for (PropertyMedia__c media : medias) {
                    propertyMediaUrlsMap.put(media.Property__c,media.FilenameUrlEncoded__c);
            }

            WrapperClass wc = new WrapperClass();
            wc.Listings = listing;
            wc.Medias = propertyMediaUrlsMap;            
            return wc;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}