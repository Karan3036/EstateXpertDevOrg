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
            List<Listing__c> listing = [SELECT Id, Name, Listing_Description__c, Property_Photos__c, Area__c, City__c, State__c, Postal_Code__c, Number_of_Bathrooms__c, Number_of_Bedrooms__c, Sq_Ft__c, Property_ID__c,
                                               Listing_Price__c, Listing_Type__c, Featured_Property__c, Availability_Date__c, Property_Features__c FROM Listing__c ORDER BY Name ASC LIMIT 50000];

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
            Exception_Logs.createExceptionRecord(e, 'propertyListedViewController', 'getListingInformation');
            throw new AuraHandledException(e.getMessage());
        }
    }

    public class Wrapper{
        @AuraEnabled
        public List<Listing__c> Listings;  
        @AuraEnabled
        public List<PropertyMedia__c> Medias; 
        @AuraEnabled
        public Map<String, String> FeatureIcons; 
    }

    @AuraEnabled
    public static Wrapper getListingData(Id recordId){
        try {
            List<Listing__c> listing = [SELECT Id, Name,Area__c, City__c, State__c, Street__c, Country__c, Postal_Code__c, Number_of_Bathrooms__c, Number_of_Bedrooms__c, Sq_Ft__c, Property_ID__c,
                                               Listing_Price__c, Listing_Type__c, Featured_Property__c, Property_Features__c, Listing_Description__c FROM Listing__c WHERE Id = :recordId];

            List<Feature_Icon__c> feature_icons = [SELECT Name, Icon_URL__c FROM Feature_Icon__c];

            List<PropertyMedia__c> media = [SELECT Id, Name, FilenameUrlEncoded__c, ExternalLink__c, LayoutOnWebsite__c, Property__c, Image_of__c FROM PropertyMedia__c WHERE Property__c = :listing[0].Property_ID__c];

            Map<String,String> feture_icons_data = new Map<String,String>();
            for(Feature_Icon__c icon : feature_icons){
                feture_icons_data.put(icon.Name,icon.Icon_URL__c);
            }
            Wrapper wr = new Wrapper();
            wr.Listings = listing;
            wr.FeatureIcons = feture_icons_data;
            wr.Medias = media;
            return wr;
        } catch (Exception e) {
            Exception_Logs.createExceptionRecord(e, 'propertyListedViewController', 'getListingInformation');
            throw new AuraHandledException(e.getMessage());
        }
    }
}