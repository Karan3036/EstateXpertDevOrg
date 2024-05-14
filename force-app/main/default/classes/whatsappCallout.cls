@RestResource(urlMapping='/whatsapp/kajal/v1/*')
global class whatsappCallout {
   
    @HttpGet
    global static void doGet(){
        RestResponse response = RestContext.response;
        RestRequest request = RestContext.request;
        if(request.params.get('hub.verify_token')=='MYWHATSAPPTOKEN'){
            response.responseBody = Blob.valueOf(request.params.get('hub.challenge'));
        }
    }

    
}