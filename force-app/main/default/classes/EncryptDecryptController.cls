/**
 * @description : Encrypt Decrypt controller Class.
 */
public with sharing class EncryptDecryptController {

    private Blob cryptoKey = blob.valueOf('EstateXpert/Application/MVClouds');

    /**
     * @description : Method to Process Decryption progress method.
     * @param passKey String value.
     * @return String of Encrypted data
     */
    @AuraEnabled
    public static String processEncryption(String passKey) {
        String encryptedData = '';
        try{
            EncryptDecryptController encObj = new EncryptDecryptController();
            Blob datavalue = Blob.valueOf(passKey);
            system.debug('key--'+encObj.cryptoKey);
            Blob encryptedBlob = Crypto.encryptWithManagedIV('AES256', encObj.cryptoKey, datavalue);
            encryptedData = EncodingUtil.base64Encode(encryptedBlob);
        }catch(Exception e) {
           // error_handler.insert_errordata(e,'EncryptDecryptController','processEncryption');

        }
        system.debug('encryptedData->' + encryptedData);
        return encryptedData;
    }

    /**
     * @description : Method to Process Decryption progress method .
     * @param encryptedData String value.
     * @return String of Decrypted data
     */
    @AuraEnabled
    public static String processDecryption(String encryptedData) {
        String decryptedData = '';
        try{
            EncryptDecryptController encObj = new EncryptDecryptController();
            Blob datavalue = EncodingUtil.base64Decode(encryptedData);
            Blob decryptedBlob = Crypto.decryptWithManagedIV('AES256', encObj.cryptoKey, datavalue);
            decryptedData = decryptedBlob.toString();
        }catch(Exception e) {
            //error_handler.insert_errordata(e,'EncryptDecryptController','processDecryption');

        }
         system.debug('decryptedData->' + decryptedData);
        return decryptedData;
    }
}