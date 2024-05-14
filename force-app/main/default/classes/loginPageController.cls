public class loginPageController {
    public class LoginResponse {
        @AuraEnabled public String message;
        @AuraEnabled public Contact contact;
    }

    @AuraEnabled
    public static LoginResponse getContact(String emailName, String password) {
        LoginResponse response = new LoginResponse();
        try {
            System.debug('email' + emailName);
            System.debug('pass' + password);
        
            List<Contact> matchingContacts = [SELECT Id, Email, Username__c, Password__c FROM Contact WHERE Email = :emailName OR Username__c = :emailName LIMIT 1];
            
            System.debug('matchingContacts: ' + matchingContacts);
            
            if (!matchingContacts.isEmpty()) {
                Contact con = matchingContacts[0];
                String pass = EncryptDecryptController.processDecryption(con.Password__c);
                System.debug(pass);
                
                if (password == pass) {
                    List<Contact> cons = [SELECT Id, Email, Name, Username__c, Title, Department, Birthdate, Phone, OtherAddress, MailingAddress,RecordTypeId,GenderIdentity FROM Contact WHERE Id = :con.Id LIMIT 1];
                    response.contact = cons[0];
                    response.message = 'Login';
                } else {
                    response.message = 'Password';
                }
            } else {
                response.message = 'EmailNot';
            }
            
        } catch (Exception e) {
            response.message = 'Error occurred';
        }
        return response;
    }
}