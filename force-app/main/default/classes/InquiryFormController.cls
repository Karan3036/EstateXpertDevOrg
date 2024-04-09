public without sharing class InquiryFormController {
    @AuraEnabled(cacheable=true)
    public static String getFieldSet(String objName, String fieldSetName) {
        Schema.DescribeSObjectResult sObjResult = Schema.getGlobalDescribe().get(objName).getDescribe();
        Schema.FieldSet fieldSet = sObjResult.FieldSets.getMap().get(fieldSetName);
        return JSON.serialize(fieldSet.getFields());
    }

    @AuraEnabled
    public static Id createInquiryRecord(Map<String, String> fieldss) {
        try {
            System.debug(fieldss);
        Inquiry__c newInquiry = new Inquiry__c();
        Map<String, Schema.SObjectField> fieldMap = Schema.SObjectType.Inquiry__c.fields.getMap();
        if (fieldMap != null) {
for (String fieldNames : fieldMap.keySet()) {
    Schema.DescribeFieldResult fieldDescribe = fieldMap.get(fieldNames).getDescribe();
    if (fieldDescribe != null) {
    String fieldNamess = fieldDescribe.getName();
    Schema.DisplayType fieldType = fieldDescribe.getType();
    System.debug('Field Name: ' + fieldNames);
    System.debug('Field Type: ' + fieldType);
    System.debug(fieldss);
    if (fieldss != null) {
        for (String fieldName : fieldss.keySet()) {
            String value = fieldss.get(fieldName);
            System.debug(fieldName + ' ' + value);
            if(fieldName == fieldNames)  {
                switch on fieldType {
                    when BOOLEAN {
                        if (value != null) {
                            newInquiry.put(fieldName, Boolean.valueOf((String)value));
                        }
                    }
                    when DATE {
                        if (value != null) {
                        newInquiry.put(fieldName, Date.valueOf((String)value));
                        }
                    }
                    when DATETIME {
                        if (value != null) {
                        newInquiry.put(fieldName, DateTime.valueOf((String)value));
                        }
                    }
                    when DOUBLE, PERCENT, CURRENCY {
                        if (value != null) {
                        newInquiry.put(fieldName, Double.valueOf((String)value));
                        }
                    }
                    when INTEGER {
                        if (value != null) {
                        newInquiry.put(fieldName, Integer.valueOf((String)value));
                        }
                    }
                    when LONG {
                        if (value != null) {
                        newInquiry.put(fieldName, Long.valueOf((String)value));
                        }
                    }
                    when STRING, PICKLIST, EMAIL, TEXTAREA, PHONE, URL, ENCRYPTEDSTRING, ADDRESS, ID, MULTIPICKLIST, REFERENCE, COMBOBOX {
                        if (value != null) {
                            System.debug('value add in field');
                        newInquiry.put(fieldName, (String)value);
                        }
                    }  
                    when else {
                        System.debug('Unhandled field type: ' + fieldType);
                    } 
                }
            }
            }
    } else {
        System.debug('fieldss map is null');
    }
} else {
    System.debug('fieldDescribe is null for field: ' + fieldNames);
}
}
} else {
    System.debug('fieldMap is null');
}
insert newInquiry;
            return newInquiry.Id;
        } catch (Exception e) {
            throw new AuraHandledException('Error creating inquiry record: ' + e.getMessage()+ e.getLineNumber());
        }
    }
}



// Schema.DescribeSObjectResult sObjResult = Schema.getGlobalDescribe().get('Inquiry__c').getDescribe();
            // Schema.FieldSet fieldSet = sObjResult.FieldSets.getMap().get('InquiryFieldSet');
            // for (Schema.FieldSetMember field : fieldSet.getFields()) {
            //     // Get the field API name
            //     String fieldName = field.getFieldPath();
            //     // Get the field describe result
            //     Schema.DescribeFieldResult fieldDesc = sObjResult.fields.getMap().get(fieldName).getDescribe();
            //     // Get the field API name and its data type
            //     fieldMap.put(fieldDesc.getName(), fieldDesc.getType().name());
            // }
            // Inquiry__c newInquiry = new Inquiry__c();
            
            // for (String fieldName : fieldMap.keySet()) {
            //     // String dataType = fieldMap.get(fieldName);
            //     Object fieldValue = fields.get(fieldName); // Assuming fields is a Map<String, Object> containing values
                
            //     if (fieldMap.get(fieldName) == Schema.DisplayType.STRING.name()) {
            //         newInquiry.put(fieldName, (String)fieldValue);
            //     } else if (fieldMap.get(fieldName) == Schema.DisplayType.BOOLEAN.name()) {
            //         newInquiry.put(fieldName, (Boolean)fieldValue);
            //     } else if (fieldMap.get(fieldName) == Schema.DisplayType.INTEGER.name()) {
            //         newInquiry.put(fieldName, (Integer)fieldValue);
                // } else if (fieldMap.get(fieldName) == Schema.DisplayType.DOUBLE.name()) {
                //     newInquiry.put(fieldName, (Double)fieldValue);
            //     } else if (fieldMap.get(fieldName) == Schema.DisplayType.DATE.name()) {
            //         newInquiry.put(fieldName, (Date)fieldValue);
            //     } else if (fieldMap.get(fieldName) == Schema.DisplayType.DATETIME.name()) {
            //         newInquiry.put(fieldName, (DateTime)fieldValue);
            //     } else if (fieldMap.get(fieldName) == Schema.DisplayType.PICKLIST.name()) {
            //         newInquiry.put(fieldName, (String)fieldValue);
            //     }
            // }
            
            // Boolean hasFieldsPopulated = false;
        //     for (String key : NewArray.keySet()) {
        //         Map<String, Object> fieldValueMap = (Map<String, Object>) NewArray.get(key);
        //         String dataType = String.valueOf(fieldValueMap.get('type'));
        //         Object fieldValue = fieldValueMap.get('path');
            
        //     if (dataType == 'STRING') {
        //         newInquiry.put(key, (String)fieldValue);
        //     } else if (dataType == 'BOOLEAN') {
        //         newInquiry.put(key, (Boolean)fieldValue);
        //     } else if (dataType == 'INTEGER') {
        //         newInquiry.put(key, (Integer)fieldValue);
        //     } else if (dataType == 'DOUBLE') {
        //         newInquiry.put(key, (Double)fieldValue);
        //     } else if (dataType == 'DATE') {
        //         newInquiry.put(key, (Date)fieldValue);
        //     } else if (dataType == 'DATETIME') {
        //         newInquiry.put(key, (DateTime)fieldValue);
        //     } else if (dataType == 'PICKLIST') {
        //         newInquiry.put(key, (String)fieldValue);
        //     }
        // }
        // for(string NewArr : NewArray){
        //     // String fieldname = NewArr1['path'];
        //     String values = NewArr;
        //     for(String NewArr1 : NewArray1){
        //         // String fieldname = NewArr1['path'];
        //         String Fieldname = NewArr1;

        //     }
        // }



// newInquiry.put(fieldName, (fieldType)value);
// if(fieldMap.containsKey(fieldName)){
//     Schema.DescribeFieldResult fieldDescribe = fieldMap.get(fieldName).getDescribe();
//     // String fieldNames = fieldDescribe.getName();
//     Schema.DisplayType fieldType = fieldDescribe.getType();

// Check if the field exists on the object before populating
// if (newInquiry.getSObjectType().getDescribe().fields.getMap().containsKey(fieldName)) {
    // Schema.DescribeFieldResult fieldDescribe = newInquiry.getSObjectType().getDescribe().fields.getMap().get(fieldName).getDescribe();
    
//     if (fieldDescribe != null) {
        // System.debug(fieldDescribe);



            // for (String key : fields.keySet()) {
            //         for(String NewArr1 : NewArray1){
            //             // String fieldname = NewArr1['path'];
            //             String Fieldname = NewArr1;
            //             if(fieldname.equals(key)){
            //                 for(String NewArr : NewArray){
            //                     String values = NewArr;
                                // datatypes = values.translate(str.maketrans('', '', values.punctuation))
                                // Map<String, Object> values = (Map<String, Object>)JSON.deserializeUntyped(fieldss);
                            // sObject record = ((sObject)Type.forName('Schema','Inquiry__c').newInstance());
                            // Map<String, sObjectField> fields = record.getSObjectType().getDescribe().fields.getMap();
                            // for(String fieldName: fieldss.keySet()) {
                            // Object value = fieldss.get(fieldName);
                            // DescribeFieldResult fieldInfo = fields.get(fieldName).getDescribe();
                            // switch on (fieldInfo.getType()) {
                            //     when id, address, combobox, email, encryptedstring, multipicklist, phone, picklist, reference, string, textarea, url {
                            //     record.put(fieldName, (string)value);
                            //     }
                            //     when Boolean {
                            //     record.put(fieldName, Boolean.valueOf((String)value));
                            //     }
                            //     when Date {
                            //     record.put(fieldName, Date.valueOf((String)value));
                            //     }
                            //     when DateTime {
                            //     record.put(fieldName, DateTime.valueOf((String)value));
                            //     }
                            //     when currency, double, percent {
                            //     record.put(fieldName, Double.valueOf((String)value));
                            //     }
                            //     when integer {
                            //     record.put(fieldName, Integer.valueOf((String)value));
                            //     }
                            //     when long {
                            //     record.put(fieldName, Long.valueOf((String)value));
                            //     }
                            // }
                            // }
            //                records.add(record); 
            //                     newInquiry.put(key, (values)fields.get(key));
            //             }
            //         }
            //     }
            // }
            //         if(key.equals(Field)){
            //             for(String value:values){
            //                 newInquiry.put(key, (String)fields.get(key)); 
            //             }
            //         }
            //     }
            // }
        // }
            //     if (NewArr == 'STRING') {
            //         newInquiry.put(key, (String)fields.get(key));
            //     } else if (NewArr == 'BOOLEAN') {
            //         newInquiry.put(key, (Boolean)fields.get(key));
            //     } else if (NewArr == 'INTEGER') {
            //         newInquiry.put(key, (Integer)fields.get(key));
            //     } else if (NewArr == 'DOUBLE') {
            //         newInquiry.put(key, (Double)fields.get(key));
            //     } else if (NewArr == 'DATE') {
            //         newInquiry.put(key, (Date)fields.get(key));
            //     } else if (NewArr == 'DATETIME') {
            //         newInquiry.put(key, (DateTime)fields.get(key));
            //     } else if (NewArr == 'PICKLIST') {
            //         newInquiry.put(key, (String)fields.get(key));
            //     }
            // }

            //     Object value = fields.get(key);
            // // Perform data type conversion for Decimal fields
            // if (Schema.getGlobalDescribe().get('Inquiry__c').getDescribe().fields.getMap().get(key).getDescribe().getType() == Schema.DisplayType.DECIMAL) {
            //     newInquiry.put(key, value instanceof String ? Decimal.valueOf((String)value) : (Decimal)value);
            // } else {
            //     newInquiry.put(key, value);
            // }
            // if(fields.get(key) )
                // newInquiry.put(key, (fieldsType)fields.get(key));
            //     // newInquiry.key = (String)fields.get(key);
            // }
            // newInquiry.Contact_Name__c = (String)fields.get('Contact_Name__c');
            // newInquiry.putAll(fields);