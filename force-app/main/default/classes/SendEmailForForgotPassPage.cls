public class SendEmailForForgotPassPage {
    @AuraEnabled(cacheable=true)
    public static Datetime sendEmail(String toSend ,String verificationCode){
        System.debug('Sending email to: ' + toSend);
        System.debug('Verification code: ' + verificationCode);
        // EmailTemplate template = [SELECT Subject, Body FROM EmailTemplate WHERE developerName = :'CommunityVerificationEmailTemplate'];
        Datetime otpGeneratedTime = Datetime.now(); // Set the generation timestamp
        HttpRequest req = new HttpRequest();
        String toAddress = toSend;
        String subject = 'OTP (One-Time Password) for email verification';
        // String subject = template.Subject;
        // String mailBody = template.Body;
        String mailBody = 'Please enter below OTP to verify you email ID linked with your EstateXpert account. It is valid for the next 5 minutes.';
        mailBody += '<br/> <br/> <b>Verification Code: </b> <h2>' + verificationCode + '</h2>'; 
        String mbody = '{ "raw" : "' + EncodingUtil.base64Encode(Blob.valueof( 'To: ' + toAddress + '\r\nContent-Type:text/html; charset=utf-8;\r\nSubject: ' + subject + '\r\n\r\n' + mailBody )) + '"}';
        req.setHeader('Content-Length', mbody.length()+'');
        req.setHeader('Content-Type', 'application/json');
    
        req.setEndpoint('callout:Gmail_API/gmail/v1/users/kajalt3020@gmail.com/messages/send');
        req.setMethod('POST');
        system.debug(mbody);
        req.setBody(mbody);
        Http h = new Http();
        HttpResponse res = h.send(req);
        return otpGeneratedTime;
    }
}