trigger CreatePropertyByListing on Listing__c (after insert, after update) {
    if (Trigger.isInsert) {
        try {
            Mapping_Metadata__mdt metaData = [SELECT Mapping_String__c, Autometic_Sync__c, BlockedFields__c FROM Mapping_Metadata__mdt LIMIT 1];
            
            String[] mappingPairs = metaData.Mapping_String__c.split(';');
            Map<String, String> fieldMappings = new Map<String, String>();
            for (String pair : mappingPairs) {
                String[] parts = pair.split(':');
                if (parts.size() == 2) {
                    fieldMappings.put(parts[0], parts[1]);
                }
            }

            if(metaData.Autometic_Sync__c != null && metaData.Autometic_Sync__c == true){
                // Get all fields for Listing__c
                Map<String, Schema.SObjectField> listingFieldsMap = Schema.SObjectType.Listing__c.fields.getMap();
                Set<String> listingFields = listingFieldsMap.keySet();
                
                // Get all fields for Property__c
                Map<String, Schema.SObjectField> propertyFieldsMap = Schema.SObjectType.Property__c.fields.getMap();
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

                List<Property__c> newProperties = new List<Property__c>();
            
                for (Listing__c newListing : Trigger.new) {
                    if (newListing.Property_ID__c == null) { // Check if Property_ID__c is null
                        Property__c property = new Property__c();
                        for (String field : matchingFields) {
                            if (field != 'RecordTypeId') { // Exclude RecordTypeId field
                                property.put(field, newListing.get(field));
                            }
                        }
                        newProperties.add(property);
                    }
                }
                
                if (!newProperties.isEmpty()) {
                    insert newProperties;
                    List<Listing__c> listingsToUpdate = new List<Listing__c>();
                    for (Integer i = 0; i < Trigger.new.size(); i++) {
                        if (Trigger.new[i].Property_ID__c == null) { // Check if Property_ID__c is null
                            listingsToUpdate.add(new Listing__c(
                                Id = Trigger.new[i].Id,
                                Property_ID__c = newProperties[i].Id
                            ));
                        }
                    }
                    update listingsToUpdate;
                }
            } else {
                // Your existing logic for when Autometic_Sync__c is false
                List<Property__c> newProperties = new List<Property__c>();
                
                for (Listing__c listing : Trigger.new) {
                    Property__c property = new Property__c(); 
                    for (String listingField : fieldMappings.keySet()) {
                        if (listing.get(listingField) != null) {
                            String propertyField = fieldMappings.get(listingField);
                            property.put(propertyField, listing.get(listingField));  
                        }
                    }
                    newProperties.add(property);
                }
                
                if (!newProperties.isEmpty()) {
                    insert newProperties;
                    
                    List<Listing__c> listingsToUpdate = new List<Listing__c>();
                    for (Integer i = 0; i < Trigger.new.size(); i++) {
                        listingsToUpdate.add(new Listing__c(
                            Id = Trigger.new[i].Id,
                            Property_ID__c = newProperties[i].Id
                        ));
                    }
                    update listingsToUpdate;
                }
            }
        } catch(Exception e) {
            // Log the exception into Error_Log__c custom object
            Error_Log__c errorLog = new Error_Log__c();
       
            errorLog.Exception_Message__c = e.getMessage();
            errorLog.Exception_Type__c = e.getTypeName();
            errorLog.StackTrace__c = e.getStackTraceString();
            errorLog.Class_Name__c = 'CreatePropertyByListing';
            errorLog.Method_Name__c = 'After Insert';
            errorLog.More_Details__c = 'Exception occurred in After Insert trigger execution';
            insert errorLog;
        }
        
    } else if (Trigger.isUpdate) {
        try {
            // Your existing update logic for the update trigger
            List<Listing__c> newListings = Trigger.new;
            Map<Id, Listing__c> oldListingMap = Trigger.oldMap;
            
            Mapping_Metadata__mdt metaData = [SELECT Mapping_String__c, Autometic_Sync__c FROM Mapping_Metadata__mdt LIMIT 1];
            
            String[] mappingPairs = metaData.Mapping_String__c.split(';');
            Map<String, String> fieldMappings = new Map<String, String>();
            for (String pair : mappingPairs) {
                String[] parts = pair.split(':');
                if (parts.size() == 2) {
                    fieldMappings.put(parts[0], parts[1]);
                }
            }
            
            List<Property__c> propertiesToUpdate = new List<Property__c>();
            
            for (Listing__c newListing : newListings) {
                Listing__c oldListing = oldListingMap.get(newListing.Id);
                
                for (String listingField : fieldMappings.keySet()) {
                    if (newListing.get(listingField) != oldListing.get(listingField)) {
                        if(newListing.Property_ID__c != null){
                            Property__c existingProperty = [SELECT Id FROM Property__c WHERE Id = :newListing.Property_ID__c LIMIT 1];
                            if (existingProperty != null) {
                                String propertyField = fieldMappings.get(listingField);
                                existingProperty.put(propertyField, newListing.get(listingField));
                                propertiesToUpdate.add(existingProperty);
                            }
                        }
                    }
                }
            }
            
            if (!propertiesToUpdate.isEmpty()) {
                update propertiesToUpdate;
            }
        } catch(Exception e) {
            // Log the exception into Error_Log__c custom object
            Error_Log__c errorLog = new Error_Log__c();
          
            errorLog.Exception_Message__c = e.getMessage();
            errorLog.Exception_Type__c = e.getTypeName();
            errorLog.StackTrace__c = e.getStackTraceString();
            errorLog.Class_Name__c = 'CreatePropertyByListing';
            errorLog.Method_Name__c = 'After Update';
            errorLog.More_Details__c = 'Exception occurred in After Update trigger execution';
            insert errorLog;
        }
    }
}