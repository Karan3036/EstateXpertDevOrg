public without sharing class ForgetAndResetPasswordController {
    @AuraEnabled(cacheable=true)
    public static String getContactEmail(String inputValue){
        List<Contact> contactRecords = [SELECT Email FROM Contact WHERE Email = :inputValue OR Username__c = :inputValue LIMIT 1];
        return contactRecords.isEmpty() ? null : contactRecords[0].Email;
    }

    @AuraEnabled(cacheable=true)
    public static Boolean validateOTP(String submittedOtp,String verificationCode, Datetime otpGeneratedTime) {
        if (otpGeneratedTime == null || verificationCode == null) {
            system.debug('null');
            return false; // OTP was never generated
        }

        // Check if the OTP is within the validity period
        if (Datetime.now().getTime() - otpGeneratedTime.getTime() > (5 * 60 * 1000)) {
            System.debug('more than 5 min');
            return false; // OTP expired
        }
        if(submittedOtp == verificationCode){
            return true; // OTP verified correctly
        }else{
            return false; // Wrong OTP entered
        }

        // return submittedOtp == verificationCode; // Return true if OTP matches
    }

    @AuraEnabled
    public static void resetContactPassword(String newPassword , String email) {
        Contact currentUser = [SELECT Password__c FROM Contact WHERE Email = : email LIMIT 1];
        currentUser.Password__c = newPassword;
        update currentUser;
    }   
    
    @AuraEnabled(cacheable=true)
    public static Boolean checkOldPassword(String email, String oldPassword){
        Contact contact = [SELECT Password__c FROM Contact WHERE Email = :email LIMIT 1];
        String decryptedPassword = EncryptDecryptController.processDecryption(contact.Password__c);
        return decryptedPassword == oldPassword;
    }
}