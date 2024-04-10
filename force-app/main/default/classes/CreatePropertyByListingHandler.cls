public class CreatePropertyByListingHandler {
    //Method for the afterInsert trigger
    public static void afterInsert(List<Listing__c> newListings, Map<Id, Listing__c> oldListingMap) {
        try {
            //Get mapping from the metadata record
            Mapping_Metadata__mdt metaData = [SELECT Mapping_String__c, Autometic_Sync__c, BlockedFields__c FROM Mapping_Metadata__mdt LIMIT 1];
            
            String[] mappingPairs = metaData.Mapping_String__c.split(';');
            Map<String, String> fieldMappings = new Map<String, String>();
            for (String pair : mappingPairs) {
                String[] parts = pair.split(':');
                if (parts.size() == 2) {
                    fieldMappings.put(parts[0], parts[1]);
                }
            }
            
            //When Automatic sync is on
            if(metaData.Autometic_Sync__c != null && metaData.Autometic_Sync__c == true){

                //Get All fields and exclude the audit and unwritable fields
                Map<String, Schema.SObjectField> listingFieldsMap = Schema.SObjectType.Listing__c.fields.getMap();
                Set<String> listingFields = listingFieldsMap.keySet();
                
                Map<String, Schema.SObjectField> propertyFieldsMap = Schema.SObjectType.Property__c.fields.getMap();
                Set<String> propertyFields = propertyFieldsMap.keySet();
                
                Set<String> auditFields = new Set<String>(metaData.BlockedFields__c.split(';'));
                for (String auditField : auditFields) {
                    if (listingFields.contains(auditField)) {
                        listingFields.remove(auditField);
                    }
                    if (propertyFields.contains(auditField)) {
                        propertyFields.remove(auditField);
                    }
                }
                
                Set<String> unwritableFieldsForListing = new Set<String>();
                for (String fieldName : listingFields) {
                    if (!listingFieldsMap.get(fieldName).getDescribe().isUpdateable()) {
                        unwritableFieldsForListing.add(fieldName);
                    }
                }
                listingFields.removeAll(unwritableFieldsForListing);
                
                Set<String> unwritableFieldsForProperty = new Set<String>();
                for (String fieldName : propertyFields) {
                    if (!propertyFieldsMap.get(fieldName).getDescribe().isUpdateable()) {
                        unwritableFieldsForProperty.add(fieldName);
                    }
                }
                propertyFields.removeAll(unwritableFieldsForProperty);
                
                Set<String> matchingFields = new Set<String>(listingFields);
                matchingFields.retainAll(propertyFields);


                //create the property
                List<Property__c> newProperties = new List<Property__c>();
            
                for (Listing__c newListing : newListings) {
                    if (newListing.Property_ID__c == null) {
                        Property__c property = new Property__c();
                        for (String field : matchingFields) {
                            if (field != 'RecordTypeId') {
                                property.put(field, newListing.get(field));
                             }
                        }
                        newProperties.add(property);
                    }
                }
                
                if (!newProperties.isEmpty()) {
                    insert newProperties;
                    List<Listing__c> listingsToUpdate = new List<Listing__c>();
                    for (Integer i = 0; i < newListings.size(); i++) {
                        if (newListings[i].Property_ID__c == null) {
                            listingsToUpdate.add(new Listing__c(
                                Id = newListings[i].Id,
                                Property_ID__c = newProperties[i].Id
                            ));
                        }
                    }
                    update listingsToUpdate;
                }
            } else {
                //when Automatic sync is off
                List<Property__c> newProperties = new List<Property__c>();
                
                for (Listing__c listing : newListings) {
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
                    for (Integer i = 0; i < newListings.size(); i++) {
                        listingsToUpdate.add(new Listing__c(
                            Id = newListings[i].Id,
                            Property_ID__c = newProperties[i].Id
                        ));
                    }
                    update listingsToUpdate;
                }
            }
        } catch(Exception e) {
            logException(e, 'After Insert');
        }
    }

    //method for the afterupdate tigger
    public static void afterUpdate(List<Listing__c> newListings, Map<Id, Listing__c> oldListingMap) {
        try {
            // Get mapping from the metadata
            Mapping_Metadata__mdt metaData = [SELECT Mapping_String__c, Autometic_Sync__c, BlockedFields__c FROM Mapping_Metadata__mdt LIMIT 1];
            
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
            logException(e, 'After Update');
        }
    }
    //Exception handler method
    private static void logException(Exception e, String methodName) {
        String className = 'CreatePropertyByListingHandler';
        Exception_Logs.createExceptionRecord(e,className, methodName);

    }
}