public with sharing class Exception_Logs {


    public void createExceptionRecord(String ErrorMessage,String Type,Integer LineNumber,String StackTrace,String ClassName, String MethodName){

        Error_Log__c errorLog = new Error_Log__c();

        errorLog.Exception_Message__c = ErrorMessage;
        errorLog.Exception_Type__c = Type;
        errorLog.Line_Number__c = LineNumber;
        errorLog.StackTrace__c = StackTrace;
        errorLog.Class_Name__c = ClassName;
        errorLog.Method_Name__c = MethodName;

        insert errorLog;
    }

    public void createListing(){
        try {
            Account listing = new Account();
            listing.Rating = 'Hot';
            insert listing;
        } catch(Exception e) {
            System.debug('Exception type: ' + e.getTypeName());
            System.debug('Message: ' + e.getMessage());
            System.debug('Cause: ' + e.getCause()); 
            System.debug('Line number: ' + e.getLineNumber());
            System.debug('Stack trace: ' + e.getStackTraceString()); 
            Exception_Logs exp = new Exception_Logs();
            exp.createExceptionRecord(e.getMessage(),e.getTypeName(),e.getLineNumber(),e.getStackTraceString(),'Exception_Logs','createListing');
            System.debug(e.getMessage());
        }
    }


    // public void Exception_Logs(Exception e) {
    //     createExceptionRecord(e);
    // }

    // public void createExceptionRecord(Exception e){
    //     String stackTrace = e.getStackTraceString().substringBefore('\n');
	// 	String className = stackTrace.substringAfter('.').substringBefore('.');	
    //     String methodName = stackTrace.substringBefore(':').substringAfter(className).substringAfter('.');

    //     String QueryLimit = '1. SOQL Queries used / SOQL Queries allowed: ' + Limits.getQueries() + '/' + Limits.getLimitQueries();
    //     String DMLimit = '2. Number of records queried so far /  Number allowed: ' + Limits.getDmlRows() + '/' + Limits.getLimitDmlRows();
    //     String DMLStat = '3. Number of DML statements used so far / Number allowed: ' +  Limits.getDmlStatements() + '/' + Limits.getLimitDmlStatements();   
    //     String CPUT = '4. Amount of CPU time (in ms) used so far / CPU usage time (in ms) allowed: ' + Limits.getCpuTime() + '/' + Limits.getLimitCpuTime();

        // Error_Log__c errorLog = new Error_Log__c();

        // errorLog.Exception_Message__c = e.getMessage();
        // errorLog.Exception_Type__c = e.getTypeName();
        // errorLog.Line_Number__c = e.getLineNumber();
        // errorLog.StackTrace__c = e.getStackTraceString();
        // errorLog.Govt_Limit_in_Executing_Code__c = String.format('{0}\n{1}\n{2}\n{3}',new List<string>{QueryLimit, DMLimit,DMLStat,CPUT});
        // errorLog.Class_Name__c = className;
        // errorLog.Method_Name__c = methodName;

        // insert errorLog;
        
    // }


    
}