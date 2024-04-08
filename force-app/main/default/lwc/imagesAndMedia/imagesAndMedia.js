import { LightningElement, track, api, wire } from "lwc";
import getS3ConfigData from "@salesforce/apex/imagesAndMediaController.getS3ConfigSettings";
import { loadScript } from "lightning/platformResourceLoader";
import AWS_SDK from "@salesforce/resourceUrl/AWSSDK";
import fetchdata from "@salesforce/apex/imagesAndMediaController.fetchdataforlisting";
import createmedia from "@salesforce/apex/imagesAndMediaController.createmediaforlisting";
import deletemedia from "@salesforce/apex/imagesAndMediaController.deletelistingmedia";
import update_media_name from "@salesforce/apex/imagesAndMediaController.update_media_name";
import updateOrderState from '@salesforce/apex/imagesAndMediaController.updateOrderState';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from '@salesforce/apex';
import updateSortOrder from '@salesforce/apex/imagesAndMediaController.updateSortOrder';
import watermarkjs from "@salesforce/resourceUrl/watermarkjs";
import buffer from 'c/buffer';

export default class UploadImage extends LightningElement {

    @api recordId;

    s3;
    isAwsSdkInitialized = false;
    @track currentFileName = '';
    @track currentFileSize = '';
    @track uploadingFiles = []; 
    @track selectedFilesToUpload = [];
    @track showSpinner = false;
    @track fileName = [];
    @track uploadProgress = 0;
    @track fileSize = [];
    @track isfileuploading = false;
    @track data = [];
    @track isModalOpen = false;
    @track modalImageUrl;
    @track isnull = true;
    @track isdata = false;
    @track isdeleteAllButton = true;
    @track ispopup = false;
    @track isedit = false;
    @track isdeleteAll = false;
    @track isWatermark = true;
    @track rec_id_to_delete;
    @track deleteObjNameInS3;
    @track disabled_cancel = true;
    @track imageUrl_to_upload;
    @track isdelete = false;
    @track rec_id_to_update = [];
    @track undelete = false;
    @track disabled_save = true;
    @track disabled_checkbox = true;
    @track current_img_name;
    @track img_old_name = [];
    @track img_name = [];
    @track imageTitle_to_upload;
    @track selected_url_type = 'Image';
    @track Expose = [];
    @track Website = [];
    @track Portal = [];
    @track sortOn = [];
    @track expose_records_to_update = [];
    @track portal_records_to_update = [];
    @track website_records_to_update = [];
    @track expose_records_to_update_false = [];
    @track portal_records_to_update_false = [];
    @track website_records_to_update_false = [];
    @track leaveTimeout;
    @track disabled_upload = true;
    @track items = [];
    @track event_img_name;
    @track floorplan_checked = false;
    @track virtual_tour_checked = false;
    @track tour_checked = false;
    @track picklistValues = [];
    @track finalPicklistValues = [];
    isInitalRender = true;
    initialValues = {};
    isSaveDisabled = true;
    nameIsChanged = false;
    tagIsChanged = false;
    get options() {
        return [
            { label: 'Image', value: 'Image' },
            { label: 'Video', value: 'Video' }
        ];
    }

    connectedCallback() {
        this.getS3ConfigDataAsync();
        this.fetchingdata();
    }

    save_changes() {
        if (this.expose_records_to_update || this.website_records_to_update || this.portal_records_to_update || this.expose_records_to_update_false || this.website_records_to_update_false || this.portal_records_to_update_false) {
            updateOrderState({
                expose_ids: this.expose_records_to_update,
                website_ids: this.website_records_to_update,
                portal_ids: this.portal_records_to_update,
                expose_ids_false: this.expose_records_to_update_false,
                website_ids_false: this.website_records_to_update_false,
                portal_ids_false: this.portal_records_to_update_false
            }).then(result => {
                this.ispopup = false;
                this.expose_records_to_update = [];
                this.website_records_to_update = [];
                this.portal_records_to_update = [];
                this.disabled_save = true;
                this.disabled_cancel = true;
                this.fetchingdata();
            });
        }

        this.save_order();
    }

    cancel_changes() {
        this.disabled_save = true;
        this.disabled_cancel = true;
        this.img_name = [];
        this.img_old_name = [];
        this.rec_id_to_update = [];
        this.picklistValues = [];
        this.finalPicklistValues = [];
        this.website_records_to_update = [];
        this.expose_records_to_update = [];
        this.portal_records_to_update = [];
        this.expose_records_to_update_false = [];
        this.website_records_to_update_false = [];
        this.portal_records_to_update_false = [];
        this.data = null;
        this.fetchingdata();
    }

    modalpopup() {
        this.disabled_upload = true;
        this.ispopup = true;
    }

    // To upload image using url
    store_url(event) {
        if (event.target.label === 'Title') {
            this.imageTitle_to_upload = event.target.value;
        }
        if (event.target.label === 'External Link (URL)') {
            this.imageUrl_to_upload = event.target.value;
        }
        if (this.imageUrl_to_upload && this.imageTitle_to_upload) {
            this.disabled_upload = false;
        } else {
            this.disabled_upload = true;
        }
    }

    handleLinkType(event) {
        this.selected_url_type = event.target.value;
    }

    createThumb(videoUrl) {
        const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = videoUrl.match(regex);
        return match ? match[1] : null;
    }

    

    upload_image() {
        if (this.imageTitle_to_upload && this.imageUrl_to_upload) {
            this.ispopup = false;
            if (this.selected_url_type === 'Image') {
                createmedia({
                    recordId: this.recordId,
                    externalUrl: this.imageUrl_to_upload,
                    Name: this.imageTitle_to_upload,
                }).then(result => {
                    this.fetchingdata();
                    this.isedit = false;
                    this.imageTitle_to_upload = null;
                    this.isnull = true;
                })
                .catch(error => {
                    this.toast('Error creating record', 'Image URL is Invalid.', 'Error');
                    this.fetchingdata();
                    console.error('Error:', error);
                });
            } else if (this.selected_url_type === 'Video') {
                const videoId = this.createThumb(this.imageUrl_to_upload);
                this.ispopup = false;
                createmedia({
                    recordId: this.recordId,
                    externalUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
                    Name: this.imageTitle_to_upload,
                    externalUrl: this.imageUrl_to_upload
                }).then(result => {
                    this.ispopup = false;
                    this.fetchingdata();
                    this.isedit = false;
                    this.imageTitle_to_upload = null;
                    this.isnull = true;
                })
                .catch(error => {
                    this.toast('Error creating record', 'Video URL is Invalid.', 'Error');
                    console.error('Error:', error);
                });
            }
        } else {
            this.toast('Error', 'Image URL and file name are required.', 'Error');
        }
    }

    to_deleteAllMedia() {
        this.isdeleteAll = true;
    }

    deleteAllMedia() {
        try {
            this.showSpinner = true;
            this.isdeleteAll = false;
            deletemedia({ property_id: this.recordId }).then(() => {
                this.fetchingdata();
            })
        } catch (error) {
            console.error('Error deleting media:', error);
        } finally {
            this.showSpinner = false;
        }
    }


    // update image name
    store_img_name(event) {
        this.event_img_name = event.target.value;
        this.current_img_name = event.target.value;
        this.checkChanges();
    }

    edit_image_name_to_store(event) {
        this.isedit = true;
        this.rec_id_to_update.push(event.currentTarget.dataset.key);
        this.current_img_name = event.currentTarget.dataset.name;
        this.img_old_name.push(event.currentTarget.dataset.name);
        this.floorplan_checked = false;
        this.virtual_tour_checked = false;
        this.tour_checked = false;
        this.initialValues = {
            current_img_name: event.currentTarget.dataset.name,
            floorplan_checked: this.floorplan_checked,
            virtual_tour_checked: this.virtual_tour_checked,
            tour_checked: this.tour_checked
        };
        let list_check = event.currentTarget.dataset.tags.split(",");
        if (list_check.length > 0) {
            for (let tags_name = 0; tags_name < list_check.length; tags_name++) {
                if (list_check[tags_name] === 'Floorplan') {
                    this.floorplan_checked = true;
                    this.picklistValues.push(list_check[tags_name]);
                }
                if (list_check[tags_name] === 'Virtual Tour') {
                    this.virtual_tour_checked = true;
                    this.picklistValues.push(list_check[tags_name]);
                }
                if (list_check[tags_name] === '360tour') {
                    this.tour_checked = true;
                    this.picklistValues.push(list_check[tags_name]);
                }
            }
        }
    }

    confirm_edit() {
        if (this.event_img_name != undefined) {
            this.img_name.push(this.event_img_name);
        }
        else {
            this.img_name.push(this.img_old_name[this.img_old_name.length - 1])
        }
        this.finalPicklistValues.push(this.picklistValues);
        let rec_id = this.rec_id_to_update[this.rec_id_to_update.length - 1];
        let index_of_record = this.data.findIndex(item => item.Id === rec_id);
        this.data[index_of_record].Tags__c = this.picklistValues;
        if (this.event_img_name != undefined) {
            this.data[index_of_record].Name = this.event_img_name;
        }
        this.event_img_name = undefined;
        this.picklistValues = [];
        this.isedit = false;
        this.isChangesMade = true;
        this.edit_image_name();
    }

    edit_image_name() {
        const isNameChanged = this.initialValues.current_img_name !== this.event_img_name;
        console.log('isNameChanged-->',isNameChanged);
        const isFloorplanChanged = this.initialValues.floorplan_checked !== this.floorplan_checked;
        console.log('isFloorplanChanged-->',isFloorplanChanged);
        const isVirtualTourChanged = this.initialValues.virtual_tour_checked !== this.virtual_tour_checked;
        console.log('isVirtualTourChanged-->',isVirtualTourChanged);
        const isTourChanged = this.initialValues.tour_checked !== this.tour_checked;
        console.log('isTourChanged-->',isTourChanged);
        if (this.nameIsChanged) {
                console.log('In if of edit image name');
                for (let img = 0; img < this.img_name.length; img++) {
                    let oldKey = this.img_old_name[img].replace(/\s+/g, "_").toLowerCase();
                    let newkey = this.img_name[img].replace(/\s+/g, "_").toLowerCase();
                    this.updateFileNameInS3(oldKey, newkey).then(() => {
                        this.isedit = false;
                        return update_media_name({
                            id: this.rec_id_to_update[img],
                            fileName: this.img_name[img],
                            url: `https://${this.confData.S3_Bucket_Name__c}.s3.amazonaws.com/${newkey}`,
                            externalUrl: this.imageUrl_to_upload,
                            picklistValues: this.finalPicklistValues[img].length > 0 ? this.finalPicklistValues[img] : null

                        });
                    }).then(result => {
                        this.event_img_name = undefined;
                        this.img_name = [];
                        this.img_old_name = [];
                        this.rec_id_to_update = [];
                        this.picklistValues = [];
                        this.finalPicklistValues = [];
                        this.fetchingdata();
                        this.isnull = true;
                    });
                }

        } else if (this.tagIsChanged) {
            console.log('in else if');
            for (let img = 0; img < this.img_old_name.length; img++) {
                let oldKey = this.img_old_name[img].replace(/\s+/g, "_").toLowerCase();
                update_media_name({
                    id: this.rec_id_to_update[img],
                    fileName: this.img_old_name[img],
                    url: `https://${this.confData.S3_Bucket_Name__c}.s3.amazonaws.com/${oldKey}`,
                    externalUrl: this.imageUrl_to_upload,
                    picklistValues: this.finalPicklistValues[img].length > 0 ? this.finalPicklistValues[img] : null
                }).then(result => {
                    this.event_img_name = undefined;
                    this.img_name = [];
                    this.img_old_name = [];
                    this.rec_id_to_update = [];
                    this.picklistValues = [];
                    this.finalPicklistValues = [];
                    this.fetchingdata();
                    this.isnull = true;
                });

            }
        } else {
            console.log('in else');
        }
    }

    closepopup_edit() {
        let rec_id = this.rec_id_to_update[this.rec_id_to_update.length - 1];
        this.picklistValues = [];
        this.isedit = false;
        this.img_old_name.pop();
        this.rec_id_to_update.pop();

        this.current_img_name = this.initialValues.current_img_name;
        this.floorplan_checked = this.initialValues.floorplan_checked;
        this.virtual_tour_checked = this.initialValues.virtual_tour_checked;
        this.tour_checked = this.initialValues.tour_checked;

        this.isSaveDisabled = true;
    }

    async updateFileNameInS3(oldKey, newKey) {
        try {
            this.initializeAwsSdk(this.confData);
            let bucketName = this.confData.S3_Bucket_Name__c;
            await this.s3.copyObject({
                CopySource: `/${bucketName}/${oldKey}`,
                Key: newKey,
                ACL: 'public-read',
            }).promise();
            await this.s3.deleteObject({
                Bucket: bucketName,
                Key: oldKey,
            }).promise();

        } catch (error) {
            console.error('Error updating file name in S3:', error);
        }
    }

    async deleteFileInAWS() {
        try {
            this.initializeAwsSdk(this.confData);
            var oldKey = this.deleteObjNameInS3.replace(/\s+/g, "_").toLowerCase();
            let bucketName = this.confData.S3_Bucket_Name__c;
            await this.s3.deleteObject({
                Bucket: bucketName,
                Key: oldKey,
            }).promise();

        } catch (error) {
            console.error('Error delete file in S3:', error);
        }
    }

    // To close popup window
    closepopup() {
        this.ispopup = false;
        this.isdelete = false;
        this.isedit = false;
        this.disabled_cancel = true;
        this.disabled_save = true;
        this.isdeleteAll = false;
    }

    showImageInModal(imageUrl) {
        this.modalImageUrl = imageUrl;
        this.isModalOpen = true;
    }

    //to save the sorting order
    save_order() {
        if (this.sortOn.includes('Expose')) {
            this.save_order_in_apex('Expose', this.Expose);
        }
        if (this.sortOn.includes('Website')) {
            this.save_order_in_apex('Website', this.Website);
        }
        if (this.sortOn.includes('Portal')) {
            this.save_order_in_apex('Portal', this.Portal);
        }
        this.sortOn = [];
    }

    //to save the sorting order in apex
    save_order_in_apex(type, mediaList) {
        let mediaIds = mediaList.map(media => media.Id);
        let mediaListToSave = mediaList.map((media, index) => {
            let mediaObject = {
                Id: media.Id,
            };
            return mediaObject;
        });
        if (type === 'Expose') {

            for (let i = 0; i < mediaListToSave.length; i++) {
                mediaListToSave[i].SortOnExpose__c = i;
            }
        }
        if (type === 'Website') {

            for (let i = 0; i < mediaListToSave.length; i++) {
                mediaListToSave[i].SortOnWebsite__c = i;
            }
        }
        if (type === 'Portal') {

            for (let i = 0; i < mediaListToSave.length; i++) {
                mediaListToSave[i].SortOnPortalFeed__c = i;
            }
        }
        //pass the mediaListToSave to apex method named updateSortOrder and takes parameter list of PropertyMedia__c as mediaList to update the sort order
        updateSortOrder({ mediaList: mediaListToSave })
            .then(result => {
                if (result) {
                    debugger;
                }
            })
            .catch(error => {
                console.error('Error updating sort order:', error);
            });
    }

    // To delete media
    handleDelete() {
        try {
            this.isdelete = false;
            deletemedia({ id: this.rec_id_to_delete }).then(() => {
                this.fetchingdata();
            });
            this.deleteFileInAWS();
        } catch (error) {
            console.error('Error deleting media:', error);
        }
    }

    // To delete all media
    removefile() {
        this.selectedFilesToUpload = [];
        this.fileName = [];
        this.fileSize = [];
        this.isnull = true;
    }

    closeModal() {
        this.isModalOpen = false;
    }

    get formattedData() {
        return this.data.map(item => ({
            ...item,
            Size__c: `${item.Size__c}kb`
        }));
    }

    storeCheckedValue(event) {
        if (event.target.name === 'expose') {
            if (event.detail.checked === true) {
                this.expose_records_to_update.push(event.currentTarget.dataset.key);
                this.disabled_save = false;
                this.disabled_cancel = false;

            } else {
                this.expose_records_to_update_false.push(event.currentTarget.dataset.key);
                this.disabled_save = false;
                this.disabled_cancel = false;
            }
        }
        if (event.target.name === 'website') {
            if (event.detail.checked === true) {
                this.website_records_to_update.push(event.currentTarget.dataset.key);
                this.disabled_save = false;
                this.disabled_cancel = false;
            } else {
                this.website_records_to_update_false.push(event.currentTarget.dataset.key);
                this.disabled_save = false;
                this.disabled_cancel = false;
            }
        }
        if (event.target.name === 'portal') {
            if (event.detail.checked === true) {
                this.portal_records_to_update.push(event.currentTarget.dataset.key);
                this.disabled_save = false;
                this.disabled_cancel = false;
            } else {
                this.portal_records_to_update_false.push(event.currentTarget.dataset.key);
                this.disabled_save = false;
                this.disabled_cancel = false;
            }
        }
    }

    handle_preview(event) {
        if (event.currentTarget.dataset.exturl) {
            window.open(event.currentTarget.dataset.url, '_blank');
        } else {
            this.showImageInModal(event.currentTarget.dataset.url);
        }
    }

    delete_row(event) {
        this.rec_id_to_delete = event.currentTarget.dataset.key;
        this.deleteObjNameInS3 = event.currentTarget.dataset.name;
        this.isdelete = true;
    }

    download_row_image(event) {
        this.handleDownload(event.currentTarget.dataset.url, event.currentTarget.dataset.name);
    }

    // To download image
    handleDownload(url, Name) {

        const downloadContainer = this.template.querySelector('.download-container');
        const a = document.createElement("a");

        a.href = url;
        a.download = Name;
        a.target = '_blank';
        if (downloadContainer) {
            downloadContainer.appendChild(a);
        }
        a.click();
        downloadContainer.removeChild(a);
    }



    confData;
    @track fileURL = [];

    fetchingdata() {
        this.showSpinner = true;
        setTimeout(() => {
            fetchdata({ recordId: this.recordId })
                .then(result => {
                    this.data = result;
                    this.expose_records_to_update_false = [];
                    this.website_records_to_update_false = [];
                    this.portal_records_to_update_false = [];
                    this.expose_records_to_update = [];
                    this.website_records_to_update = [];
                    this.portal_records_to_update = [];

                    this.Expose = this.data.filter(media => media.SortOnExpose__c !== null && media.IsOnExpose__c !== false).sort((a, b) => a.SortOnExpose__c - b.SortOnExpose__c);
                    this.Website = this.data.filter(media => media.SortOnWebsite__c !== null && media.IsOnWebsite__c !== false).sort((a, b) => a.SortOnWebsite__c - b.SortOnWebsite__c);
                    this.Portal = this.data.filter(media => media.SortOnPortalFeed__c !== null && media.IsOnPortalFeed__c !== false).sort((a, b) => a.SortOnPortalFeed__c - b.SortOnPortalFeed__c);
                    this.data.forEach(row => row.Size__c = row.Size__c ? row.Size__c + ' ' + 'kb' : 'External');
                    this.data.forEach(row => row.Tags__c = row.Tags__c ? row.Tags__c.split(";") : '');
                    this.isdata = result && result.length > 0;
                    this.isdeleteAllButton = this.isdata ? false : true;
                    this.showSpinner = false;
                })
                .catch(error => {
                    console.error('Error fetching data:', JSON.stringify(error));
                });
        }, 2000);

    }


    async getS3ConfigDataAsync() {
        try {
            this.confData = await getS3ConfigData();
        } catch (error) {
            console.log('error-->',error);
        }
    }

    renderedCallback() {
        if (this.isInitalRender) {
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

                .tableDiv .slds-table_bordered{
                    border-top: 0px !important;
                    border-bottom: 0px !important;
                    border-radius: 0.25rem;
                }

                .tableDiv .slds-table thead th{
                    background-color: rgba(1, 118, 211, 1);
                    color: white;
                }

                .navexStandardManager .slds-template__container .slds-spinner_container, .navexStandardManager>.center .s1FixedTop {
                    z-index: 10000 !important;
                }
            `;

            body.appendChild(style);
            this.isInitalRender = false;
        }
        if (this.isAwsSdkInitialized) {
            return;
        }
        Promise.all([loadScript(this, AWS_SDK), loadScript(this, watermarkjs)])
            .then(() => {
            })
            .catch((error) => {
                console.error("error -> ", error);
            });
    }

    //Initializing AWS SDK
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

            this.isAwsSdkInitialized = true;
        } catch (error) {
            console.log("error initializeAwsSdk ", error);
        }
    }
   //get the file name from user's selection
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
            console.log('selectedfile names', this.fileName);
            console.log('selectedfiles', this.selectedFilesToUpload);
            console.log('selectedfile sizes', this.fileSize);
        }

    } catch (error) {
        console.log('error file upload ', error);
    }
}

    handleRemove(event) {
        // Get the label of the lightning pill associated with the remove button
        const fileNameToRemove = event.target.closest('lightning-pill').label;
        console.log('Removing file:', fileNameToRemove);
    
        // Find the index of the file to remove in the fileName array
        const indexToRemove = this.fileName.indexOf(fileNameToRemove);
        
        // If the file is found in the array, remove it
        if (indexToRemove !== -1) {
            this.fileName.splice(indexToRemove, 1);
            this.selectedFilesToUpload.splice(indexToRemove, 1);
            this.fileSize.splice(indexToRemove, 1);
            this.isnull = this.fileName.length === 0;
            this.disabled_checkbox = this.fileName.length === 0;
        } else {
            console.error('File not found in fileName array:', fileNameToRemove);
        }
    }
    
   
    handleclick(event) {
        if (this.recordId) {
            this.isnull = true;
            this.uploadToAWS()
                .then(() => {
                    var contents = [];
                    for (let file = 0; file < this.selectedFilesToUpload.length; file++) {
                        contents.push(createmedia({
                            recordId: this.recordId,
                            externalUrl: this.fileURL[file],
                            Name: this.fileName[file] = this.isWatermark ? this.fileName[file] + 'watermark' : this.fileName[file],
                            Size: this.fileSize[file],
                        }));
                    }
                    return contents;
                }).then(result => {
                    if (result) {
                        this.fetchingdata();
                        this.selectedFilesToUpload = [];
                        this.fileName = [];
                        this.fileSize = [];
                        this.fileURL = [];
                        this.isnull = true;
                        this.isdata = true;
                        this.isdeleteAllButton = this.isdata ? false : true;
                        this.disabled_checkbox = true;
                        this.isWatermark = true;
                    }
                    else {
                        this.toast('Error creating record', 'Property not added.', 'Error');
                    }
                    refreshApex(this.data);
                })
                .catch(error => {
                    this.toast('Error creating record', 'Property not added.', 'Error');
                    console.error('Error:', error);
                });
        } else {
            this.toast('Error creating record', 'Property not added.', 'Error');
        }
    }

    
    
    async uploadToAWS() {
        try {
            for (let f = 0; f < this.selectedFilesToUpload.length; f++) {
                this.currentFileName = this.fileName[f];
                this.currentFileSize = this.fileSize[f];
                this.initializeAwsSdk(this.confData);
                if (this.isWatermark === true) {
                    let outImage = await this.imageWithWatermark(this.selectedFilesToUpload[f]);
                    const format = outImage.substring(outImage.indexOf('data:') + 5, outImage.indexOf(';base64'));
                    const base64String = outImage.replace(/^data:image\/\w+;base64,/, '');
                    const Buffer = buffer.Buffer;
                    const buff = new Buffer(base64String, 'base64');
    
                    if (buff) {
                        let objKey = this.fileName[f]
                            .replace(/\s+/g, "_")
                            .toLowerCase() + 'watermark';
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
                            this.uploadProgress = Math.round((progress.loaded / progress.total) * 100);
                        });
    
                        await upload.promise();
    
                        let bucketName = this.confData.S3_Bucket_Name__c;
                        this.fileURL.push(`https://${bucketName}.s3.amazonaws.com/${objKey}`);
                        this.isfileuploading = false;
                        this.uploadProgress = 0;
                        this.listS3Objects();
                    }
                } else {
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
    
                        let upload = this.s3.upload(params);
                        this.isfileuploading = true;
                        upload.on('httpUploadProgress', (progress) => {
                            this.uploadProgress = Math.round((progress.loaded / progress.total) * 100);
                            this.fileSize[f] = progress.total; 
                        });
    
                        await upload.promise();
    
                        let bucketName = this.confData.S3_Bucket_Name__c;
                        this.fileURL.push(`https://${bucketName}.s3.amazonaws.com/${objKey}`);
                        this.isfileuploading = false;
                        this.uploadProgress = 0;
                        this.listS3Objects();
                    }
                }
                
                if (f < this.selectedFilesToUpload.length - 1) {
                    this.fileName[f + 1] = this.isWatermark ? this.fileName[f + 1] + 'watermark' : this.fileName[f + 1];
                }
            }
        } catch (error) {
            console.error("Error in uploadToAWS: ", error);
        }
    }
    

    //listing all stored documents from S3 bucket
    listS3Objects() {
        try {
            this.s3.listObjects((err, data) => {
                if (err) {
                } else {
                }
            });
        } catch (error) {
        }
    }
    allowDrop(event) {
        event.preventDefault();

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
            this.toast('Error', 'File type Incorrect', 'Error');
        }
    }

    handleDragOver(event) {
        event.preventDefault();
    }

    handleDragStart(event) {
        const index = event.target.dataset.index;
        event.dataTransfer.setData('index', index);
    }
    findParentWithDataIndex(element) {
        let parent = element.parentElement;
        while (parent) {
            const index = parent.getAttribute('data-index');
            if (index !== null) {
                return index;
            }
            parent = parent.parentElement;
        }
        return null;
    }

    handleDragEnter(event) {
        event.preventDefault();
        event.target.closest(".dropableimage").classList.add("highlight");
        clearTimeout(leaveTimeout);
    }

    handleDragLeave(event) {
        event.preventDefault();
        const dropableImage = event.currentTarget.closest(".dropableimage");
        if (!dropableImage.contains(event.relatedTarget)) {
            leaveTimeout = setTimeout(() => {
                dropableImage.classList.remove("highlight");
            }, 200);
        }
    }

    handledDrop(event) {

        event.preventDefault();
        event.target.closest(".dropableimage").classList.remove("highlight");
        var tempdata = [];
        const draggedIndex = event.dataTransfer.getData('index');
        const droppedIndex = this.findParentWithDataIndex(event.target);
        const dataType = event.currentTarget.dataset.type;
        if (!this.sortOn.includes(dataType)) {
            this.sortOn.push(dataType);
        }
        switch (dataType) {
            case 'Expose':
                tempdata = this.Expose;
                break;
            case 'Website':
                tempdata = this.Website;
                break;
            case 'Portal':
                tempdata = this.Portal;
                break;
            default:
                break;
        }


        if (draggedIndex === droppedIndex) {
            return;
        }

        const draggedMediaId = tempdata[draggedIndex].Id;
        const droppedMediaId = tempdata[droppedIndex].Id;


        // Rearrange the media IDs based on the new order
        var reorderedMediaIds = this.reorderMediaIds(draggedMediaId, droppedMediaId, draggedIndex, droppedIndex, tempdata);

        tempdata = reorderedMediaIds.map(mediaId => {
            return tempdata.find(item => item.Id === mediaId);
        });

        switch (dataType) {
            case 'Expose':
                this.Expose = reorderedMediaIds.map(mediaId => {
                    return this.Expose.find(item => item.Id === mediaId);
                });
                this.disabled_cancel = false;
                this.disabled_save = false;
                break;
            case 'Website':
                this.Website = reorderedMediaIds.map(mediaId => {
                    return this.Website.find(item => item.Id === mediaId);
                });
                this.disabled_cancel = false;
                this.disabled_save = false;
                break;
            case 'Portal':
                this.Portal = reorderedMediaIds.map(mediaId => {
                    return this.Portal.find(item => item.Id === mediaId);
                });
                this.disabled_cancel = false;
                this.disabled_save = false;
                break;
            default:
                break;
        }
    }

    reorderMediaIds(draggedMediaId, droppedMediaId, draggedIndex, droppedIndex, tempdata) {
        var reorderedMediaIds = [...tempdata.map(media => media.Id)];

        if (draggedIndex < droppedIndex) {
            for (let i = parseInt(draggedIndex); i < parseInt(droppedIndex); i++) {
                reorderedMediaIds[i] = tempdata[i + 1].Id;


            }
        } else {
            for (let i = parseInt(draggedIndex); i > parseInt(droppedIndex); i--) {
                reorderedMediaIds[i] = tempdata[i - 1].Id;

            }
        }

        reorderedMediaIds[parseInt(droppedIndex)] = draggedMediaId;

        return reorderedMediaIds;
    }

    getwebsite() {
        this.website_records_to_update = [];
        this.website_records_to_update_false = [];

        this.Website = this.data;
        this.data.forEach(item => {
            item.IsOnWebsite__c = true;
            this.website_records_to_update.push(item.Id);
        });
        this.disabled_save = false;
        this.disabled_cancel = false;
    }

    clearwebsite() {
        this.website_records_to_update = [];
        this.website_records_to_update_false = [];
        this.Website = null;
        this.data.forEach(item => {
            item.IsOnWebsite__c = false;
            this.website_records_to_update_false.push(item.Id);
        });
        this.disabled_save = false;
        this.disabled_cancel = false;
    }

    getexpose() {
        this.website_records_to_update = [];
        this.expose_records_to_update = [];
        this.portal_records_to_update = [];
        this.expose_records_to_update_false = [];
        this.website_records_to_update_false = [];
        this.portal_records_to_update_false = [];
        this.Expose = this.data;
        this.data.forEach(item => {
            item.IsOnExpose__c = true;
            this.expose_records_to_update.push(item.Id);
        });
        this.getportal();
        this.getwebsite();
        this.disabled_save = false;
        this.disabled_cancel = false;
    }

    clearexpose() {
        this.website_records_to_update = [];
        this.expose_records_to_update = [];
        this.portal_records_to_update = [];
        this.expose_records_to_update_false = [];
        this.website_records_to_update_false = [];
        this.portal_records_to_update_false = [];
        this.Expose = null;
        this.data.forEach(item => {
            item.IsOnExpose__c = false;
            this.expose_records_to_update_false.push(item.Id);
        });
        this.clearportal();
        this.clearwebsite();
        this.disabled_save = false;
        this.disabled_cancel = false;
    }

    getportal() {
        this.Portal = this.data;
        this.portal_records_to_update = [];
        this.portal_records_to_update_false = [];
        this.data.forEach(item => {
            item.IsOnPortalFeed__c = true;
            this.portal_records_to_update.push(item.Id);
        });
        this.disabled_save = false;
        this.disabled_cancel = false;
    }

    clearportal() {
        this.portal_records_to_update = [];
        this.portal_records_to_update_false = [];
        this.Portal = null;
        this.data.forEach(item => {
            item.IsOnPortalFeed__c = false;
            this.portal_records_to_update_false.push(item.Id);
        });
        this.disabled_save = false;
        this.disabled_cancel = false;
    }
    watermark_value(event) {
        this.isWatermark = event.target.checked;
    }
    tags_checked(event) {
        if (event.target.name === 'Floorplan') {
            this.floorplan_checked = event.target.checked;

            if (this.floorplan_checked) {
                this.picklistValues.push(event.target.name);

            } else {
                let index_of_item = this.picklistValues.indexOf(event.target.name);
                this.picklistValues.splice(index_of_item, 1);
            }
        }
        if (event.target.name === 'Virtual Tour') {
            this.virtual_tour_checked = event.target.checked;
            if (this.virtual_tour_checked) {
                this.picklistValues.push(event.target.name);

            } else {
                let index_of_item = this.picklistValues.indexOf(event.target.name);
                this.picklistValues.splice(index_of_item, 1);
            }
        }
        if (event.target.name === '360tour') {
            this.tour_checked = event.target.checked;
            if (this.tour_checked) {
                this.picklistValues.push(event.target.name);

            } else {
                let index_of_item = this.picklistValues.indexOf(event.target.name);
                this.picklistValues.splice(index_of_item, 1);
            }
        }
        this.checkChanges();
    }

    async imageWithWatermark(image) {
        try {
            let file = image;
            const watermarkedImage = await watermark([file])
                .image(watermark.text.center('EstateXpert', '30em sans-serif', '#fff', 0.5));
            return watermarkedImage.src;
        } catch (error) {
            throw error;
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

    notYet() {
        this.toast('Error', 'The functionality has not yet been determined; therefore, please await further updates.', 'Error');
    }

    // Method to check if any changes have been made
    checkChanges() {
        const isNameChanged = this.initialValues.current_img_name !== this.current_img_name;
        const isFloorplanChanged = this.initialValues.floorplan_checked !== this.floorplan_checked;
        const isVirtualTourChanged = this.initialValues.virtual_tour_checked !== this.virtual_tour_checked;
        const isTourChanged = this.initialValues.tour_checked !== this.tour_checked;
    
        this.isSaveDisabled = !(isNameChanged || isFloorplanChanged || isVirtualTourChanged || isTourChanged);
        if (isNameChanged) {
            console.log('isNameChanged-->',isNameChanged);
            this.nameIsChanged = true;
        } else if(isFloorplanChanged || isVirtualTourChanged || isTourChanged){
            console.log('isFloorplanChanged || isVirtualTourChanged || isTourChanged',isFloorplanChanged || isVirtualTourChanged || isTourChanged);
            this.tagIsChanged = true;
        }
    }
}