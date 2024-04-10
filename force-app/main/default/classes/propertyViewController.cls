public with sharing class propertyViewController {
    
    public class WrapperClass{
        @AuraEnabled
        public List<Property__c> Properties;  
        @AuraEnabled
        public List<PropertyMedia__c> PropertyMedias; 
        @AuraEnabled
        public Map<String, String> icons;            
    }


    @AuraEnabled
    public static WrapperClass getPropertyInformation(Id recordId){
        try {
            List<Property__c> property = [SELECT Id,Name,Listing_Price__c,Street__c,City__c,State__c,Postal_Code__c,Property_Type__c,Amenities__c,Number_of_Bedrooms__c,Number_of_Bathrooms__c,Description__c FROM Property__c WHERE Id = :recordId];

            List<Feature_Icon__c> feature_icons = [SELECT Name,Icon_URL__c FROM Feature_Icon__c];

            List<PropertyMedia__c> media = [SELECT Id,FilenameUrlEncoded__c,ExternalLink__c,LayoutOnWebsite__c,Property__c FROM PropertyMedia__c WHERE Property__c = :property[0].Id];

            Map<String,String> feture_icons_data = new Map<String,String>();
            for(Feature_Icon__c icon : feature_icons){
                feture_icons_data.put(icon.Name,icon.Icon_URL__c);
            }
            WrapperClass wc = new WrapperClass();
            wc.Properties = property;
            wc.icons = feture_icons_data;
            wc.PropertyMedias = media;
            return wc;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }


// Below given method is used to show data in community site
    
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
            List<Listing__c> listing = [SELECT Id,Name,Area__c,City__c,State__c,Postal_Code__c,Number_of_Bathrooms__c,Number_of_Bedrooms__c,Sq_Ft__c,Property_ID__c,
                                               Listing_Price__c,Listing_Type__c,Featured_Property__c,Property_Features__c,Listing_Description__c FROM Listing__c WHERE Id = :recordId];

            List<Feature_Icon__c> feature_icons = [SELECT Name,Icon_URL__c FROM Feature_Icon__c];

            List<PropertyMedia__c> media = [SELECT Id,FilenameUrlEncoded__c,ExternalLink__c,LayoutOnWebsite__c,Property__c FROM PropertyMedia__c WHERE Property__c = :listing[0].Property_ID__c];

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
            throw new AuraHandledException(e.getMessage());
        }
    }
}