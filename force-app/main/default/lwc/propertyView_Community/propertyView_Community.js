import { LightningElement, track, api, wire } from 'lwc';
import Property_view_example from '@salesforce/resourceUrl/propertyviewposter';
import getListingData from '@salesforce/apex/propertyListedViewController.getListingData';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import plvimg from '@salesforce/resourceUrl/plvimgs';

export default class propertyView_Community extends NavigationMixin(LightningElement) {

    listingrecordid;
    @track spinnerdatatable = false;

    @track propertyView = Property_view_example;

    @track propertyData = [];
    @track feature_icons;
    @track propertyImages = []; 
    @track livingImages = []; 
    @track guestImages = []; 
    @track kitchenImages = []; 
    @track diningImages = []; 
    @track otherImages = []; 

    @track livingTotal; 
    @track guestTotal; 
    @track kitchenTotal; 
    @track diningTotal; 
    @track otherTotal; 
    @track clickedImage;
    @track imagesOnDescription = [];
    @track totalCountOfImg;
    @track errorMessage = false;

    @track Show_ImagePreview = false;
    @track PreviewImageTitle;
    @track Is_ImageHavePreview = false;
    @track PreviewImageSrc;
    @track PreviewImgSpinner = false;
    @track NotFirstImg = false;
    @track NotLastImg = false;
    @track totalImagesInGallery;

    plvimg1 = plvimg + '/plvimgs/Bedroom.png';
    plvimg2 = plvimg + '/plvimgs/Bathroom.png';
    plvimg3 = plvimg + '/plvimgs/balconyImg.png';
    plvimg4 = plvimg + '/plvimgs/furnished.png';

    isInitalRender = true;
    mapMarkers = [];


    connectedCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        this.listingrecordid = urlParams.get('c__listingrecordid');
        console.log('Listing Record Id:', this.listingrecordid);
        this.getListingDetail();
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

        if (this.isInitalRender) {
            const body = document.querySelector("body");

            const style = document.createElement('style');
            style.innerText = `
                .map lightning-map{
                    width: -webkit-fill-available;
                    height: -webkit-fill-available;
                }

                .map .slds-map:before {
                    display: none !important;
                }
            `;

            body.appendChild(style);
            this.isInitalRender = false;
        }
    }

    get nextImages() {
        return this.propertyImages.slice(0, 4);
    }

    activeClass(event) {
        return event.currentTarget.dataset.id === propertyImages[1].Id ? 'active' : '';
    }

    handleBoxClick() {
        this.template.querySelectorAll(".tab-menu a").forEach(tab => {
            tab.classList.remove("active-tab");
        });

        this.template.querySelectorAll(".tab").forEach(tabContent => {
            tabContent.classList.remove("active-tab-content");
        });

        this.template.querySelector('[data-id="tab2"]').classList.add("active-tab-content");
        this.template.querySelector('[data-tab-id="tab2"]').classList.add("active-tab");
    }

    getListingDetail() {
        this.spinnerdatatable = true;
        getListingData({ recordId: this.listingrecordid }).then((result) => {
            console.log('result: ', result);
            this.propertyData = result.Listings;
            this.feature_icons = result.FeatureIcons;
            this.propertyImages = result.Medias;
            this.totalImagesInGallery = this.propertyImages.length;
            result.Medias.forEach(media => {
                const labelParts = media.ExternalLink__c.split('_');
                const lastPart = labelParts[labelParts.length - 1]; // Get the last part of the label after the last underscore
                console.log('lastpart'+lastPart);
                switch (lastPart) {
                    case 'livingRoom':
                        this.livingImages.push(media);
                        break;
                    case 'diningRoom':
                        this.diningImages.push(media);
                        break;
                    case 'kitchen':
                        this.kitchenImages.push(media);
                        break;
                    case 'guestRoom':
                        this.guestImages.push(media);
                        break;
                    default:
                        this.otherImages.push(media);
                    // Add additional cases for other categories as needed
                }
            });
            this.livingTotal = this.livingImages.length;
            this.diningTotal = this.diningImages.length;
            this.kitchenTotal = this.kitchenImages.length;
            this.guestTotal = this.guestImages.length;
            this.otherTotal = this.otherImages.length;
            this.ogPropertyImages = result.Medias;
            console.log('Image'+result.Medias[0]);
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

            const location = this.getLocationFromRecord(result.Listings);
        
            if (location) {
                console.log('location-->',location);
                this.mapMarkers = [{
                    location,
                    title: 'Location'
                }];
            } else {
                console.error('No location information found in record data');
            }
            if (result.Medias.length > 6) {
                this.imagesOnDescription = result.Medias.slice(0, 6);
                this.totalCountOfImg = this.propertyImages.length - 5;
                setTimeout(() => {
                    let element = this.template.querySelectorAll('.black1')[5];
                    element.classList.add('black_enabled');
                }, 1000);
            } else {
                this.imagesOnDescription = result.Medias;
            }
            setTimeout(() => {
                this.spinnerdatatable = false;
            }, 3000);
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
            var imagePreviewList = [];
            // const imagePreviewList = this.propertyImages;
            var labelParts = this.clickedImage.split('_');
            var lastPart = labelParts[labelParts.length - 1]; // Get the last part of the label after the last underscore
            console.log('lastpart'+lastPart);
            switch (lastPart) {
                case 'livingRoom':
                    imagePreviewList = this.livingImages;
                    break;
                case 'diningRoom':
                    imagePreviewList = this.diningImages;
                    break;
                case 'kitchen':
                    imagePreviewList = this.kitchenImages;
                    break;
                case 'guestRoom':
                    imagePreviewList = this.guestImages;
                    break;
                default:
                    imagePreviewList = this.otherImages;
                // Add additional cases for other categories as needed
            }
            console.log(JSON.stringify(imagePreviewList));
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
        this.clickedImage = imageURL;
        console.log('imageId'+imageId);
        console.log('inmageName'+imageName);
        console.log('imageURL'+imageURL);
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

    applyFilter(event){
        var buttonName = event.target.dataset.name;
        console.log('methos is called-->',buttonName);

        var buttons = this.template.querySelectorAll('.galleryFilterIcon_btn');
        buttons.forEach(function(btn) {
            btn.classList.remove('active');
        });

        // Add 'active' class to the clicked button
        event.target.classList.add('active');

        if (buttonName == 'galleryFilterIcon_all') {
            this.propertyImages = this.ogPropertyImages;
            this.totalImagesInGallery = this.propertyImages.length;
        } else if (buttonName == 'galleryFilterIcon_room') {
            this.propertyImages = this.ogPropertyImages.filter(listing =>{
                return listing.Image_of__c == 'Room';
            });
            this.totalImagesInGallery = this.propertyImages.length;
        } else if (buttonName == 'galleryFilterIcon_kitchen') {
            this.propertyImages = this.ogPropertyImages.filter(listing =>{
                return listing.Image_of__c == 'Kitchen';
            });
            this.totalImagesInGallery = this.propertyImages.length;
        }
    }

    getLocationFromRecord(recordData) {
        if (recordData[0].Street__c && recordData[0].City__c && recordData[0].State__c && recordData[0].Country__c && recordData[0].Postal_Code__c) {
            return {
                Street: recordData[0].Street__c,
                City: recordData[0].City__c,
                State: recordData[0].State__c,
                Country: recordData[0].Country__c,
                PostalCode: recordData[0].Postal_Code__c
            };
        } else if (recordData[0].Area__c && recordData[0].City__c && recordData[0].State__c && recordData[0].Postal_Code__c) {
            return {
                Street: recordData[0].Area__c,
                City: recordData[0].City__c,
                State: recordData[0].State__c,
                PostalCode: recordData[0].Postal_Code__c
            };
        }
        return null;
    }

}