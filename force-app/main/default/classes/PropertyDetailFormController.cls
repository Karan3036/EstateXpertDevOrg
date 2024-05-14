public with sharing class PropertyDetailFormController {
    @AuraEnabled(cacheable=true)
    public static List<String> getPicklistValues(String fieldName) {
        List<String> picklistValues = new List<String>();
        
        try {
            // Fetch picklist values dynamically
            Schema.DescribeFieldResult fieldResult = Property__c.getSObjectType().getDescribe().fields.getMap().get(fieldName).getDescribe();
            if (fieldResult.getType() == Schema.DisplayType.Picklist) {
                List<Schema.PicklistEntry> picklistEntries = fieldResult.getPicklistValues();
                for (Schema.PicklistEntry entry : picklistEntries) {
                    picklistValues.add(entry.getValue());
                }
            }
        } catch (Exception e) {
            System.debug('Error fetching picklist values for ' + fieldName + ': ' + e.getMessage());
        }
        
        return picklistValues;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Map<String, String>> readFieldSet(String fieldSetName, String ObjectName){
        List<Map<String, String>> fieldDetails = new List<Map<String, String>>();
        
        try {
            Map<String, Schema.SObjectType> globalDescribeMap = Schema.getGlobalDescribe(); 
            Schema.SObjectType sObjectTypeObj = globalDescribeMap.get(ObjectName);
            Schema.DescribeSObjectResult describeSObjectResultObj = sObjectTypeObj.getDescribe();
        
            Schema.FieldSet fieldSetObj = describeSObjectResultObj.FieldSets.getMap().get(fieldSetName);
            System.debug('fieldSetObj ==> ' + fieldSetObj);
        
            for(Schema.FieldSetMember field : fieldSetObj.getFields()) {
                Map<String, String> fieldDetail = new Map<String, String>();
                fieldDetail.put('FieldName', field.getLabel());
                fieldDetail.put('FieldType', field.getType().toString());
                if (field.getType() == Schema.DisplayType.Picklist) {
                    Schema.DescribeFieldResult fieldDescription = describeSObjectResultObj.fields.getMap().get(field.getFieldPath()).getDescribe();
                        List<Schema.PicklistEntry> picklistEntries = fieldDescription.getPicklistValues();
                        List<String> picklistValues = new List<String>();
                        for(Schema.PicklistEntry entry : picklistEntries) {
                            picklistValues.add(entry.getValue());
                        }
                    fieldDetail.put('PicklistValues', String.join(picklistValues, ';'));
                }
                
                else if(field.getType() == Schema.DisplayType.Boolean){
                    fieldDetail.put('BooleanValues', 'Yes;No');
                }
                fieldDetails.add(fieldDetail);
            }
            
            System.debug('fieldDetails ==> ' + fieldDetails);
        } catch (Exception e) {
            System.debug('Error fetching field set ' + fieldSetName + ' for object ' + ObjectName + ': ' + e.getMessage());
            throw new AuraHandledException('Error fetching field set ' + fieldSetName + ' for object ' + ObjectName + ': ' + e.getMessage());
        }
        
        return fieldDetails; 
    }     

    @AuraEnabled(cacheable=true)
    public static List<Map<String, String>> getCustomMetadataRecords() {
        List<Map<String, String>> metadataRecords = new List<Map<String, String>>();
        
        try {
            List<Property_Detail_form__mdt> metadataRecordsDB = [SELECT DeveloperName,MasterLabel, Tags__c FROM Property_Detail_form__mdt];
            
            for (Property_Detail_form__mdt record : metadataRecordsDB) {
                Map<String, String> fieldDetail = new Map<String, String>();
                fieldDetail.put('MasterLabel', record.MasterLabel);
                fieldDetail.put('tags', record.Tags__c);
                metadataRecords.add(fieldDetail);
            }
            
            System.debug('metadataRecords ==> ' + metadataRecords);
        } catch (Exception e) {
            System.debug('Error fetching custom metadata records: ' + e.getMessage());
            throw new AuraHandledException('Error fetching custom metadata records: ' + e.getMessage());
        }
        
        return metadataRecords; 
    }

    @AuraEnabled
    public static String saveProperty(String propertyDetails) {
        try {
            Map<String, Object> propertyMap = (Map<String, Object>) JSON.deserializeUntyped(propertyDetails);
            
            Property__c newProperty = new Property__c();
            newProperty.Property_Type__c = String.valueOf(propertyMap.get('selectedPropertyType'));
            newProperty.City__c = String.valueOf(propertyMap.get('cityValue'));
            newProperty.Locality__c = String.valueOf(propertyMap.get('localityValue'));
            newProperty.Bedrooms__c = propertyMap.get('bedroomValue') != null ? Integer.valueOf(String.valueOf(propertyMap.get('bedroomValue'))) : 0;
            newProperty.Bathrooms__c = propertyMap.get('bathroomValue') != null ? Integer.valueOf(String.valueOf(propertyMap.get('bathroomValue'))) : 0;
            newProperty.Balconies__c = propertyMap.get('balconyValue') != null ? Integer.valueOf(String.valueOf(propertyMap.get('balconyValue'))) : 0;
            newProperty.Floor_No__c = String.valueOf(propertyMap.get('selectedFloorNumber'));
            newProperty.Total_Floors__c = String.valueOf(propertyMap.get('selectedTotalFloors'));
            newProperty.Furnished_Status__c = String.valueOf(propertyMap.get('selectedFurnishedStatus'));
            newProperty.Covered_Area__c = propertyMap.get('coveredArea') != null ? Integer.valueOf(String.valueOf(propertyMap.get('coveredArea'))) : 0;
            newProperty.Carpet_Area__c = propertyMap.get('carpetArea') != null ? Integer.valueOf(String.valueOf(propertyMap.get('carpetArea'))) : 0;
            newProperty.Transaction_Type__c = String.valueOf(propertyMap.get('selectedTransactionType'));
            newProperty.Possession_Status__c = String.valueOf(propertyMap.get('selectedPossessionStatus'));
            newProperty.Month__c = String.valueOf(propertyMap.get('selectedMonth'));
            newProperty.Year__c = String.valueOf(propertyMap.get('selectedYear'));
            newProperty.Expected_Price__c = propertyMap.get('expectedPrice') != null ? Integer.valueOf(String.valueOf(propertyMap.get('expectedPrice'))) : 0;
            newProperty.Price_Per_Sq_ft__c = propertyMap.get('pricepersqft') != null ? Integer.valueOf(String.valueOf(propertyMap.get('pricepersqft'))) : 0;
            newProperty.Booking_Amount__c = propertyMap.get('bookingAmount') != null ? Integer.valueOf(String.valueOf(propertyMap.get('bookingAmount'))) : 0;
            newProperty.Maintenance_Charges__c = propertyMap.get('maintenanceCharges') != null ? Integer.valueOf(String.valueOf(propertyMap.get('maintenanceCharges'))) : 0;
            // newProperty.Name = 'Test From Community';
            newProperty.Name = String.valueOf(propertyMap.get('cityValue')) + String.valueOf(propertyMap.get('localityValue'));
            
            
            Map<String, Object> dynamicValues = (Map<String, Object>) propertyMap.get('dynamicValues');
            for (String key : dynamicValues.keySet()) {
                if (dynamicValues.get(key) != null || dynamicValues.get(key) != '') {
                    String apiName = getMyAPIName('Property__c' , key);
                    newProperty.put(apiName, dynamicValues.get(key));
                    System.debug('Key ==> ' + key);
                    System.debug('Value ==> ' + dynamicValues.get(key));
                }
            }
            
            insert newProperty;

            return newProperty.Id;
        } catch (Exception e) {
            // throw new AuraHandledException('Error saving property: ' + e.getMessage());
            System.debug('Error ==> ' + e);
            System.debug('Line Number ==> ' + e.getlinenumber());
            return null;
        }
    }

    public static String getMyAPIName(String objectName, String fieldLabel ) {
    
        SObjectType type = Schema.getGlobalDescribe().get(objectName);
        Map<String,Schema.SObjectField> mfields = type.getDescribe().fields.getMap();
        
        for(String strField : mfields.keySet())
        {
            SObjectField fl = mfields.get(strField);
            if(fieldLabel == fl.getDescribe().getlabel())
            {
                return strField;
            }
        }
        
        return '';
    }


}