public with sharing class propertyViewController {
    

    @AuraEnabled
    public static List<Property__c> getPropertyInformation(Id recordId){
        try {
            List<Property__c> property = [SELECT Id,Property_Type__c,Amenities__c,Number_of_Bedrooms__c,Number_of_Bathrooms__c,Description__c FROM Property__c WHERE Id = :recordId];
            return property;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static String getIconUrl(String AnmentyName){
        try {
            Feature_Icon__c icon = [SELECT Icon_URL__c FROM Feature_Icon__c WHERE Name = : AnmentyName LIMIT 1];
            return icon.Icon_URL__c;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}