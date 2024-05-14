// public with sharing class Mapcontroller {
//     @AuraEnabled(cacheable=true)
//     public static String fetchMapData(String recordId){
//         try {
//             List<Property__c> addresses = [SELECT Id, Street__c, State__c, City__c, Postal_Code__c, Country__c FROM Property__c WHERE Id=:recordId];
//             System.debug(addresses);
//             return 'success';
//         } catch (Exception e) {
//             throw new AuraHandledException(e.getMessage());
//         }
//     }
// }


public with sharing class Mapcontroller {
    @AuraEnabled(cacheable=true)
    public static list<Property__c> getAddress(string searchKey) {
        String searchKeyword = '%' + searchKey + '%';

        List<Property__c> address = new List<Property__c>();
        for(Property__c conObj : [SELECT Id,Name, Street__c, City__c, Postal_Code__c, State__c, Country__c,Number_of_Bathrooms__c,Number_of_Bedrooms__c,Number_of_Floors__c  
                                   FROM Property__c
                                   WHERE Street__c LIKE :searchKeyword 
                                   OR City__c LIKE :searchKeyword 
                                   OR State__c LIKE :searchKeyword 
                                   OR Country__c LIKE :searchKeyword LIMIT 10]){
           address.add(conObj);
        }
        System.debug(address);
        if(address.size() == 0){
            throw new AuraHandledException('No Record Found..'); 
        }

        return address;
    }
    @AuraEnabled(cacheable=true)
    public static List<String> getImage() {
        List<PropertyMedia__c> img = [SELECT FilenameUrlEncoded__c FROM PropertyMedia__c LIMIT 1];
        List<String> filenames = new List<String>();
        for (PropertyMedia__c image : img) {
            filenames.add(image.FilenameUrlEncoded__c);
        }
        System.debug(filenames);
        return filenames;
    }
}