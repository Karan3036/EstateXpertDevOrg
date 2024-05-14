public with sharing class WhatsAppIntegration {
      
    @future(callout=true)
    public static void sendMessage(String toPhone){

        String messageBody =		'{'+
		'    "messaging_product": "whatsapp",'+
		'    "recipient_type": "individual",'+
		'    "to": "'+toPhone+'",'+
		'    "type": "template",'+
		'    "template": {'+
		'        "name": "welcome",'+
		'        "language": {'+
		'            "code": "en"'+
		'        },'+
		'        "components": ['+
		'            {'+
		'                "type": "header",'+
		'                "parameters": ['+
		'                    {'+
		'                        "type": "text",'+
		'                        "text": "MvClouds_Team"'+
		'                    }'+
		'                   '+
		'                ]'+
		'            },'+
		'            {'+
		'                "type": "body",'+
		'                "parameters": ['+
		'                    {'+
		'                        "type": "text",'+
		'                        "text": "Kajal"'+
		'                    }'+
		'                   '+
		'                ]'+
		'            },'+
		'            {'+
		'                "type": "button",'+
		'                "sub_type":"quick_reply",'+
		'                "index":"0",'+
		'                "parameters": ['+
		'                    {'+
		'                        "type": "payload",'+
		'                        "payload": "Checkout"'+
		'                    }'+
		'                   '+
		'                ]'+
		'            }'+
		'        ]'+
		'    }'+
		'}';

        String accessToken = System.Label.access_token_for_whatsapp;
        String endpoint = System.Label.whatsapp_endpoint;   

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