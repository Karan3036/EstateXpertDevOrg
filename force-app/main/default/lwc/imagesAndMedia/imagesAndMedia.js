import { LightningElement, track, api } from 'lwc';
import { loadScript } from "lightning/platformResourceLoader";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import getS3ConfigData from "@salesforce/apex/imagesAndMediaController.getS3ConfigSettings";
import AWS_SDK from "@salesforce/resourceUrl/AWSSDK";
import watermarkjs from "@salesforce/resourceUrl/watermarkjs";
import buffer from 'c/buffer';
import createmedia from "@salesforce/apex/imagesAndMediaController.createmediaforlisting";

export default class ImagesAndMedia extends LightningElement {

    @api recordId;
    @track selectedFilesToUpload = [];
    @track isnull = true;
    @track disabled_checkbox = true;
    @track fileName = [];
    @track uploadProgress = 0;
    @track fileSize = [];
    @track isfileuploading = false;
    isInitalRender = true;
    @track items = [];
    @track isWatermark = true;
    @track property_id;
    @track fileURL = [];
    @track isdata = false;
    confData;
    isAwsSdkInitialized = false; //flag to check if AWS SDK initialized
    s3; //store AWS S3 object
    @track data = [];

    connectedCallback() {
        console.log('In the connected callback');
        console.log('record Id-->',this.recordId);
        this.property_id = this.recordId;
        this.showSpinner = true;
        this.getS3ConfigDataAsync();
        this.showSpinner = false;
    }

    renderedCallback() {
        try {
            if (this.isInitalRender) {
                console.log("Rendering");
                const body = document.querySelector("body");

                const style = document.createElement('style');
                style.innerText = `
                    .imagesAndMediaClass article{
                        border: 1px solid rgba(0, 0, 0, 1) !important;
                        padding: 20px !important;
                    }
                    
                    .imagesAndMediaClass .slds-file-selector_images .slds-file-selector__dropzone {
                        flex-direction: column !important;
                        border: 1px dashed rgba(24, 73, 214, 1) !important;
                    }
                `;

                body.appendChild(style);
                this.isInitalRender = false;
            }
            if (this.isAwsSdkInitialized) {
                return;
            }
            Promise.all([loadScript(this, AWS_SDK),loadScript(this, watermarkjs)])
                .then(() => {
                    //For demo, hard coded the Record Id. It can dynamically be passed the record id based upon use cases
                    console.log("sdk Loaded");
                })
                .catch((error) => {
                    console.error("error -> ", error);
                });
        } catch (error) {
            console.log(' error in render : ', error.messsage);

        }
    }

    async handleSelectedFiles(event) {
        try {
            if (event.target.files.length > 0) {
                for (let file = 0; file < event.target.files.length; file++) {
                    this.selectedFilesToUpload.push(event.target.files[file]);
                    this.isnull = false;
                    this.disabled_checkbox = false;
                    this.fileName.push(event.target.files[file].name);
                    this.fileSize.push(Math.floor((event.target.files[file].size) / 1024));
                }

                console.log("fileName ====> " + this.fileName);
                console.log("fileSize ====> " + this.fileSize);

            }

        } catch (error) {
            console.log('error file upload ', error);
        }
    }

    handleDrop(event) {
        event.preventDefault();
        console.log("handleDrop triggered");
        const files = event.dataTransfer.files;
        console.log(files);
        console.log(files[0].type);
        if (event.dataTransfer.files.length > 0 && (files[0].type == 'image/png' || files[0].type == 'image/jpg' || files[0].type == 'image/jpeg')) {
            for (let file = 0; file < event.dataTransfer.files.length; file++) {
                this.selectedFilesToUpload.push(event.dataTransfer.files[file]);
                this.isnull = false;
                this.disabled_checkbox = false;
                this.fileName.push(event.dataTransfer.files[file].name);
                this.fileSize.push(Math.floor((event.dataTransfer.files[file].size) / 1024));
            }
            console.log("fileName1 ====> " + this.fileName);
            console.log("fileSize1 ====> " + this.fileSize);
        }
        else {
            this.toast('Error', 'File type Incorrect!!!', 'Error')
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

    allowDrop(event) {
        event.preventDefault();
    }

    handleRemove(event) {
        try {
            this.selectedFilesToUpload.splice(event.target.key, 1);
            this.isnull = false;
            this.fileName.splice(event.target.key, 1);
            this.fileSize.splice(event.target.key, 1);
            this.items.splice(event.target.key, 1);

            console.log("Selectedfile ====> " + this.selectedFilesToUpload);
            console.log("fileName ====> " + this.fileName);
            console.log("fileSize ====> " + this.fileSize);
            if (this.fileName.length === 0) {
                this.isnull = true;
                this.disabled_checkbox = true;
            }
        } catch (error) {
            console.log('error-->', error);
        }

    }

    save_changes() {
        this.toast('Error', 'Work is currently in progress. We kindly ask for your patience.', 'Error');
    }

    cancel_changes() {
        this.toast('Error', 'Work is currently in progress. We kindly ask for your patience.', 'Error');
    }

    modalpopup() {
        this.toast('Error', 'Work is currently in progress. We kindly ask for your patience.', 'Error');
    }

    to_deleteAllMedia() {
        this.toast('Error', 'Work is currently in progress. We kindly ask for your patience.', 'Error');
    }

    watermark_value(event) {
        console.log("checkedval:", event.target.checked);
        this.isWatermark = event.target.checked;
    }

    removefile() {
        this.selectedFilesToUpload = [];
        this.fileName = [];
        this.fileSize = [];
        this.isnull = true;
        this.disabled_checkbox = true;
    }

    handleclick() {
        if (this.property_id) {
            this.isnull = true;
            this.disabled_checkbox = true;
            this.uploadToAWS()
                .then(() => {
                    var contents = [];
                    for (let file = 0; file < this.selectedFilesToUpload.length; file++) {
                        contents.push(createmedia({
                            recordId: this.recordId,
                            Url: this.fileURL[file],
                            Name: this.fileName[file],
                            Size: this.fileSize[file],
                        }));
                    }
                    console.log('contents', contents);
                    return contents;
                }).then(result => {
                    if (result) {
                        console.log('result', result);
                        console.log('data', this.data);
                        this.selectedFilesToUpload = [];
                        this.fileName = [];
                        this.fileSize = [];
                        this.fileURL = [];
                        this.isnull = true;
                        this.isdata = true;
                        this.disabled_checkbox = true;
                        this.isWatermark = true;
                    }
                    else {
                        this.toast('Error creating record', 'Property not added!', 'Error');
                    }
                    refreshApex(this.data);
                    console.log(result);
                })
                .catch(error => {
                    this.toast('Error creating record', 'Property not added!!', 'Error');
                    console.error('Error:', error);
                });
        } else {
            this.toast('Error creating record', 'Property not added!!!', 'Error');
        }
    }

    async uploadToAWS() {
        debugger;
        try {
            for (let f = 0; f < this.selectedFilesToUpload.length; f++) {
                this.initializeAwsSdk(this.confData);
                if (this.isWatermark === true) {

                    let outImage = await this.imageWithWatermark(this.selectedFilesToUpload[f]);
                    console.log('outImage : ', outImage);
                    console.log('outImage : ', typeof (outImage));
                    const format = outImage.substring(outImage.indexOf('data:') + 5, outImage.indexOf(';base64'));

                    // We need to get the actual file data from the string without the base64 prefix
                    const base64String = outImage.replace(/^data:image\/\w+;base64,/, '');
                    const Buffer = buffer.Buffer;
                    const buff = new Buffer(base64String, 'base64');

                    if (buff) {
                        let objKey = this.fileName[f]
                            .replace(/\s+/g, "_")
                            .toLowerCase() + 'Watermark';
                        console.log("objkey-----", objKey);
                        let params = {
                            Key: objKey,
                            ContentType: 'image/jpeg',
                            Body: buff,
                            ContentEncoding: 'base64',
                            ACL: "public-read"
                        };

                        let upload = this.s3.upload(params);
                        this.isfileuploading = true;
                        upload.on('httpUploadProgress', (progress) => {
                            // Calculate and update the upload progress
                            this.uploadProgress = Math.round((progress.loaded / progress.total) * 100);
                            console.log("Upload progress: ", this.uploadProgress);
                        });

                        console.log("Starting upload...");

                        await upload.promise(); // Wait for the upload to complete

                        console.log("Upload completed successfully!");

                        let bucketName = this.confData.S3_Bucket_Name__c;
                        this.fileURL.push(`https://${bucketName}.s3.amazonaws.com/${objKey}`);
                        console.log("Success");
                        this.isfileuploading = false;
                        this.uploadProgress = 0;
                        this.listS3Objects();
                    }
                } else {
                    console.log('list: ', this.selectedFilesToUpload.length);
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

                        // Use S3 upload method for progress tracking (no need for ManagedUpload constructor)
                        let upload = this.s3.upload(params);
                        this.isfileuploading = true;
                        upload.on('httpUploadProgress', (progress) => {
                            // Calculate and update the upload progress
                            this.uploadProgress = Math.round((progress.loaded / progress.total) * 100);
                            console.log("Upload progress: ", this.uploadProgress);
                        });

                        console.log("Starting upload...");

                        await upload.promise(); // Wait for the upload to complete

                        console.log("Upload completed successfully!");

                        let bucketName = this.confData.S3_Bucket_Name__c;
                        this.fileURL.push(`https://${bucketName}.s3.amazonaws.com/${objKey}`);
                        console.log("Success");
                        this.isfileuploading = false;
                        this.uploadProgress = 0;
                        this.listS3Objects();
                    }
                }

            }

        } catch (error) {
            console.error("Error in uploadToAWS: ", error);
        }
    }

    //Initializing AWS SDK
    initializeAwsSdk(confData) {
        try {
            let AWS = window.AWS;
            console.log("inside confData", confData);
            console.log("inside initializeAwsSdk", AWS);

            AWS.config.update({
                accessKeyId: confData.AWS_Access_Key__c, //Assigning access key id
                secretAccessKey: confData.AWS_Secret_Access_Key__c //Assigning secret access key
            });

            AWS.config.region = confData.S3_Region_Name__c; //Assigning region of S3 bucket

            this.s3 = new AWS.S3({
                apiVersion: "2006-03-01",
                params: {
                    Bucket: confData.S3_Bucket_Name__c //Assigning S3 bucket name
                }
            });

            this.isAwsSdkInitialized = true;
        } catch (error) {
            console.log("error initializeAwsSdk ", error);
        }
    }

    async imageWithWatermark(image) {
        try {
            let file = image;
            console.log(' file===========> ', file);
            const watermarkedImage = await watermark([file])
                .image(watermark.text.center('EstateXpert', '30em sans-serif', '#fff', 0.5));
            console.log('counter ', watermarkedImage);
            return watermarkedImage.src;
        } catch (error) {
            console.log(error);
            throw error; // Re-throw the error if any
        }
    }

    //listing all stored documents from S3 bucket
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
}