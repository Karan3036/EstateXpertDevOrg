public class GmailIntegration {

    @AuraEnabled(cacheable=true)
    public static void sendEmailToContact(String toEmail){
        
    EmailTemplate template = [SELECT Subject, Body FROM EmailTemplate WHERE developerName = :'SalesNewCustomerEmail'];
    
    HttpRequest req = new HttpRequest();
    String toAddress = toEmail;
    String subject = template.Subject;
    String mailBody = template.Body;
    String mbody = '{ "raw" : "' + EncodingUtil.base64Encode(Blob.valueof( 'To: ' + toAddress + '\r\nContent-Type:text/plain; charset=utf-8;\r\nSubject: ' + subject + '\r\n\r\n' + mailBody )) + '"}';
    req.setHeader('Content-Length', mbody.length()+'');
    req.setHeader('Content-Type', 'application/json');
 
    req.setEndpoint('callout:EstateGmailApi/gmail/v1/users/kajalt3020@gmail.com/messages/send');
    req.setMethod('POST');
    system.debug(mbody);
    req.setBody(mbody);
    Http h = new Http();
    HttpResponse res = h.send(req);
        system.debug(res);
    }
}