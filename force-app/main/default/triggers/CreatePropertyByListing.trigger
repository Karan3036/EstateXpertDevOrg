trigger CreatePropertyByListing on Listing__c (after insert, after update) {
    
    if (Trigger.isInsert) {
        
            CreatePropertyByListingHandler.afterInsert(Trigger.new, Trigger.oldMap);
    
    } else if (Trigger.isUpdate) {
    
            CreatePropertyByListingHandler.afterUpdate(Trigger.new, Trigger.oldMap);
   
    }
}