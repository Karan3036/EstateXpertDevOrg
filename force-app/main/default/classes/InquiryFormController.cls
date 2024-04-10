public without sharing class InquiryFormController {
    @AuraEnabled(cacheable = true)
    public static String getFieldSet(String objName, String fieldSetName) {
        Schema.DescribeSObjectResult sObjResult = Schema.getGlobalDescribe().get(objName).getDescribe();
        Schema.FieldSet fieldSet = sObjResult.FieldSets.getMap().get(fieldSetName);
        return JSON.serialize(fieldSet.getFields());
    }

    @AuraEnabled
    public static sObject createInquiryRecord(Map<String, String> fieldss) {
    try {
        System.debug(fieldss);
        Inquiry__c newInquiry = new Inquiry__c();
        Map < String, Schema.SObjectField > fieldMap = Schema.SObjectType.Inquiry__c.fields.getMap();
        if (fieldMap != null) {
            for (String fieldNames : fieldMap.keySet()) {
                Schema.DescribeFieldResult fieldDescribe = fieldMap.get(fieldNames).getDescribe();
                if (fieldDescribe != null) {
    String fieldNamess = fieldDescribe.getName();
                    Schema.DisplayType fieldType = fieldDescribe.getType();
                    System.debug('Field Name: ' + fieldNamess);
                    System.debug('Field Type: ' + fieldType);
                    System.debug(fieldss);
                    if (fieldss != null && fieldss.containsKey(fieldNamess)) {
            String value = fieldss.get(fieldNamess);
                        System.debug(value);
                        System.debug(fieldType);
                        if (value != null) {
                            switch on fieldType {
                    when BOOLEAN {
                                    newInquiry.put(fieldNamess, (Boolean) Boolean.valueOf(value));
                                }
                    when DATE {
                                    newInquiry.put(fieldNamess, (Date) Date.valueOf(value));
                                }
                    when DATETIME {
                                    newInquiry.put(fieldNamess, (DateTime) DateTime.valueOf(value));
                                }
                    when DOUBLE, PERCENT, CURRENCY {
                                    newInquiry.put(fieldNamess, (Double) Double.valueOf(value));
                                    System.debug(newInquiry);
                                }
                    when INTEGER {
                                    newInquiry.put(fieldNamess, (Integer) Integer.valueOf(value));
                                }
                    when LONG {
                                    newInquiry.put(fieldNamess, (Long) Long.valueOf(value));
                                }
                    when STRING, PICKLIST, EMAIL, TEXTAREA, PHONE, URL, ENCRYPTEDSTRING, ADDRESS, ID, MULTIPICKLIST, REFERENCE, COMBOBOX {
                                    System.debug('value add in field');
                                    newInquiry.put(fieldNamess, value);
                                    System.debug(newInquiry);
                                }  
                    when else {
                                    System.debug('Unhandled field type: ' + fieldType);
                                }
                            }
                        }
                    }
                } else {
                    System.debug('fieldDescribe is null for field: ' + fieldNames);
                }
            }
        } else {
            System.debug('fieldss map is null');
        }
        insert newInquiry;
        System.debug(newInquiry);
        System.debug(newInquiry.Id);
        return newInquiry;
    } catch (Exception e) {
        throw new AuraHandledException('Error creating inquiry record: ' + e.getMessage() + e.getLineNumber());
    }
}
}