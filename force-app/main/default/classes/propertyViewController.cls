public with sharing class propertyViewController {
    
    public class WrapperClass{
        @AuraEnabled
        public List<Property__c> Properties;  
        @AuraEnabled
        public Map<String, String> icons;            
    }

    @AuraEnabled
    public static WrapperClass getPropertyInformation(Id recordId){
        try {
            List<Property__c> property = [SELECT Id,Property_Type__c,Amenities__c,Number_of_Bedrooms__c,Number_of_Bathrooms__c,Description__c FROM Property__c WHERE Id = :recordId];

            List<Feature_Icon__c> feature_icons = [SELECT Name,Icon_URL__c FROM Feature_Icon__c];

            Map<String,String> feture_icons_data = new Map<String,String>();
            for(Feature_Icon__c icon : feature_icons){
                feture_icons_data.put(icon.Name,icon.Icon_URL__c);
            }
            WrapperClass wc = new WrapperClass();
            wc.Properties = property;
            wc.icons = feture_icons_data;
            return wc;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}