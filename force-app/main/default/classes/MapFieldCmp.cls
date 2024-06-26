public with sharing class MapFieldCmp {
        
    //get field data using schema builder
    @AuraEnabled
    public static List<Map<String, String>> getObjectFields(String objectName) {
        List<Map<String, String>> fieldDetails = new List<Map<String, String>>();
    
        // Query Mapping_Metadata__mdt
        Mapping_Metadata__mdt metaData = [SELECT Mapping_String__c, Autometic_Sync__c, BlockedFields__c FROM Mapping_Metadata__mdt LIMIT 1];
    
        Schema.DescribeSObjectResult describeResult = Schema.getGlobalDescribe().get(objectName).getDescribe();
    
        // Get all fields for the object
        Map<String, Schema.SObjectField> allFieldsMap = describeResult.fields.getMap();
        
        // Remove blocked fields
        Set<String> blockedFields = new Set<String>(metaData.BlockedFields__c.split(';'));
        allFieldsMap.keySet().removeAll(blockedFields);
    
        // Get unwritable fields
        Set<String> unwritableFields = new Set<String>();
        for (String fieldName : allFieldsMap.keySet()) {
            if (!allFieldsMap.get(fieldName).getDescribe().isUpdateable()) {
                unwritableFields.add(fieldName);
            }
        }
        allFieldsMap.keySet().removeAll(unwritableFields);
    
        for (Schema.SObjectField field : allFieldsMap.values()) {
            Schema.DescribeFieldResult fieldDescribe = field.getDescribe();
    
            Map<String, String> fieldMap = new Map<String, String>();
            fieldMap.put('label', fieldDescribe.getLabel());
            fieldMap.put('apiName', fieldDescribe.getName());
    
            // Convert data type enum value to string
            String dataType = fieldDescribe.getType().name();
            fieldMap.put('dataType', dataType);
    
            fieldDetails.add(fieldMap);
        }
    
        return fieldDetails;
    }
    
    
    

    //save the mapping in the metadata
    @AuraEnabled
    public static void saveMappings( String mappingsData ,Boolean checkboxValue){
        //fetch records
        List<Mapping_Metadata__mdt> metaList = 
        [Select MasterLabel, DeveloperName, Mapping_String__c From Mapping_Metadata__mdt];
        
        //instance of the record
        Metadata.CustomMetadata mdata = new Metadata.CustomMetadata();
        mdata.fullName = 'Mapping_Metadata__mdt.'+metaList[0].DeveloperName;
        mdata.label = metaList[0].MasterLabel;
        
        //instance of the value
        Metadata.CustomMetadataValue instance = new Metadata.CustomMetadataValue();
        instance.field = 'Mapping_String__c';
        instance.value = mappingsData;
        //adding the value to the record
        mdata.values.add(instance);

        Metadata.CustomMetadataValue instance2 = new Metadata.CustomMetadataValue();
        instance2.field = 'Autometic_Sync__c';
        instance2.value = checkboxValue;
        //adding the value to the record
        mdata.values.add(instance2);
        
        // instance.field = 'Autometic_Sync__c';
        // instance.value = checkboxValue;
        // mdata.values.add(instance);
        
        //instance of the container
        Metadata.DeployContainer container = new Metadata.DeployContainer();
        container.addMetadata(mdata);
        
        //enqueue deployment to the salesforce org
        Metadata.Operations.enqueueDeployment(container, null);
        
     }

     //retrieve string mapping from the metadata
     @AuraEnabled
     public static List<String> getMetadata() {
         List<String> metadataValues = new List<String>();
         
         // Fetch records
         List<Mapping_Metadata__mdt> metadataRecords = [SELECT Mapping_String__c, Autometic_Sync__c FROM Mapping_Metadata__mdt LIMIT 1];
         
         // Check if records exist
         if (!metadataRecords.isEmpty()) {
             Mapping_Metadata__mdt metadataRecord = metadataRecords[0];
             
             // Add field values to the list
             metadataValues.add(metadataRecord.Mapping_String__c);
             metadataValues.add(String.valueOf(metadataRecord.Autometic_Sync__c));
         }
         
         return metadataValues;
     }

     
}