public without sharing class ProfileController {
    
    @AuraEnabled
    public static void updateContact(Id contactId, Map<String, Object> fieldsToUpdate) {
    Contact con = [SELECT Id FROM Contact WHERE Id = :contactId];

    for (String fieldName : fieldsToUpdate.keySet()) {
        Schema.DescribeFieldResult fieldDescribe = Contact.getSObjectType().getDescribe().fields.getMap().get(fieldName).getDescribe();

        if (fieldDescribe.getType() == Schema.DisplayType.Integer) {
            con.put(fieldName, Integer.valueOf((String) fieldsToUpdate.get(fieldName)));

        } else if (fieldDescribe.getType() == Schema.DisplayType.Double) {
            try {
                con.put(fieldName, Double.valueOf((String) fieldsToUpdate.get(fieldName)));
            } catch (Exception e) {
                System.debug('Error parsing Double value: ' + e.getMessage());
            }
        } else if (fieldDescribe.getType() == Schema.DisplayType.Date) {
            try {
                Date dateValue = Date.valueOf((String) fieldsToUpdate.get(fieldName));
                con.put(fieldName, dateValue);
            } catch (Exception e) {
                System.debug('Error parsing date: ' + e.getMessage());
            }
        }else if (fieldDescribe.getType() == Schema.DisplayType.Picklist) {
            con.put(fieldName, (String) fieldsToUpdate.get(fieldName));
        } else {
            con.put(fieldName, fieldsToUpdate.get(fieldName));
        }

        if (fieldName == 'Age__c') {
            Decimal ageValue = (Decimal)fieldsToUpdate.get(fieldName);
            con.Age__c = ageValue.intValue();
        }
        if (fieldName == 'FirstName') {
            con.FirstName = (String)fieldsToUpdate.get(fieldName);
        } 
         if (fieldName == 'LastName') {
            con.LastName = (String)fieldsToUpdate.get(fieldName);
        }
    }
 
    update con;
}


    @AuraEnabled(cacheable=true)
    public static List<String> getGender(){
        List<String> gender = new List<String>();
        Schema.DescribeFieldResult fieldResult = Contact.Gender__c.getDescribe();
        List<Schema.PicklistEntry> picklistVal = fieldResult.getPicklistValues();
        for(Schema.PicklistEntry pl : picklistVal){
                gender.add(pl.getValue());
        }
        return gender;
      
    }

    @AuraEnabled(cacheable=true)
    public static Contact getContact(Id contactId){
        return [select Id, Name, MobilePhone,Email, Gender__c, Age__c, Date_of_Birth__c,Address_Line__c,City__c,State__c,Country__c,Pincode__c,Deals_In__c,Description,Operates_In__c from Contact where Id=: contactId];
    }
    
    @AuraEnabled
    public static Id saveContactAttachment(Id contactId, String fileName, String base64Data, String contentType) {
        Attachment attachment = new Attachment();
        attachment.Name = fileName;
        attachment.ParentId = contactId;
        attachment.Body = EncodingUtil.base64Decode(base64Data);
        attachment.ContentType = contentType;
        insert attachment;
        return attachment.Id;
    }

    @AuraEnabled(cacheable=true)
    public static String getContactImageAttachments(Id contactId) {
        Attachment attachment = [SELECT Body FROM Attachment 
                                 WHERE ParentId = :contactId AND ContentType LIKE 'image%' 
                                 ORDER BY CreatedDate DESC LIMIT 1];
        if (attachment != null) {
            return EncodingUtil.base64Encode(attachment.Body);
        }
        return null;
  }
}