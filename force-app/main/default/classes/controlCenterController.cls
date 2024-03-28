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

    @AuraEnabled
    public static List<StaticResource> getIcons(){
        try {
            List<StaticResource> staticResource = [SELECT Id, Name, Description FROM StaticResource WHERE Description = 'featureicon' ORDER BY Name ASC];
            
            if (!staticResource.isEmpty()) {
                return staticResource;
            } else {
                return null;
            }
        } catch (Exception e) {
            System.debug('message --> '+ e.getMessage());
            return null;
        }
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
    public static void uploadFile(String base64, String filename){
        try {
            MetadataService.MetadataPort service = createService();     
            MetadataService.StaticResource staticResource = new MetadataService.StaticResource();
            staticResource.fullName = filename;
            staticResource.contentType = 'image/png';
            staticResource.cacheControl = 'public';
            staticResource.content = base64;
            MetadataService.AsyncResult[] results = service.create(new List<MetadataService.Metadata> { staticResource });
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    private static MetadataService.MetadataPort createService()
	{ 
		MetadataService.MetadataPort service = new MetadataService.MetadataPort();
		service.SessionHeader = new MetadataService.SessionHeader_element();
		service.SessionHeader.sessionId = UserInfo.getSessionId();
		return service;	
	}
}
