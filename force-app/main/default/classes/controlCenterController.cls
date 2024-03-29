public with sharing class controlCenterController {

    public class FeatureIconWrapper {
        @AuraEnabled
        public String name { get; set; }
        @AuraEnabled
        public Feature_Icon__c iconURL { get; set; }

        public FeatureIconWrapper(String name, Feature_Icon__c iconURL) {
            this.name = name;
            this.iconURL = iconURL;
        }
    }

    @AuraEnabled
    public static List<FeatureIconWrapper> getPicklistValues() {
        List<FeatureIconWrapper> featureIcons = new List<FeatureIconWrapper>();

        Schema.DescribeFieldResult fieldResult = Property__c.Amenities__c.getDescribe();

        List<Schema.PicklistEntry> picklistEntries = fieldResult.getPicklistValues();

        Set<String> picklistValues = new Set<String>();
        for(Schema.PicklistEntry entry : picklistEntries) {
            picklistValues.add(entry.getLabel());
        }

        List<Feature_Icon__c> matchingIcons = [SELECT Name, Icon_URL__c, Icon_Name__c FROM Feature_Icon__c WHERE Name IN :picklistValues ORDER BY Name ASC];

        Map<String, Feature_Icon__c> iconURLs = new Map<String, Feature_Icon__c>();
        for (Feature_Icon__c icon : matchingIcons) {
            iconURLs.put(icon.Name, icon);
        }

        for (String value : picklistValues) {
            if (iconURLs.containsKey(value)) {
                featureIcons.add(new FeatureIconWrapper(value, iconURLs.get(value)));
            } else {
                featureIcons.add(new FeatureIconWrapper(value, null));
            }
        }

        return featureIcons;
    }

    // public class IconWrapper {
    //     @AuraEnabled
    //     public List<StaticResource> staticList { get; set; }
    //     @AuraEnabled
    //     public List<ContentVersion> contentVersion { get; set; }
    // }
    
    public class IconWrapper {
        @AuraEnabled
        public Id id { get; set; }
        @AuraEnabled
        public String name { get; set; }
        @AuraEnabled
        public String iconURL { get; set; }
    }

    @AuraEnabled
    public static List<IconWrapper> getIcons(){
        List<IconWrapper> iconList = new List<IconWrapper>();
        try {
            List<StaticResource> staticResources = [SELECT Id, Name, Description FROM StaticResource WHERE Description = 'featureicon' ORDER BY Name ASC];
            List<ContentVersion> contentVersions = [SELECT Id, Title, VersionDataUrl, ExternalDocumentInfo1 FROM ContentVersion WHERE ExternalDocumentInfo1 = 'featureicon'];
            
            // Add static resources to the wrapper
            for (StaticResource sr : staticResources) {
                IconWrapper wrapper = new IconWrapper();
                wrapper.id = sr.Id;
                wrapper.name = sr.Name;
                wrapper.iconURL = '/resource/' + sr.Name;
                iconList.add(wrapper);
            }
            
            // Add content versions to the wrapper
            for (ContentVersion cv : contentVersions) {
                IconWrapper wrapper = new IconWrapper();
                wrapper.id = cv.Id;
                wrapper.name = cv.Title;
                wrapper.iconURL = cv.VersionDataUrl;
                iconList.add(wrapper);
            }
        } catch (Exception e) {
            System.debug('Error in getIcons method: ' + e.getMessage());
        }
        return iconList;
    }

    @AuraEnabled
    public static String updateFeatureIconRecord(String FeatureIconName, String IconName, String IconUrl){
        try {
            List<Feature_Icon__c> matchingIcons = [SELECT Name, Icon_URL__c, Icon_Name__c FROM Feature_Icon__c WHERE Name =: FeatureIconName];
            if (!matchingIcons.isEmpty()) {
                for (Feature_Icon__c iconToUpdate : matchingIcons) {
                    iconToUpdate.Icon_URL__c = IconUrl;
                    iconToUpdate.Icon_Name__c = IconName;
                }
                update matchingIcons;
            } else {
                Feature_Icon__c newIcon = new Feature_Icon__c();
                newIcon.Name = FeatureIconName;
                newIcon.Icon_Name__c = IconName;
                newIcon.Icon_URL__c = IconUrl;
                insert newIcon;
            }
            
            return 'Success';
        } catch (Exception e) {
            System.debug('message --> '+ e.getMessage());
            return 'Error';
        }
    }

    @AuraEnabled
    public static responseWrapper uploadFile(String base64, String filename){
        responseWrapper returnValue = new responseWrapper();
        try {

            ContentVersion conVer = new ContentVersion();
            conVer.PathOnClient = filename;
            conVer.Title = filename.removeEnd('.png');
            conVer.VersionData = EncodingUtil.base64Decode(base64);
            conVer.ExternalDocumentInfo1 = 'featureicon';
            insert conVer;

            returnValue.state = 'Success';
            returnValue.returnMessage = 'Icon uploaded successfully!!!';
        } catch (Exception e) {
            returnValue.state = 'Error';
            returnValue.returnMessage = e.getMessage();
        }
        return returnValue;
    }

    public class responseWrapper{
        @AuraEnabled Public string state;
        @AuraEnabled Public string returnMessage;
    }

}