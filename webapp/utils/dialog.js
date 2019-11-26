sap.ui.define([
], function (
    Dialog,
    Input
) {
    "use strict";
    return {
        getWordDialog: function(){
            if (!this._oCardDialog) {
                this._oCardDialog = sap.ui.xmlfragment("sap.TimeLine.view.SortPopover", this);
                this.getView().addDependent(this._oCardDialog);
            } 

            return this._oCardDialog;
        },

    }
})
