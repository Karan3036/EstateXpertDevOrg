import { LightningElement,track } from 'lwc';
import property_icons from '@salesforce/resourceUrl/PropertyView_Icons';
import Property_view_example from '@salesforce/resourceUrl/Property_view_example'
import NextArrowIcon from '@salesforce/resourceUrl/NextArrowIcon'
import PrevArrowIcon from '@salesforce/resourceUrl/PrevArrowIcon'


export default class PropertyView extends LightningElement {

    @track PhoneIcon = property_icons +'/Phone.png';
    @track EmailIcon = property_icons +'/Email.png';
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
    @track propertyView = Property_view_example;
    @track nextArrowIcon = NextArrowIcon;
    @track prevArrowIcon = PrevArrowIcon;












}