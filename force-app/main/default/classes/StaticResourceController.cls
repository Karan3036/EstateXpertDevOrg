public class StaticResourceController {
    
    @AuraEnabled(cacheable=true)
    public static String getStaticResourceImageUrl(String resourceName, String recordId) {
        list<Listing__c> listingData = [select id, propertyImage__C from Listing__c];
        
        String imageIdentifier = listingData[0].propertyImage__c+'_' + recordId;
           String imageUrl = '/resource/' + resourceName + '/' + imageIdentifier + '.jpg';
        
        
        return imageUrl;
    }

}