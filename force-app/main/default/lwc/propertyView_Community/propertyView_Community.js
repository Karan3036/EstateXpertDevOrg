import { LightningElement, track, api, wire } from 'lwc';
import property_icons from '@salesforce/resourceUrl/PropertyViewIcons';
import Property_view_example from '@salesforce/resourceUrl/propertyviewposter';
import NextArrowIcon from '@salesforce/resourceUrl/NextArrowIcon';
import PrevArrowIcon from '@salesforce/resourceUrl/PrevArrowIcon';
import map1 from '@salesforce/resourceUrl/map1';
import propertybg from '@salesforce/resourceUrl/propertybg';
import getListingData from '@salesforce/apex/propertyViewController.getListingData';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class propertyView_Community extends NavigationMixin(LightningElement) {

    listingrecordid;
    @track spinnerdatatable = false;
    @track PhoneIcon = property_icons + '/Phone.png';
    @track EmailIcon = property_icons + '/Email.png';

    @track BedroomIcon = property_icons + '/Bedroom.png';
    @track BathroomIcon = property_icons + '/Bathroom.png';
    @track BathroomSqftIcon = property_icons + '/BathroomSqft.png';
    @track SafetyIcon = property_icons + '/SafetyRank1.png';
    @track SafetyIcon2 = property_icons + '/SafetyRank2.png';

    @track CarParkingIcon = property_icons + '/CarParking.png';
    @track SwimmingIcon = property_icons + '/Swimming.png';
    @track GymIcon = property_icons + '/Gym.png';
    @track RestaurantIcon = property_icons + '/Restaurant.png';
    @track WifiIcon = property_icons + '/Wifi.png';
    @track PetCenterIcon = property_icons + '/PetCenter.png';
    @track SportsIcon = property_icons + '/Sports.png';
    @track LaundryIcon = property_icons + '/Vector (4).png';
    @track ParkIcon = property_icons + '/Park.png';
    @track BicycleIcon = property_icons + '/Bicycle.png';
    @track EmergencyIcon = property_icons + '/Emergency.png';
    @track HockeyIcon = property_icons + '/Hockey.png';
    @track LibraryIcon = property_icons + '/Library.png';
    @track BabyParkIcon = property_icons + '/BabyPark.png';

    @track propertyView = Property_view_example;
    @track nextArrowIcon = NextArrowIcon;
    @track prevArrowIcon = PrevArrowIcon;

    @track propertyData = [];
    @track feature_icons;
    @track propertyImages = [];   // @track isResidential;
    @track firstImageToshow;
    @track map1 = map1;
    @track propertybg = propertybg;
    @track errorMessage = false;

    @track Show_ImagePreview = false;
    @track PreviewImageTitle;
    @track Is_ImageHavePreview = false;
    @track PreviewImageSrc;
    @track PreviewImgSpinner = false;
    @track NotFirstImg = false;
    @track NotLastImg = false;


    connectedCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        this.listingrecordid = urlParams.get('c__listingrecordid');
        console.log('Listing Record Id:', this.listingrecordid);
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
        return this.propertyImages.slice(0, 4);
    }

    activeClass(event) {
        return event.currentTarget.dataset.id === propertyImages[1].Id ? 'active' : '';
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

    getPropertyData() {
        this.spinnerdatatable = true;
        getListingData({ recordId: this.listingrecordid }).then((result) => {
            console.log('result: ', result);
            this.propertyData = result.Listings;
            this.feature_icons = result.FeatureIcons;
            this.propertyImages = result.Medias;
            this.propertyData.forEach(row => {
                if (row.Property_Features__c) {
                    const amenitiesArray = row.Property_Features__c.split(";");
                    row.Property_Features__c = amenitiesArray.map(amenity => {
                        return {
                            name: amenity,
                            imgUrl: this.feature_icons[amenity] ? (this.feature_icons[amenity][0] == 'h' ? this.feature_icons[amenity] : 'sfsites/c' + this.feature_icons[amenity]) : 'https://sellmyproperties.in/images/no-property-found.png'
                        };
                    });
                } else {
                    row.Property_Features__c = [];
                }
            });
            console.log('amenties: ', this.propertyData);
            setTimeout(() => {
                this.spinnerdatatable = false;
            }, 5000);
        })
            .catch(error => {
                console.log('Error-->', error);
                this.errorMessage = true;
                setTimeout(() => {
                    this.spinnerdatatable = false;
                }, 3000);
            });

    }

    stopEventPropagation(event) {
        event.stopPropagation();
    }

    closeImagePreview() {
        this.Is_ImageHavePreview = false;
        this.Show_ImagePreview = false;
    }

    handleImageLoaded() {
        this.PreviewImgSpinner = false;
    }

    handleImageNotLoaded() {
        this.Is_ImageHavePreview = false;
        this.PreviewImgSpinner = false;
    }

    changeImg(event) {
        this.Is_ImageHavePreview = false;
        this.Show_ImagePreview = false;
        this.buttonClickName = event.currentTarget.dataset.name;
        this.changeImageHelper(this.PreviewImageId, true);
    }

    changeImageHelper(imageId, nextPreviusBtnClick) {
        try {
            const imagePreviewList = this.propertyImages;
            for (let i in imagePreviewList) {
                if (imagePreviewList[i].Id == imageId) {
                    if (nextPreviusBtnClick == true) {
                        if (this.buttonClickName == 'Previous_Image') {
                            let imageSrc = imagePreviewList[parseInt(i) - 1].FilenameUrlEncoded__c;
                            let imageTitle = imagePreviewList[parseInt(i) - 1].Name;
                            let previewImageId = imagePreviewList[parseInt(i) - 1].Id;
                            this.changeImageHelper(previewImageId, false);
                            this.openCustomPreviewHelper(imageSrc, imageTitle, previewImageId);
                        } else if (this.buttonClickName == 'Next_Image') {
                            let imageSrc = imagePreviewList[parseInt(i) + 1].FilenameUrlEncoded__c;
                            let imageTitle = imagePreviewList[parseInt(i) + 1].Name;
                            let previewImageId = imagePreviewList[parseInt(i) + 1].Id;
                            this.changeImageHelper(previewImageId, false);
                            this.openCustomPreviewHelper(imageSrc, imageTitle, previewImageId);
                        }
                    } else if (nextPreviusBtnClick == false) {
                        // Check if it's the first image
                        if (i == 0) {
                            this.NotFirstImg = false;
                        } else {
                            this.NotFirstImg = true;
                        }

                        // Check if it's the last image
                        if (i == imagePreviewList.length - 1) {
                            this.NotLastImg = false;
                        } else {
                            this.NotLastImg = true;
                        }
                    }
                }
            }
        } catch (error) {
            console.log('error in changeImageHelper : ', error.stack);
        }
    }

    openCustomPreviewHelper(imageSrc, imageTitle, previewImageId) {
        try {
            this.PreviewImageSrc = imageSrc;
            this.PreviewImageTitle = imageTitle;
            this.PreviewImageId = previewImageId;
            this.PreviewImgSpinner = true;
            this.Is_ImageHavePreview = true;
            this.Show_ImagePreview = true;
        } catch (error) {
            console.log(error.message);
        }
    }

    previewAllImages(event) {
        var imageId = event.currentTarget.dataset.id;
        var imageName = event.currentTarget.dataset.name;
        var imageURL = event.currentTarget.dataset.url;
        this.changeImageHelper(imageId, false);
        this.openCustomPreviewHelper(imageURL, imageName, imageId);
    }

    moveToPropertyPage(event) {
        try {
            this[NavigationMixin.Navigate]({
                type: 'comm__namedPage',
                attributes: {
                    name: 'Property_List_View__c',
                }
            });
        } catch (error) {
            console.log('error-->', error);
        }
    }

    toast(title, message, variant) {
        const toastEvent = new ShowToastEvent({
            title,
            message,
            variant
        })
        this.dispatchEvent(toastEvent)
    }

}