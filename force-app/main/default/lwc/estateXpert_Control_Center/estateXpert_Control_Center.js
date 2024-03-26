import { LightningElement } from 'lwc';

export default class EstateXpert_Control_Center extends LightningElement {


    isInitalRender = true;
    selectionModel = false;
    name = 'Control Center';
    message = 'Hover your mouse over any tile on the right to learn more about that feature.'

    renderedCallback(){
        try {

            if(this.isInitalRender){
                console.log( "Estate Xpert Control Center Rendered");
                const body = document.querySelector("body");

                const style = document.createElement('style');
                style.innerText = `
                        .slds-template_default {
                            padding: 0 !important;
                        }
                `;

                body.appendChild(style);
                this.isInitalRender = false;
            }
            
        } catch (error) {
            console.log(' error in render : ', error.messsage);
            
        }
    }

    openSelectionModel(){
        this.selectionModel = true;
    }

    handleCloseModal() {
        this.selectionModel = false;
    }

}