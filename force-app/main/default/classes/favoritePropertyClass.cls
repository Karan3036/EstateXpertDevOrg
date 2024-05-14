public with sharing class favoritePropertyClass {
    @AuraEnabled
    public static WrapperClass getFavorites(Id ContactId){
        
        try {
            System.debug('debug'+ContactId);
            List<Id> listingIds = new List<Id>() ;
            List<Linked_Listing__c> myListing = [SELECT Id,Inquiry__c,Contact__c,Listing__c,RecordTypeId,Name FROM Linked_Listing__c WHERE Contact__c = : ContactId AND RecordTypeId = '012GA000000C1xwYAC'];
            // [SELECT Id,Property_Type__c,Number_of_Bedrooms__c,Number_of_Bathrooms__c,Description__c FROM Property__c WHERE Id = :recordId];
            for(Linked_Listing__c listt: myListing){
                listingIds.add(listt.Listing__c);
            }
            List<Listing__c> listing = [SELECT Id,Property_ID__c,Name, Listing_Description__c, Property_Photos__c, Area__c, City__c, State__c, Postal_Code__c, Number_of_Bathrooms__c, Number_of_Bedrooms__c, Sq_Ft__c FROM Listing__c WHERE Id IN: listingIds ];
            Set<Id> propertyIds = new Set<Id>();     

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

    public class WrapperClass{
        @AuraEnabled
        public List<Listing__c> Listings;  
        @AuraEnabled
        public Map<Id, String> Medias;            
    }


    @AuraEnabled
    public static void removeLike(String ContactId, String ListingId){
        try {
            List<Linked_Listing__c> link = [SELECT Id FROM Linked_Listing__c WHERE Contact__c=:ContactId AND Listing__c=:ListingId];
            System.debug(link);
            delete link;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}