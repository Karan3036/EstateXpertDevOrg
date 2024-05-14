public without sharing class inquiryPropertyView {
    @AuraEnabled
    public static WrapperClass getFavorites(Id ListingId){
        
        try {
            System.debug(ListingId);
            List<Id> listingIds = new List<Id>() ;
            List<Id> contactIds = new List<Id>() ;
            List<Linked_Listing__c> myListing = [SELECT Id,Inquiry__c,Contact__c,Listing__c,Status__c,Inquiry_Date__c,RecordTypeId,Name FROM Linked_Listing__c WHERE Listing__c = : ListingId AND RecordTypeId = '012GA000000C1y1YAC'];
            // [SELECT Id,Property_Type__c,Number_of_Bedrooms__c,Number_of_Bathrooms__c,Description__c FROM Property__c WHERE Id = :recordId];
            for(Linked_Listing__c listt: myListing){
                listingIds.add(listt.Listing__c);
            }

            for(Linked_Listing__c listt: myListing){
                contactIds.add(listt.Contact__c);
            }

            List<Listing__c> listing = [SELECT Id,Property_ID__c,Name FROM Listing__c WHERE Id IN: listingIds ];
            List<Contact> Contacts = [SELECT Id,Email,MobilePhone,Name FROM Contact WHERE Id IN: contactIds ];
           
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
            wc.Contacts = Contacts;
            wc.LinkedListings = myListing;
            return wc;


          
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static string saveInquiry(String LinkedListingId, String Status){
        try {
            Linked_Listing__c myListing = [SELECT Id,Status__c FROM Linked_Listing__c WHERE Id =:LinkedListingId];
            myListing.Status__c = Status;
            update myListing;
            return 'Update Successfully';
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static string deleteInquiry(String LinkedListingId){
        try {
            Linked_Listing__c myListing = [SELECT Id,Status__c FROM Linked_Listing__c WHERE Id =:LinkedListingId];
            delete myListing;
            return 'Update Successfully';
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    public class WrapperClass{
        @AuraEnabled
        public List<Listing__c> Listings;  
        @AuraEnabled
        public List<Contact> Contacts;  
        @AuraEnabled
        public List<Linked_Listing__c> LinkedListings;  
        @AuraEnabled
        public Map<Id, String> Medias;            
    }
}