public with sharing class UpdateContactPassword {
    @AuraEnabled
    public static void resetContactPassword(String newPassword , String email) {
        Contact currentUser = [SELECT Password__c FROM Contact WHERE Email = : email LIMIT 1];
        currentUser.Password__c = newPassword;
        update currentUser;
    }   
}