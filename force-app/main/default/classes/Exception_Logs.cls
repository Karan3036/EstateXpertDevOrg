public with sharing class Exception_Logs {


    public static void createExceptionRecord(Exception e, String ClassName, String MethodName){
        try {

            String QueryLimit = '1. SOQL Queries used / SOQL Queries allowed: ' + Limits.getQueries() + '/' + Limits.getLimitQueries();
            String DMLimit = '2. Number of records queried so far /  Number allowed: ' + Limits.getDmlRows() + '/' + Limits.getLimitDmlRows();
            String DMLStat = '3. Number of DML statements used so far / Number allowed: ' +  Limits.getDmlStatements() + '/' + Limits.getLimitDmlStatements();   
            String CPUT = '4. Amount of CPU time (in ms) used so far / CPU usage time (in ms) allowed: ' + Limits.getCpuTime() + '/' + Limits.getLimitCpuTime();
    
            Error_Log__c errorLog = new Error_Log__c();
    
            errorLog.Exception_Message__c = e.getMessage();
            errorLog.Exception_Type__c = e.getTypeName();
            errorLog.Line_Number__c = e.getLineNumber();
            errorLog.StackTrace__c = e.getStackTraceString();
            errorLog.Govt_Limit_in_Executing_Code__c = String.format('{0}\n{1}\n{2}\n{3}',new List<string>{QueryLimit, DMLimit,DMLStat,CPUT});
            errorLog.Class_Name__c = ClassName;
            errorLog.Method_Name__c = MethodName;
    
            insert errorLog;
            
        } catch (Exception ex) {
            System.debug(ex.getMessage());
        }
       
    }
    
}