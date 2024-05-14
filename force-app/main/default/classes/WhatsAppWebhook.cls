@RestResource(urlMapping='/Esatewhatsapp/webhooks/v1/*')
global class WhatsAppWebhook {
    
    private static Final String SIGNATURE_VALID_MESSAGE     = 'Signature Verified';
    private static Final String SIGNATURE_NOT_VALID_MESSAGE = 'Signature could not be verified';
    
     @HttpGet // GET
     global static void doGet() {
         RestResponse response = RestContext.response;
         System.debug('Response ==>' + response);
         RestRequest request = RestContext.request;
         System.debug('request ==>' + request);
         if(request.params.get('hub.verify_token') == 'WHATSAPPTOKEN'){
             response.responseBody = Blob.valueOf( request.params.get('hub.challenge') );
         }
     }

    @HttpPost
   global static void doPost() {
       System.debug('InDoPost Method'+RestContext.request.headers.get('hub.verify_tokene'));
       System.debug('InDoPost Method2 '+RestContext.request.params.get('hub.verify_tokene'));
           // Verify Token (Replace with your Verify Token)
        String verifyToken = '7fa1634d4f849b8ced3a249ec4ce8bb7db4d8046'; 
       
        if (RestContext.request.headers.get('hub.verify_token') != verifyToken) {
            System.debug('InDoPost Method If condition');
            // Handle invalid access attempt
            RestContext.response.statusCode = 403;
            //return;
        }

        // Get WhatsApp's raw JSON data 
        System.debug('InDoPost Method before Payload');
        String jsonString = RestContext.request.requestBody.toString();
       System.debug('InDoPost Method after payload:- '+jsonString);

        // Process the payload
        try {
            processWhatsAppPayload(jsonString);
        } catch (Exception e) {
            System.debug('Error processing WhatsApp payload: ' + e.getMessage());
            // Handle the error gracefully - e.g., log to a custom object, send an email, etc.
        }
    }

    private static void processWhatsAppPayload(String jsonString) {
        // Parse the JSON data (Adjust based on WhatsApp's exact structure)
        // 
        System.debug('jsonString'+jsonString);

		List<WhatsAppMessage> parsedMessages = parseMessages(jsonString);
		for (WhatsAppMessage message : parsedMessages) {
   			System.debug('Profile Name: ' + message.profileName);
    		System.debug('Timestamp: ' + message.timestamp);
    		System.debug('Text Body: ' + message.textBody);
    		System.debug('Text Type: ' + message.textType);
		}
        Map<String, List<Object>> payload = (Map<String, List<Object>>) JSON.deserializeUntyped(jsonString); 
        
        System.debug('payload'+payload);
        List<Object> listofmessages = payload.get('entry');
        for (Object messageobj : listofmessages){
            System.debug('messageobj'+messageobj);
            
        //Object messages = messageobj.get('changes')[0].get('value').get('messages');

        // Flexible message handling
        //processWhatsAppMessages(messages); 
        }
    }

    
    private static void processWhatsAppMessages(Object messages) {
        // Check if messages is a list or a single object
        if (messages instanceof List<Object>) {
            // Process a list of messages
            for (Object message : (List<Object>) messages) {
                processSingleMessage((Map<String, Object>) message);
            }
        } else { 
            // Process a single message object
            processSingleMessage((Map<String, Object>) messages);
        }
    }

   private static void processSingleMessage(Map<String, Object> message) {
        String senderId = (String) message.get('from'); 
        String messageType = (String) message.get('type');

        if (messageType.equalsIgnoreCase('text')) {
            Map<String, Object> text = (Map<String, Object>) message.get('text');
            String messageBody = (String) text.get('body');

            // Create a new Case
            Case newCase = new Case(
                Subject = 'WhatsApp Inquiry',
                Origin = 'WhatsApp',
                Description = messageBody,
                SuppliedPhone = senderId 
            );
            insert newCase;


               // Send a reply
               String replyMessage = 'Thank you for your message. We will get back to you shortly.';
               sendWhatsAppTextMessage(senderId, replyMessage); 

           } else if (messageType.equals('interactive')) {
               // Handle interactive messages
           } // ... other message types
       }

   private static void sendWhatsAppTextMessage(String senderId, String replyMessage) {
       // Implement the WhatsApp Cloud API call to send a message using HTTPRequest
       // You'll need your WhatsApp API Access Token and Phone Number ID
   }
    
    
    
    
    public class WhatsAppMessage {
        public String profileName {get; set;}
        public String timestamp {get; set;}
        public String textBody {get; set;}
        public String textType {get; set;}
    }

    public static List<WhatsAppMessage> parseMessages(String jsonString) {
        List<WhatsAppMessage> messages = new List<WhatsAppMessage>();

        Map<String, Object> jsonMap = (Map<String, Object>) JSON.deserializeUntyped(jsonString);
        List<Object> entries = (List<Object>) jsonMap.get('entry');

        if (entries != null && !entries.isEmpty()) {
            for (Object entryObj : entries) {
                Map<String, Object> entry = (Map<String, Object>) entryObj;
                List<Object> changes = (List<Object>) entry.get('changes');

                if (changes != null && !changes.isEmpty()) {
                    for (Object changeObj : changes) {
                        Map<String, Object> change = (Map<String, Object>) changeObj;
                        Map<String, Object> value = (Map<String, Object>) change.get('value');
                        List<Object> contacts = (List<Object>) value.get('contacts');

                        if (contacts != null && !contacts.isEmpty()) {
                            for (Object contactObj : contacts) {
                                Map<String, Object> contact = (Map<String, Object>) contactObj;
                                Map<String, Object> profile = (Map<String, Object>) contact.get('profile');
                                String profileName = (String) profile.get('name');

                                List<Object> messagesList = (List<Object>) value.get('messages');
                                if (messagesList != null && !messagesList.isEmpty()) {
                                    for (Object messageObj : messagesList) {
                                        Map<String, Object> message = (Map<String, Object>) messageObj;

                                        WhatsAppMessage msg = new WhatsAppMessage();
                                        msg.profileName = profileName;
                                        msg.timestamp = (String) message.get('timestamp');

                                        Map<String, Object> text = (Map<String, Object>) message.get('text');
                                        msg.textBody = (String) text.get('body');
                                        msg.textType = (String) message.get('type');

                                        messages.add(msg);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return messages;
    }
 

}