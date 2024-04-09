public with sharing class CreateListingByProperty {
    @AuraEnabled()
    public static void createListingRecord(String recordId) {
        try {
            System.debug(recordId);
            
            // Retrieve field mappings from custom metadata type
            Mapping_Metadata__mdt metaData = [SELECT Mapping_String__c, Autometic_Sync__c, BlockedFields__c FROM Mapping_Metadata__mdt LIMIT 1];
            
            Property__c propertyRecord;
            // Fetch Property fields dynamically
            Map<String, Schema.SObjectField> propertyFieldsMap = Schema.SObjectType.Property__c.fields.getMap();
            // Construct dynamic SOQL query to retrieve Property record
            String query = 'SELECT ';
            for (String fieldName : propertyFieldsMap.keySet()) {
                query += fieldName + ', ';
            }
            query = query.removeEnd(', ') + ' FROM Property__c WHERE Id = :recordId LIMIT 1';
            
            // Execute dynamic SOQL query to retrieve Property record
            try {
                propertyRecord = (Property__c) Database.query(query);
                System.debug('Property record retrieved successfully: ' + propertyRecord);
            } catch (QueryException e) {
                System.debug('Error retrieving Property record: ' + e.getMessage());
                return; // Exit method if property record retrieval fails
            }
            
            if(metaData.Autometic_Sync__c == false && metaData.Autometic_Sync__c != null){
                // Create a new Listing record
                Listing__c newListing = new Listing__c();
                
                // Populate Listing fields using field mappings
                for (String listingField : metaData.Mapping_String__c.split(';')) {
                    String[] parts = listingField.split(':');
                    if (parts.size() == 2) {
                        String propertyField = parts[1];
                        // Check if the Property field exists
                        if (propertyFieldsMap.containsKey(propertyField)) {
                            // Use describe information to dynamically set field values
                            Schema.DescribeFieldResult propertyFieldDescribe = propertyFieldsMap.get(propertyField).getDescribe();
                            if (propertyFieldDescribe.isCreateable() && propertyFieldDescribe.isAccessible()) {
                                Object propertyValue = propertyRecord.get(propertyField);
                                System.debug('Setting ' + parts[0] + ' field with value: ' + propertyValue);
                                newListing.put(parts[0], propertyValue);
                            }
                        }
                    }
                }
                // Set the related Property lookup field on the new Listing record
                newListing.Property_Id__c = recordId;
                System.debug('New Listing record created: ' + newListing);
                // Insert the new Listing record
                try {
                    insert newListing;
                    System.debug('New Listing record inserted successfully');
                } catch (DmlException e) {
                    System.debug('Error inserting new Listing record: ' + e.getMessage());
                }
            } else {
                // Get all fields for Listing__c
                Map<String, Schema.SObjectField> listingFieldsMap = Schema.SObjectType.Listing__c.fields.getMap();
                Set<String> listingFields = listingFieldsMap.keySet();
                
                // Get all fields for Property__c
                Set<String> propertyFields = propertyFieldsMap.keySet();
                
                // Remove audit fields from both sets
                Set<String> auditFields = new Set<String>(metaData.BlockedFields__c.split(';'));
                for (String auditField : auditFields) {
                    if (listingFields.contains(auditField)) {
                        listingFields.remove(auditField);
                    }
                    if (propertyFields.contains(auditField)) {
                        propertyFields.remove(auditField);
                    }
                }
                
                // Get unwritable fields for Listing__c
                Set<String> unwritableFieldsForListing = new Set<String>();
                for (String fieldName : listingFields) {
                    if (!listingFieldsMap.get(fieldName).getDescribe().isUpdateable()) {
                        unwritableFieldsForListing.add(fieldName);
                    }
                }
                listingFields.removeAll(unwritableFieldsForListing);
                
                // Get unwritable fields for Property__c
                Set<String> unwritableFieldsForProperty = new Set<String>();
                for (String fieldName : propertyFields) {
                    if (!propertyFieldsMap.get(fieldName).getDescribe().isUpdateable()) {
                        unwritableFieldsForProperty.add(fieldName);
                    }
                }
                propertyFields.removeAll(unwritableFieldsForProperty);
                
                // Find the intersection of fields in both objects
                Set<String> matchingFields = new Set<String>(listingFields);
                matchingFields.retainAll(propertyFields);
                
                // Create a new Listing record
                Listing__c newListing = new Listing__c();
                
                // Populate Listing fields using matching fields
                for (String field : matchingFields) {
                    if(field != 'RecordTypeId'){
                        Object propertyValue = propertyRecord.get(field);
                        newListing.put(field, propertyValue);
                    }
                }
                
                // Set the related Property lookup field on the new Listing record
                newListing.Property_Id__c = recordId;
                System.debug('New Listing record created: ' + newListing);
                
                // Insert the new Listing record
                try {
                    insert newListing;
                    System.debug('New Listing record inserted successfully');
                } catch (DmlException e) {
                    System.debug('Error inserting new Listing record: ' + e.getMessage());
                }
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}