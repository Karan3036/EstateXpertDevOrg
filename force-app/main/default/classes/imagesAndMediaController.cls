public with sharing class imagesAndMediaController {

    @AuraEnabled
    public static Listing__c getListingRecord(String recordId) {
        try {
            return [SELECT Id, Property_ID__c FROM Listing__c WHERE Id = :recordId LIMIT 1];
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching listing record: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static Boolean createmedia(String Name, Decimal Size, String recordId, String externalUrl, String external_link ){
        PropertyMedia__c Media = new PropertyMedia__c();
        Media.FilenameUrlEncoded__c = externalUrl;
        Media.Name = Name;
        Media.Size__c = Size;
        Media.Property__c = recordId;
        Media.ExternalLink__c = external_link;
        insert Media;
        return true;
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

    @AuraEnabled
    public static Boolean update_media_name(String id,String fileName, String url,List<String> picklistValues, String externalUrl, Decimal Size){
        System.debug('id in update==>'+id);
        List<PropertyMedia__c> result = [SELECT Id, Name,FilenameUrlEncoded__c,Tags__c, Size__c FROM PropertyMedia__c WHERE Id = :id LIMIT 1];
        System.debug('external url==>'+externalUrl);
        System.debug('aws url==>'+url);
        System.debug('size of the image before==>'+Size);
        result[0].Name = fileName;
        System.debug('size of image after==>'+Size);

        if (Size != null) {
            result[0].FilenameUrlEncoded__c = url;
        }

        if(picklistValues.size() >= 0){
            result[0].Tags__c = String.join(picklistValues, ';');
        }
        update result; 
        System.debug('result of the update media name==>'+result);
        return true;
    }

    @AuraEnabled (cacheable=true)
    public static AWS_Config__c getS3ConfigSettings(){
        return AWS_Config__c.getOrgDefaults();
    }
    
}