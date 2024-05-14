import { LightningElement, track } from 'lwc';
import { loadScript } from "lightning/platformResourceLoader";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getS3ConfigData from "@salesforce/apex/PropertyController.getS3ConfigSettings";
import AWS_SDK from "@salesforce/resourceUrl/AWSSDK";
import watermarkjs from "@salesforce/resourceUrl/watermarkjs";
import createContactAndProperty from '@salesforce/apex/PropertyController.createContactAndProperty';
import createmedia from "@salesforce/apex/PropertyController.createmediaforlisting";

export default class propertyForm extends LightningElement {
    @track brokerFirstName = '';
    @track brokerLastName = '';
    @track brokerEmail = '';
    @track brokerPhone = '';
    @track propertyLandmark = '';
    @track propertyStreet = '';
    @track propertyCity = '';
    @track propertyState = '';
    @track propertyCountry = '';
    @track selectedPropertyType = '';
    @track propertyDescription = '';
    @track propertyTypeOptions = [
        { label: 'Residentialuse', value: 'Residential' },
        { label: 'Commercial', value: 'Commercial' },
        { label: 'Industrial', value: 'Industrial' },
    ];

    recordId;
    @track selectedFilesToUpload = [];
    @track isnull = true;
    @track disabled_checkbox = true;
    @track fileName = [];
    @track uploadProgress = 0;
    @track fileSize = [];
    @track isfileuploading = false;
    isInitalRender = true;
    @track items = [];
    @track isWatermark = false;
    @track property_id;
    @track fileURL = [];
    @track isdata = false;
    confData;
    isAwsSdkInitialized = false; //flag to check if AWS SDK initialized
    s3; //store AWS S3 object
    @track data = [];
    @track imagesAvail = false;

    connectedCallback() {
        this.getS3ConfigDataAsync();
    }

    renderedCallback() {
        try {
            if (this.isAwsSdkInitialized) {
                return;
            }
            Promise.all([loadScript(this, AWS_SDK), loadScript(this, watermarkjs)])
                .then(() => {
                    console.log('SDK Loaded');
                })
                .catch((error) => {
                    console.error("error -> ", error);
                });
        } catch (error) {
            console.log(' error in render : ', error.messsage);

        }
    }

    handleBrokerFirstNameChange(event) {
        this.brokerFirstName = event.target.value;
        console.log(this.brokerFirstName);
    }

    handleBrokerLastNameChange(event) {
        this.brokerLastName = event.target.value;
        console.log(this.brokerLastName);
    }

    handleBrokerEmailChange(event) {
        this.brokerEmail = event.target.value;
        console.log(this.brokerEmail);
    }

    handleBrokerPhoneChange(event) {
        this.brokerPhone = event.target.value;
        console.log(this.brokerPhone);
    }

    handleLandmarkChange(event) {
        this.propertyLandmark = event.target.value;
        console.log(this.propertyLandmark);
    }

    handleStreetChange(event) {
        this.propertyStreet = event.target.value;
        console.log(this.propertyStreet);
    }

    handleCityChange(event) {
        this.propertyCity = event.target.value;
        console.log(this.propertyCity);
    }

    handleStateChange(event) {
        this.propertyState = event.target.value;
        console.log(this.propertyState);
    }

    async handleSelectedFiles(event) {
        try {
            if (event.target.files.length > 0) {
                for (let file = 0; file < event.target.files.length; file++) {
                    this.selectedFilesToUpload.push(event.target.files[file]);
                    this.isnull = false;
                    this.fileName.push(event.target.files[file].name);
                    this.fileSize.push(Math.floor((event.target.files[file].size) / 1024));
                    this.imagesAvail = true;
                }
                console.log('selectedfile names', this.fileName);
                console.log('selectedfiles', this.selectedFilesToUpload);
                console.log('selectedfile sizes', this.fileSize);
            }

        } catch (error) {
            console.log('error file upload ', error);
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

    handleclick(propertyId) {
        this.property_id = propertyId;
        if (this.property_id) {
            this.isnull = true;
            this.uploadToAWS()
                .then(() => {
                    var contents = [];
                    for (let file = 0; file < this.selectedFilesToUpload.length; file++) {
                        contents.push(createmedia({
                            recordId: this.recordId,
                            externalUrl: this.fileURL[file],
                            Name: this.fileName[file],
                            Size: this.fileSize[file],
                        }));
                    }
                    console.log(contents);
                    return contents;
                }).then(result => {
                    if (result) {
                        this.selectedFilesToUpload = [];
                        this.fileName = [];
                        this.fileSize = [];
                        this.fileURL = [];
                        this.isnull = true;
                    } else {
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: 'Error creating record',
                                message: 'Property not added.',
                                variant: 'error',
                            }),
                        )

                    }
                })
                .catch(error => {
                    alert(error.message);
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error creating record',
                            message: 'Property not added.',
                            variant: 'error',
                        }),
                    );

                    console.error('Error:', error);
                });
        } else {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error creating record',
                    message: 'Property not added.',
                    variant: 'error',
                }),
            );
        }
    }

    async uploadToAWS() {
        try {
            for (let f = 0; f < this.selectedFilesToUpload.length; f++) {
                this.currentFileName = this.fileName[f];
                this.currentFileSize = this.fileSize[f];
                this.initializeAwsSdk(this.confData);
                console.log('inside else');
                console.log(this.selectedFilesToUpload.length);
                console.log('this.selectedFilesToUpload[f]---->', this.selectedFilesToUpload[f]);
                if (this.selectedFilesToUpload[f]) {
                    let objKey = this.fileName[f]
                        .replace(/\s+/g, "_")
                        .toLowerCase();

                    let params = {
                        Key: objKey,
                        ContentType: this.selectedFilesToUpload[f].type,
                        Body: this.selectedFilesToUpload[f],
                        ACL: "public-read"
                    };

                    console.log('params:' + JSON.stringify(params));

                    let upload = this.s3.upload(params);

                    upload.on('httpUploadProgress', function (progress) {
                        console.log('Upload progress:', progress);
                    });

                    upload.send(function (err, data) {
                        if (err) {
                            console.error('Error uploading file:', err);
                            // Handle error here
                        } else {
                            console.log('File uploaded successfully:', data);
                            // Handle success here
                        }
                    });

                    let bucketName = this.confData.S3_Bucket_Name__c;
                    this.fileURL.push(`https://${bucketName}.s3.amazonaws.com/${objKey}`);
                    this.listS3Objects();
                }

                if (f < this.selectedFilesToUpload.length - 1) {
                    this.fileName[f + 1] = this.isWatermark ? this.fileName[f + 1] + 'watermark' : this.fileName[f + 1];
                }
            }
        } catch (error) {
            console.error("Error in uploadToAWS: ", error);
        }
    }

    initializeAwsSdk(confData) {
        try {
            let AWS = window.AWS;

            AWS.config.update({
                accessKeyId: confData.AWS_Access_Key__c,
                secretAccessKey: confData.AWS_Secret_Access_Key__c
            });

            AWS.config.region = confData.S3_Region_Name__c;

            this.s3 = new AWS.S3({
                apiVersion: "2006-03-01",
                params: {
                    Bucket: confData.S3_Bucket_Name__c
                }
            });
            console.log('s3:' + JSON.stringify(this.s3));
            this.isAwsSdkInitialized = true;
        } catch (error) {
            console.log("error initializeAwsSdk ", error);
        }
    }

    listS3Objects() {
        try {
            this.s3.listObjects((err, data) => {
                if (err) {
                    console.log("Error", err);
                } else {
                    console.log("fileURL", this.fileURL);
                    console.log("Success", data.Contents);
                }
            });
        } catch (error) {
            console.log("error ", error);
        }
    }

    async getS3ConfigDataAsync() {
        try {
            this.confData = await getS3ConfigData();
            console.log("check data ", this.confData);
        } catch (error) {
            console.log("error in async ", error);
        }
    }

    handleCountryChange(event) {
        this.propertyCountry = event.target.value;
        console.log(this.propertyCountry);
    }

    handlePropertyTypeChange(event) {
        this.selectedPropertyType = event.detail.value;
        console.log(this.selectedPropertyType);
    }

    handleDescriptionChange(event) {
        this.propertyDescription = event.target.value;
        console.log(this.propertyDescription);
    }

    handleSubmit() {
        createContactAndProperty({
            brokerFirstName: this.brokerFirstName,
            brokerLastName: this.brokerLastName,
            brokerEmail: this.brokerEmail,
            brokerPhone: this.brokerPhone,
            propertyLandmark: this.propertyLandmark,
            propertyStreet: this.propertyStreet,
            propertyCity: this.propertyCity,
            propertyState: this.propertyState,
            propertyCountry: this.propertyCountry,
            propertyType: this.selectedPropertyType,
            propertyDescription: this.propertyDescription
        })
            .then(result => {
                this.recordId = result;
                console.log('Record creation successful: ', result);
                this.brokerFirstName = '';
                this.brokerLastName = '';
                this.brokerEmail = '';
                this.brokerPhone = '';
                this.propertyLandmark = '';
                this.propertyStreet = '';
                this.propertyCity = '';
                this.propertyState = '';
                this.propertyCountry = '';
                this.selectedPropertyType = '';
                this.propertyDescription = '';
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Record created successfully.',
                        variant: 'success',
                    }),
                )
                this.handleclick(this.recordId);
            })
            .catch(error => {
                console.error('Error creating records: ', error.body.message);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Error creating records: ' + error.body.message,
                        variant: 'error',
                    }),
                )
            });
    }

    handleRemove(event) {
        // Get the label of the lightning pill associated with the remove button
        const fileNameToRemove = event.target.closest('lightning-pill').label;
        console.log('Removing file:', fileNameToRemove);

        // Find the index of the file to remove in the fileName array
        const indexToRemove = this.fileName.indexOf(fileNameToRemove);
        console.log(indexToRemove);

        // If the file is found in the array, remove it
        if (indexToRemove !== -1) {
            this.fileName.splice(indexToRemove, 1);
            console.log(this.fileName);
            this.selectedFilesToUpload.splice(indexToRemove, 1);
            this.fileSize.splice(indexToRemove, 1);
            this.isnull = this.fileName.length === 0;
            this.disabled_checkbox = this.fileName.length === 0;
        } else {
            console.error('File not found in fileName array:', fileNameToRemove);
        }
    }
}