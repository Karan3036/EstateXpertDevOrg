public with sharing class whatsapGroup {
    @future(callout=true)
    public static void sendMessage(){

        String messageBody = '{"title": "Test Group from Integration","contacts": ["+91 98989 24118", "+91 9558680273"],"verify_every_contact": false}';
        

        String accessToken = System.Label.access_token_for_whatsapp;
        String endpoint = System.Label.Whatsapp_Group_Endpoint;   

        HttpRequest httpReq = new HttpRequest();
        httpReq.setEndpoint(endpoint);
        httpReq.setMethod('POST');
        httpReq.setHeader('Content-Type', 'application/json');
        httpReq.setHeader('Authorization', 'Bearer '+ accessToken);
        httpReq.setBody(messageBody);

        Http http = new Http();
        try {
            HttpResponse response = http.send(httpReq);
        } catch (System.CalloutException ex) {
            System.debug('Execution error is '+ex.getMessage());
        }
    }

}