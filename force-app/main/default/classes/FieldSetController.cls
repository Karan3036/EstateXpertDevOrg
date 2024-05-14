global with sharing class FieldSetController {
    @AuraEnabled
    public static FieldSetForm getForm(Id recordId, String objectName, String fieldSetName) {
        System.debug('hi');
        FieldSetForm form = new FieldSetForm();        
        form.Fields = getFields(recordId, objectName, fieldSetName);
        
        return form;
    }
    
    public static List<FormField> getFields(Id recordId, String objectName, String fieldSetName) {
        Schema.SObjectType objectType = null;
        
        if (recordId != null) {
            objectType = recordId.getSobjectType();
        }
        else if (String.isNotBlank(objectName)) {
            objectType = Schema.getGlobalDescribe().get(objectName);
        }
        
        Schema.DescribeSObjectResult objectDescribe = objectType.getDescribe();
        Map<String, Schema.FieldSet> fieldSetMap = objectDescribe.fieldSets.getMap();
        Schema.FieldSet fieldSet = fieldSetMap.get(fieldSetName);
        List<Schema.FieldSetMember> fieldSetMembers = fieldSet.getFields();
        
        List<FormField> fields = new List<FormField>();
        for (Schema.FieldSetMember fsm : fieldSetMembers) {
            FormField f = new FormField(fsm);
            fields.add(f);
        }
        
        return fields;
    }
    
    public class FieldSetForm {
        @AuraEnabled
        public List<FormField> Fields { get; set; }
        
        public FieldSetForm() {
            Fields = new List<FormField>();
        }
    }

    @AuraEnabled
    public static Map<String,List<Listing__c>> fetchListings(Property__c listin){
        
        try {
            String query = '';
            if( (listin.Name != null && listin.Name != '') || String.isNotBlank(listin.City__c) || String.isNotBlank(listin.State__c) || String.isNotBlank(listin.Country__c) ){
                query = 'SELECT Id, Name,City__c,State__c,Country__c,(Select id, Name from Listings__r) FROM Property__c WHERE ';
                if(String.isNotBlank(listin.Name))query += ' Name LIKE \'%'+listin.Name+'%\' AND ';
                if(String.isNotBlank(listin.City__c))query += ' City__c LIKE \'%'+listin.City__c+'%\' AND ';
                if(String.isNotBlank(listin.State__c))query += ' State__c LIKE \'%'+listin.State__c+'%\' AND ';
                if(String.isNotBlank(listin.Country__c))query += ' Country__c LIKE \'%'+listin.Country__c+'%\' AND ';
                query = query.removeEnd(' AND ');
                System.debug('query>>>'+query);
                
            }
                List<Property__c> listinglst = Database.query(query);

                if (listinglst.isEmpty()) {
                    return null;
                }

                System.debug('listinglst>>>'+listinglst);
                Map<String,List<Listing__c>> lstMap = new Map<String,List<Listing__c>>();
                List<Listing__c> lstIds = new List<Listing__c>();
                String addrField;

                for(Property__c c:listinglst){   
                    if(c.Listings__r!=null && !c.Listings__r.isEmpty()){
                        for(Listing__c p : c.Listings__r){
                            addrField = '';
                            if(c.City__c!=null && c.City__c!='' && String.isNotBlank(c.City__c)){
                                addrField += c.City__c + ', '; 
                            }
                            else{
                                addrField += '';
                            }

                            if(c.State__c!=null && c.State__c!='' && String.isNotBlank(c.State__c)){
                                addrField += c.State__c + ', '; 
                            }
                            else{
                                addrField += '';
                            }

                            if(c.Country__c!=null && c.Country__c!='' && String.isNotBlank(c.Country__c)){
                                addrField += c.Country__c + ', '; 
                            }
                            else{
                                addrField += '';
                            }

                            System.debug('addrField>>>'+addrField);
                            if(!lstMap.containsKey(c.Id+'::'+c.Name+'::'+addrField)){
                                
                                lstMap.put(c.Id+'::'+c.Name+'::'+addrField,new List<Listing__c>());
                            }
                            lstMap.get(c.Id+'::'+c.Name+'::'+addrField).add(p);  
                        }
                    }
                    else{
                        System.debug('else');
                        addrField = '';
                        if(c.City__c!=null && c.City__c!='' && String.isNotBlank(c.City__c)){
                            addrField += c.City__c + ', '; 
                        }
                        else{
                            addrField += '';
                        }

                        if(c.State__c!=null && c.State__c!='' && String.isNotBlank(c.State__c)){
                            addrField += c.State__c + ', '; 
                        }
                        else{
                            addrField += '';
                        }

                        if(c.Country__c!=null && c.Country__c!='' && String.isNotBlank(c.Country__c)){
                            addrField += c.Country__c + ', '; 
                        }
                        else{
                            addrField += '';
                        }
                        lstMap.put(c.Id+'::'+c.Name+'::'+addrField,new List<Listing__c>());
                        System.debug('lstMap====>'+lstMap);
                    }
                }
                System.debug('lstMap>>>'+lstMap);
                return lstMap;
            
        } catch (Exception e) {
            System.debug('error-->>'+e.getMessage()+'---'+e.getStackTraceString());
            return null;
            
        }
    }

}