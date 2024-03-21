import { LightningElement, track, wire } from 'lwc';
import { loadStyle, loadScript } from 'lightning/platformResourceLoader';
import logo from '@salesforce/resourceUrl/estatexpertlogo';
import Img1 from '@salesforce/resourceUrl/DemoImg1';
import Property_view_example from '@salesforce/resourceUrl/Property_view_example'
import NextArrowIcon from '@salesforce/resourceUrl/NextArrowIcon'
import PrevArrowIcon from '@salesforce/resourceUrl/PrevArrowIcon'
import designcss from '@salesforce/resourceUrl/propertycssoveride';
import { NavigationMixin } from 'lightning/navigation';

export default class Bt_HomePage extends NavigationMixin(LightningElement) {
    @track spinnerdatatable = false;
    Logo = logo;
    PropertyImg = Img1;
    propertyView = Property_view_example;
    nextArrowIcon = NextArrowIcon;
    prevArrowIcon = PrevArrowIcon;

    connectedCallback() {
        console.log('Property Listed View');
        loadStyle(this, designcss);
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


    tabing() {
        const target = "tab1";
        this.template.querySelectorAll("a").forEach(tabel => {
            tabel.classList.remove("active-tab");
        });
        this.template.querySelectorAll(".tab").forEach(tabdata => {
            tabdata.classList.remove("active-tab-content");
        });
        this.template.querySelector('[data-tab-id="' + target + '"]').classList.add("active-tab");
        this.template.querySelector('[data-id="' + target + '"]').classList.add("active-tab-content");
    }

}