public with sharing class MarketingComponent {
    @AuraEnabled(cacheable=true)
    public static List<String> getPicklistForListingType() {
        List<String> listingTypes = new List<String>();
        Schema.DescribeFieldResult fieldResult = Listing__c.Listing_Type__c.getDescribe();
        List<Schema.PicklistEntry> picklistValues = fieldResult.getPicklistValues();
        for(Schema.PicklistEntry pl : picklistValues) {
            listingTypes.add(pl.getValue());
        }
        return listingTypes;
    }
}