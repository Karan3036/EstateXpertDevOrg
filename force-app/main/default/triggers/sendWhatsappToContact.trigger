trigger sendWhatsappToContact on Contact (after insert) {
     String countryCode = '91'; 
     for (Contact newContact : Trigger.new) {
         String phoneCon = countryCode + newContact.MobilePhone;
        WhatsAppIntegration.sendMessage(phoneCon);
    }    
}