public class InquiryController {
    public Inquiry__c inquiry { get; set; }
    
    public InquiryController() {
        inquiry = new Inquiry__c();
    }
    
    public PageReference saveInquiry() {
        try {
            insert inquiry;
            ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.INFO, 'Inquiry saved successfully.'));
        } catch(Exception e) {
            ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.ERROR, 'Error saving inquiry: ' + e.getMessage()));
        }
        return null;
    }
}