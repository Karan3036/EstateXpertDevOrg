import { LightningElement,track,api } from 'lwc';
import property_icons from '@salesforce/resourceUrl/PropertyViewIcons';
import Property_view_example from '@salesforce/resourceUrl/Property_view_example';
import NextArrowIcon from '@salesforce/resourceUrl/NextArrowIcon';
import PrevArrowIcon from '@salesforce/resourceUrl/PrevArrowIcon';
import getPropertyInformation from '@salesforce/apex/propertyViewController.getPropertyInformation';
import getListingData from '@salesforce/apex/propertyViewController.getListingData';


export default class propertyView_Community extends LightningElement {

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

    @track propertyData =[];
    @track feature_icons; 
    @track propertyImages = [];   // @track isResidential;


    connectedCallback(){
        this.getPropertyData();
    }
    renderedCallback() {
        this.template.querySelectorAll("a").forEach(element => {
            element.addEventListener("click", evt => {
                let target = evt.currentTarget.dataset.tabId;

                this.template.querySelectorAll("a").forEach(tabel => {
                    if (tabel === element) {
                        tabel.classList.add("active-tab");
                    } else {
                        tabel.classList.remove("active-tab");
                    }
                });
                this.template.querySelectorAll(".tab").forEach(tabdata => {
                    tabdata.classList.remove("active-tab-content");
                });
                this.template.querySelector('[data-id="' + target + '"]').classList.add("active-tab-content");
            });
        });
    }
    
    get nextImages() {
        // Logic to get the next 4 images in the carousel
        return this.propertyImages.slice(0, 4); // For demonstration, assuming it starts with the second image
    }

    activeClass(event) {
        return event.currentTarget.dataset.id ===propertyImages[1].Id  ? 'active' : '';
    }
    handleBoxClick(event) {
        const selectedImageId = event.currentTarget.dataset.id;
        const selectedIndex = this.propertyImages.findIndex(image => image.Id === selectedImageId);
        if (selectedIndex !== -1) {
            const mainCarousel = this.template.querySelector('.carousel');
            const imageWidth = mainCarousel.clientWidth;
            mainCarousel.scrollLeft = selectedIndex * imageWidth;
            
        }
    }

    // getPropertyData(){
    //     getPropertyInformation({recordId:'a02GA00003voK0eYAE'}).then((result) => {
    //         console.log('result: ',result);
    //         this.propertyData = result.Properties;
    //         this.feature_icons = result.icons;
    //         this.propertyImages = result.PropertyMedias;
    //         this.propertyData.forEach(row => {
    //             if (row.Amenities__c) {
    //                 const amenitiesArray = row.Amenities__c.split(";");
    //                 row.Amenities__c = amenitiesArray.map(amenity => {
    //                     return {
    //                         name: amenity,
    //                         imgUrl:this.feature_icons[amenity]?(this.feature_icons[amenity][0]=='h'?this.feature_icons[amenity]:'sfsites/c'+ this.feature_icons[amenity]):'https://sellmyproperties.in/images/no-property-found.png'
    //                     };
    //                 });
    //             } else {
    //                 row.Amenities__c = [];
    //             }
    //         });
    //         console.log('amenties: ',this.propertyData);
    //     });
    // }
    getPropertyData(){
        getListingData({recordId:'a03GA00002t24DCYAY'}).then((result) => {
            console.log('result: ',result);
            this.propertyData = result.Listings;
            this.feature_icons = result.FeatureIcons;
            this.propertyImages = result.Medias;
            this.propertyData.forEach(row => {
                if (row.Property_Features__c) {
                    const amenitiesArray = row.Property_Features__c.split(";");
                    row.Property_Features__c = amenitiesArray.map(amenity => {
                        return {
                            name: amenity,
                            imgUrl:this.feature_icons[amenity]?(this.feature_icons[amenity][0]=='h'?this.feature_icons[amenity]:'sfsites/c'+ this.feature_icons[amenity]):'https://sellmyproperties.in/images/no-property-found.png'
                        };
                    });
                } else {
                    row.Property_Features__c = [];
                }
            });
            console.log('amenties: ',this.propertyData);
        });
    }












}