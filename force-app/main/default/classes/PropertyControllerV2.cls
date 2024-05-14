// public with sharing class PropertyControllerV2 {
//     @AuraEnabled(cacheable=true)
//     public static CoordinateWrapper getCoordinates(String address) {
//         CoordinateWrapper wrapper = new CoordinateWrapper();
        
//         // Make a callout to OpenStreetMap Nominatim API
//         HttpRequest request = new HttpRequest();
//         request.setEndpoint('https://nominatim.openstreetmap.org/search?format=json&q=' + EncodingUtil.urlEncode(address, 'UTF-8'));
//         request.setMethod('GET');
        
//         Http http = new Http();
//         HttpResponse response = http.send(request);
//         if (response.getStatusCode() == 200) {
//             List<Map<String, Object>> jsonResponse = (List<Map<String, Object>>) JSON.deserializeUntyped(response.getBody());
//             if (!jsonResponse.isEmpty()) {
//                 Map<String, Object> location = jsonResponse[0];
//                 wrapper.latitude = (Double) location.get('lat');
//                 wrapper.longitude = (Double) location.get('lon');
//             }
//         }
        
//         return wrapper;
//     }
    
//     public class CoordinateWrapper {
//         @AuraEnabled
//         public Double latitude { get; set; }
//         @AuraEnabled
//         public Double longitude { get; set; }
//     }
// }


// public with sharing class PropertyControllerV2 {
//     @AuraEnabled(cacheable=true)
//     public static Map<String, Object> geocodeAddress(String address) {
//         System.debug('hello');
//         Map<String, Object> result = new Map<String, Object>();
        
//         // Callout to OpenStreetMap Nominatim API to get coordinates based on address
//         Http http = new Http();
//         HttpRequest request = new HttpRequest();
//         request.setEndpoint('https://nominatim.openstreetmap.org/search?format=json&q=' + EncodingUtil.urlEncode(address, 'UTF-8'));
//         System.debug('https://nominatim.openstreetmap.org/search?format=json&q=' + EncodingUtil.urlEncode(address, 'UTF-8'));
//         request.setMethod('GET');
//         HttpResponse response = http.send(request);
        
//         // Parse the response
//         if (response.getStatusCode() == 200) {
//             List<Object> jsonResponse = (List<Object>) JSON.deserializeUntyped(response.getBody());
//             if (!jsonResponse.isEmpty()) {
//                 Map<String, Object> location = (Map<String, Object>) jsonResponse[0];
                
//                 result.put('latitude', location.get('lat'));
//                 result.put('longitude', location.get('lon'));
//                 result.put('formattedAddress', location.get('display_name'));
//                 System.debug(location);
//             }
//         }
        
//         return result;
//     }    
// }


// public class PropertyControllerV2 {

//     // Method to fetch coordinates based on address
//     @AuraEnabled
//     public static Map<String, Decimal> getCoordinates(String address) {
//         // Initialize variables to store latitude and longitude
//         Decimal latitude;
//         Decimal longitude;

//         Property__c addresss=[SELECT Id,Name, Street__c, City__c, Postal_Code__c, State__c, Country__c,Number_of_Bathrooms__c,Number_of_Bedrooms__c,Number_of_Floors__c  
//                                    FROM Property__c WHERE Street__c != null LIMIT 1 ];

//         String apiUrl = 'https://api.geoapify.com/v1/geocode/search?' + 'street='+addresss.Street__c+'&postcode='+addresss.Postal_Code__c+'&city='+addresss.City__c+'&state='+addresss.State__c+'&country='+addresss.Country__c+'&apiKey=4d9479178e1d4c838946944f2bd5b012';
//         // String apiUrl ='https://maps.app.goo.gl/3fJ9ggbRUoE5TSSc9';
//         String encodedString = apiUrl.replace(' ', '%20').replace(',', '%2C');
//         Http http = new Http();
//         HttpRequest req = new HttpRequest();
//         req.setHeader('Accept', 'application/json');
//         req.setHeader('Content-Type', 'application/json');
//         req.setEndpoint(encodedString);
//         req.setMethod('GET');
    
//         HttpResponse res = http.send(req);
//         if (res.getStatusCode() == 200) {
//             Map<String, Object> results = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
//             List<Object> features = (List<Object>) results.get('features');
//             if (!features.isEmpty()) {
//                 Map<String, Object> geometry = (Map<String, Object>) ((Map<String, Object>) features[0]).get('geometry');
//                 if (geometry != null) {
//                     List<Object> coordinatesList = (List<Object>) geometry.get('coordinates');
//                     if (coordinatesList != null && coordinatesList.size() == 2) {
//                         longitude = (Decimal) coordinatesList[0];
//                         latitude = (Decimal) coordinatesList[1];
//                     }
//                 }
//             }
//         } else {
//             // Handle non-200 response
//             System.debug('Error: ' + res.getBody());
//         }

//         // Create a map to store the latitude and longitude
//         Map<String, Decimal> coordinates = new Map<String, Decimal>();
//         coordinates.put('latitude', latitude);
//         coordinates.put('longitude', longitude);
//         return coordinates;
//     }
// }


public class PropertyControllerV2 {
    @AuraEnabled
    // Method to extract coordinates from Google Maps link
    public static void getCoordinatesFromGoogleMapsLink(String googleMapsLink) {
        // Parse the link to extract latitude and longitude
        Map<String, String> coordinates = parseGoogleMapsLink(googleMapsLink);

        if(coordinates != null && !coordinates.isEmpty()) {
            String latitude = coordinates.get('lat');
            String longitude = coordinates.get('lng');

            // Now you have latitude and longitude, you can use them as needed
            System.debug('Latitude: ' + latitude + ', Longitude: ' + longitude);
        } else {
            System.debug('Invalid Google Maps link');
        }
    }

    // Method to parse Google Maps link and extract latitude and longitude
    private static Map<String, String> parseGoogleMapsLink(String googleMapsLink) {
        Map<String, String> coordinates = new Map<String, String>();

        // Logic to extract latitude and longitude from the link
        // This depends on the format of your Google Maps link
        // You might use regex or other string manipulation methods to extract the coordinates

        // Example regex pattern to extract latitude and longitude from a typical Google Maps link
        String regexPattern = '.*@([-+]?([1-8]?\\d(\\.\\d+)?|90(\\.0+)?)),([-+]?(180(\\.0+)?|((1[0-7]\\d)|([1-9]?\\d))(\\.\\d+)?)).*';
        Pattern pattern = Pattern.compile(regexPattern);
        Matcher matcher = pattern.matcher(googleMapsLink);

        if (matcher.matches() && matcher.groupCount() == 4) {
            coordinates.put('lat', matcher.group(1));
            coordinates.put('lng', matcher.group(4));
        }

        return coordinates;
    }
}