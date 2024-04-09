import { LightningElement,track,api } from 'lwc';
import property_icons from '@salesforce/resourceUrl/PropertyViewIcons';
import Property_view_example from '@salesforce/resourceUrl/Property_view_example'
import NextArrowIcon from '@salesforce/resourceUrl/NextArrowIcon'
import PrevArrowIcon from '@salesforce/resourceUrl/PrevArrowIcon'
import getPropertyInformation from '@salesforce/apex/propertyViewController.getPropertyInformation';
// import getIconUrl from '@salesforce/apex/propertyViewController.getIconUrl';


export default class PropertyView extends LightningElement {

    @api recordId;
    @track PhoneIcon = property_icons +'/Phone.png';
    @track EmailIcon = property_icons +'/Email.png';

    @track BedroomIcon = property_icons +'/Bedroom.png';
    @track BathroomIcon = property_icons +'/Bathroom.png';
    @track BathroomSqftIcon = property_icons +'/BathroomSqft.png'; 
    @track SafetyIcon = property_icons +'/SafetyRank1.png';
    @track SafetyIcon2 = property_icons +'/SafetyRank2.png';

    @track CarParkingIcon = property_icons +'/CarParking.png';
    @track SwimmingIcon = property_icons +'/Swimming.png';
    @track GymIcon = property_icons +'/Gym.png';
    @track RestaurantIcon = property_icons +'/Restaurant.png';
    @track WifiIcon = property_icons +'/Wifi.png';
    @track PetCenterIcon = property_icons +'/PetCenter.png';
    @track SportsIcon = property_icons +'/Sports.png';
    @track LaundryIcon = property_icons +'/Vector (4).png';
    @track ParkIcon = property_icons +'/Park.png';
    @track BicycleIcon = property_icons +'/Bicycle.png';
    @track EmergencyIcon = property_icons +'/Emergency.png';
    @track HockeyIcon = property_icons +'/Hockey.png';
    @track LibraryIcon = property_icons +'/Library.png';
    @track BabyParkIcon = property_icons +'/BabyPark.png';

    @track propertyView = Property_view_example;
    @track nextArrowIcon = NextArrowIcon;
    @track prevArrowIcon = PrevArrowIcon;
    @track resourceUrl;
    @track propertyData =[];
    @track feature_icons;
    // @track isResidential;
    // @track isCommercial;
    // @track isIndustrial;



    connectedCallback(){
        this.getPropertyData();
    }


    getPropertyData(){
        getPropertyInformation({recordId:this.recordId}).then((result) => {
            console.log('result: ',result);
            this.propertyData = result.Properties;
            this.feature_icons = result.icons;
            this.propertyData.forEach(row => {
                if (row.Amenities__c) {
                    const amenitiesArray = row.Amenities__c.split(";");
                    row.Amenities__c = amenitiesArray.map(amenity => {
                        return {
                            name: amenity,
                            imgUrl: this.feature_icons[amenity]
                        };
                    });
                } else {
                    row.Amenities__c = [];
                }
            });
            console.log('amenties: ',this.propertyData);
        });
    }

    getResourceUrl(amenty){
        // getIconUrl({AnmentyName:amenty});
        return '/resource/'+amenty;
    }











}