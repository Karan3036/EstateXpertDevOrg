public with sharing class loginPageController {
    public class LoginResponse {
        @AuraEnabled public String message;
        @AuraEnabled public Contact contact;
    }

    @AuraEnabled
    public static LoginResponse getContact(String emailName, String password) {
        LoginResponse response = new LoginResponse();
        try {
            System.debug('email'+emailName);
            System.debug('pass'+password);
            List<Contact> conE = [SELECT Id, Email,Username__c ,Password__c FROM Contact WHERE Email = :emailName LIMIT 1];
            List<Contact> conU = [SELECT Id, Email,Username__c ,Password__c FROM Contact WHERE Username__c = 'Kashish00' LIMIT 1];
            System.debug('test'+conE+conU);
            if (conE.size() == 1) {
                Contact con = conE[0];
                String pass = EncryptDecryptController.processDecryption(conE[0].Password__c);
                System.debug(pass);
                if (password == pass ) {
                    List<Contact> cons = [SELECT Id, Email,Name,Username__c,Title,Department,Birthdate,Phone,OtherAddress,MailingAddress FROM Contact WHERE Id = :con.Id LIMIT 1];
                    response.contact = cons[0];
                    response.message = 'Login';
                    return response;
                }else{
                    response.message = 'Password';
                    return response;
                }
            }else if(conU.size() == 1){
                Contact con = conU[0];
                String pass = EncryptDecryptController.processDecryption(conU[0].Password__c);
                System.debug(pass);
                if (password == pass ) {
                    List<Contact> cons = [SELECT Id, Email,Name,Username__c,Title,Department,Birthdate,Phone,OtherAddress,MailingAddress FROM Contact WHERE Id = :con.Id LIMIT 1];
                    response.contact = cons[0];
                    response.message = 'Login';
                    return response;
                }else{
                    response.message = 'Password';
                    return response;
                }
            }else{
                response.message = 'EmailNot';
                return response;
            }
            
        } catch (Exception e) {
            response.message = 'Error occurred';
            return response;
        }
    }
}