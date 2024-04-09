public with sharing class imagesAndMediaController {

    @AuraEnabled
    public static list<PropertyMedia__c> fetchdata(String recordId){
        List<PropertyMedia__c> result = [SELECT Id, FilenameUrlEncoded__c, Tags__c, Name, Filename__c, Size__c, ExternalLink__c, Property__c, IsOnPortalFeed__c, IsOnWebsite__c, IsOnExpose__c, SortOnExpose__c, SortOnPortalFeed__c, SortOnWebsite__c FROM PropertyMedia__c WHERE Property__c = :recordId ORDER BY Name ASC];
        return result;
    }

    @AuraEnabled
    public static Boolean createMedia(String Name, Decimal Size, String recordId, String externalUrl){
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
    public static Boolean createMediaForAWS(String Name, Decimal Size, String recordId, String externalUrl){
        PropertyMedia__c Media = new PropertyMedia__c();
        Media.FilenameUrlEncoded__c = externalUrl;
        Media.ExternalLink__c = externalUrl;
        Media.Name = Name;
        Media.Filename__c = Name;
        Media.Size__c = Size;
        Media.Property__c = recordId;
        insert Media;
        return true;
    }

    @AuraEnabled
    public static Boolean update_media_name(String id,String fileName,List<String> picklistValues){
        
        List<PropertyMedia__c> result = [SELECT Id, Name,FilenameUrlEncoded__c,Tags__c, Size__c FROM PropertyMedia__c WHERE Id = :id LIMIT 1];

        result[0].Name = fileName;
        if(picklistValues.size() >= 0){
            result[0].Tags__c = String.join(picklistValues, ';');
        }
        update result; 

        return true;
    }

    @AuraEnabled (cacheable=true)
    public static AWS_Config__c getS3ConfigSettings(){
        return AWS_Config__c.getOrgDefaults();
    }

    @AuraEnabled
    public static list<PropertyMedia__c> fetchdataforlisting(String recordId){
        List<PropertyMedia__c> result = [SELECT Id, FilenameUrlEncoded__c,Tags__c, Name,ExternalLink__c, Size__c, Property__c,IsOnPortalFeed__c,	IsOnWebsite__c,IsOnExpose__c, SortOnExpose__c, SortOnPortalFeed__c, SortOnWebsite__c FROM PropertyMedia__c WHERE Property__c = :recordId];
        return result;
    }

    @AuraEnabled
    public static Boolean deletelistingmedia(String id,String property_id){
        if(id !=null){
        List<PropertyMedia__c> result = [SELECT Id, FilenameUrlEncoded__c,IsOnExpose__c, Name, Size__c, Property__c FROM PropertyMedia__c WHERE Id = :id LIMIT 1];
        delete result;
        }
        if(property_id !=null){
            List<PropertyMedia__c> all_media = [SELECT Id, FilenameUrlEncoded__c, Name, Size__c, Property__c FROM PropertyMedia__c WHERE Property__c = :property_id ];
            delete all_media;
        }
        return true;
    }

    @AuraEnabled
    public static Boolean updateSortOrder(List<PropertyMedia__c> mediaList){
        if(mediaList.size() > 0){ 
            update mediaList;
        }
        return true;
    }

    @AuraEnabled
    public static Boolean updateOrderState(List<Id> expose_ids, List<Id> website_ids, List<Id> portal_ids, List<Id> expose_ids_false, List<Id> website_ids_false, List<Id> portal_ids_false){
        if(expose_ids !=null){
            List<propertyMedia__c> exposed_mediaList = [SELECT Id,Name,IsOnPortalFeed__c,IsOnWebsite__c,IsOnExpose__c FROM PropertyMedia__c WHERE Id IN : expose_ids];
            List<propertyMedia__c> exposed_mediaList_to_update = new List<propertyMedia__c>();
            if(exposed_mediaList.size()>0){
                for(propertyMedia__c prop_e :exposed_mediaList ){
                    prop_e.IsOnExpose__c = true;
                    exposed_mediaList_to_update.add(prop_e);
                }
                update exposed_mediaList_to_update;    
            }
        }

        if(website_ids !=null){
            List<propertyMedia__c> website_mediaList = [SELECT Id,Name,IsOnPortalFeed__c,IsOnWebsite__c,IsOnExpose__c FROM PropertyMedia__c WHERE Id IN : website_ids];
            List<propertyMedia__c> website_mediaList_to_update = new List<propertyMedia__c>();
            if(website_mediaList.size()>0){
                for(propertyMedia__c prop_w :website_mediaList ){
                    prop_w.IsOnWebsite__c = true;
                    website_mediaList_to_update.add(prop_w);
                }
                update website_mediaList_to_update;    
            }
        }

        if(portal_ids !=null){
            List<propertyMedia__c> portal_mediaList = [SELECT Id,Name,IsOnPortalFeed__c,IsOnWebsite__c,IsOnExpose__c FROM PropertyMedia__c WHERE Id IN : portal_ids];
            List<propertyMedia__c> portal_mediaList_to_update = new List<propertyMedia__c>();
            if(portal_mediaList.size()>0){
                for(propertyMedia__c prop_p :portal_mediaList ){
                    prop_p.IsOnPortalFeed__c = true;
                    portal_mediaList_to_update.add(prop_p);
                }
                update portal_mediaList_to_update;    
            }
        }

        if(expose_ids_false !=null){
            List<propertyMedia__c> exposed_mediaList_false = [SELECT Id,Name,IsOnPortalFeed__c,IsOnWebsite__c,IsOnExpose__c FROM PropertyMedia__c WHERE Id IN : expose_ids_false];
            List<propertyMedia__c> exposed_mediaList_to_update_false = new List<propertyMedia__c>();
            if(exposed_mediaList_false.size()>0){
                for(propertyMedia__c prop_e_f :exposed_mediaList_false ){
                    prop_e_f.IsOnExpose__c = false;
                    exposed_mediaList_to_update_false.add(prop_e_f);
                }
                update exposed_mediaList_to_update_false;    
            }
        }

        if(website_ids_false !=null){
            List<propertyMedia__c> website_mediaList_false = [SELECT Id,Name,IsOnPortalFeed__c,IsOnWebsite__c,IsOnExpose__c FROM PropertyMedia__c WHERE Id IN : website_ids_false];
            List<propertyMedia__c> website_mediaList_to_update_false = new List<propertyMedia__c>();
            if(website_mediaList_false.size()>0){
                for(propertyMedia__c prop_w_f :website_mediaList_false ){
                    prop_w_f.IsOnWebsite__c = false;
                    website_mediaList_to_update_false.add(prop_w_f);
                }
                update website_mediaList_to_update_false;    
            }
        }

        if(portal_ids_false !=null){
            List<propertyMedia__c> portal_mediaList_false = [SELECT Id,Name,IsOnPortalFeed__c,IsOnWebsite__c,IsOnExpose__c FROM PropertyMedia__c WHERE Id IN : portal_ids_false];
            List<propertyMedia__c> portal_mediaList_to_update_false = new List<propertyMedia__c>();
            if(portal_mediaList_false.size()>0){
                for(propertyMedia__c prop_p_f :portal_mediaList_false ){
                    prop_p_f.IsOnPortalFeed__c = false;
                    portal_mediaList_to_update_false.add(prop_p_f);
                }
                update portal_mediaList_to_update_false;    
            }
        }
        return true;
    }
    
}