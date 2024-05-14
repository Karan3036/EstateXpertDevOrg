public with sharing class registrationPageController {
    
    @AuraEnabled
    public static Contact getContactDetails(String contactId) {
    return [SELECT Id, Salutation, FirstName, LastName, Email, MobilePhone FROM Contact WHERE Id = :contactId];
    }

    @AuraEnabled
    public static Boolean isDuplicateUserName(String userName) {
        List<Contact> existingContacts = [SELECT Id FROM Contact WHERE Username__c = :userName LIMIT 1];
        return !existingContacts.isEmpty();
    }
    @AuraEnabled
    public static Boolean isDuplicateEmail(String email) {
        List<Contact> existingContacts = [SELECT Id FROM Contact WHERE Email = :email LIMIT 1];
        return !existingContacts.isEmpty();
    }
    
    private static String getRecordTypeDeveloperName(String objectApiName, String recordTypeName) {
        Map<String, Schema.RecordTypeInfo> recordTypeInfoMap = Schema.getGlobalDescribe().get(objectApiName).getDescribe().getRecordTypeInfosByName();
        
        for (Schema.RecordTypeInfo recordTypeInfo : recordTypeInfoMap.values()) {
            if (recordTypeInfo.getName() == recordTypeName) {
                return recordTypeInfo.getDeveloperName();
            }
        }
        
        return null;
    }
    
    private static String getRecordTypeName(String objectApiName, Id recordTypeId) {
    return Schema.SObjectType.Contact.getRecordTypeInfosById().get(recordTypeId).getName();
}

@AuraEnabled(cacheable=true)
public static List<String> getSalutation() {
    List<String> salutation = new List<String>();
    Schema.DescribeFieldResult fieldResult = Contact.Salutation.getDescribe();
    List<Schema.PicklistEntry> picklistValues = fieldResult.getPicklistValues();
    for(Schema.PicklistEntry pl : picklistValues) {
        salutation.add(pl.getValue());
    }
    return salutation;
}

@AuraEnabled(cacheable=true)
public static List<String> getLoggedUser(){
    List<String> loggedUser = new List<String>();
    Schema.DescribeFieldResult fieldResult = Contact.LoggedIn_as__c.getDescribe();
    List<Schema.PicklistEntry> picklistValues = fieldResult.getPicklistValues();
    for(Schema.PicklistEntry pl : picklistValues) {
        loggedUser.add(pl.getValue());
    }
    return loggedUser;
}

    @AuraEnabled
    public static void createContact(String recordType, String userName, String salutation, String firstname, String lastname, String email, String mobileNumber, String password ){
        Boolean isDuplicateUserName = isDuplicateUserName(userName);
        Boolean isDuplicateEmail = isDuplicateEmail(email);

        if (!isDuplicateUserName && !isDuplicateEmail) {
            
            String recordTypeDeveloperName = getRecordTypeDeveloperName('Contact', recordType);
        
        if (recordTypeDeveloperName != null) {
            Id recordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByDeveloperName().get(recordTypeDeveloperName).getRecordTypeId();
            
            String encryptedPassword = EncryptDecryptController.processEncryption(password);

            Account acc = [SELECT Id, Name from Account where Name LIKE 'Registered Account'];

            Contact con = new Contact(
                RecordTypeId = recordTypeId,
                Username__c = userName,
                Salutation = salutation,
                FirstName = firstname,
                LastName = lastname,
                Password__c = encryptedPassword,
                Email = email,
                MobilePhone = mobileNumber,
                AccountId = acc.Id
            );
            insert con;

            sendEmailToContact(email);
            
            system.debug(con);
        }else {
            if (isDuplicateUserName && isDuplicateEmail) {
            throw new AuraHandledException('Username and Email already exist.');
        } else if (isDuplicateUserName) {
            throw new AuraHandledException('Username already exists.');
        } else if (isDuplicateEmail) {
            throw new AuraHandledException('Email already exists.');
        }
        }
    }
    }

    @future(callout=true)
public static void sendEmailToContact(String email) {
    GmailIntegration.sendEmailToContact(email);
}

}