sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/CustomListItem",
    "sap/ui/core/HTML",
    "sap/m/List",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/MessageToast"
], function ( 
    Controller,  
    CustomListItem,
    HTML,
    List,
    Dialog, 
    Button,
    MessageToast) {
    "use strict";

    return Controller.extend("eng.English.controller.BaseController", {
        //========================================================================================
        // Dialog
        //========================================================================================

        _getDialog: function (oContent, selected) {
            // var iContentLength = oContent.getItems().length;
            var sTitleUpperCase = this._firsLetterToUpperCase(selected);

            // Show Dialog
            if (!this.oDialog) {
                this.oDialog = new Dialog("Dialog", {
                    showHeader: true,
                    title: sTitleUpperCase,
                    content: oContent,
                    endButton: new Button({
                        text: "Close",
                        type: "Emphasized",
                        press: this.onDBClose.bind(this)
                    }),
                });
                this.getView().addDependent(this.oDialog);
            } else {
                this.oDialog.setTitle(sTitleUpperCase);
                this.oDialog.destroyContent();
                this.oDialog.addContent(oContent);
            }
            return this.oDialog;
        },

        _firsLetterToUpperCase: function (str) {
            var sResult, array;
            if (typeof str === "string") {
                array = [...str];
                array[0] = array[0].toUpperCase();
                sResult = array.join("");
            }
            return sResult;
        },

        onDBClose: function () {
            // destroy content method is needed for avoid recreate items, such as list
            // in my case there was an issue with duplicate id 'dialogList' in List
            this.oDialog.destroyContent();
            this.oDialog.close();
        },
        //========================================================================================
        // LIST in the dialog
        //========================================================================================
        // this function usd to return string for sap.ui.core.HTML, other words tag in string rep-
        // resentation
        _getCustomListItemContent: function (selected, str) {
            var strStrong, substr;
            substr = str.match(new RegExp(selected, "gi"));
            if (substr) {
                substr = substr[0];
            };
            strStrong = str.replace(new RegExp(selected, "gi"), "<strong>" + substr + "</strong>");
            return "<p class='sapUiSmallMarginBeginEnd'>" + strStrong + "</p>";
        },

        // returns sap.m.List with filled Data, the Data should be an array or string
        _getListWithData: function (examples, selected) {
            var oContent, sText;
            // if Data is an array
            if (Array.isArray(examples)) {
                oContent = examples.map((value, index, arr) => {
                    var str = ++index + ") " + this._firsLetterToUpperCase(value);
                    var pTag = this._getCustomListItemContent(selected, str);
                    return new CustomListItem({
                        content: new HTML({
                            content: pTag
                        })
                    })
                });
            }
            // if Data is not empty string
            else if (examples) {
                sText = this._firsLetterToUpperCase(examples);
                oContent = new CustomListItem({
                    content: new HTML({
                        content: this._getCustomListItemContent(selected, sText)
                    })
                })
            }
            return new List("dialogList", {
                items: oContent
            });
        },
        //========================================================================================
        // Dialog for learn words
        //========================================================================================
        _getWordDialog: function(){
            if (!this._oCardDialog) {
                this._oCardDialog = sap.ui.xmlfragment("eng.English.view.DialogForLearnWords", this);
                this.getView().addDependent(this._oCardDialog);
            } 
            return this._oCardDialog;
        },

        onExitExam: function(){
            this._oCardDialog.close();
            // this._oCardDialog.destroyContent();
        },

        show: function(sMessage) {
            new MessageToast.show(sMessage, {
                duration: 1000,                  // default
                width: "15em",                   // default
                my: "center bottom",             // default
                at: "center bottom",             // default
                of: window,                      // default
                offset: "0 0",                   // default
                collision: "fit fit",            // default
                onClose: null,                   // default
                autoClose: true,                 // default
                animationTimingFunction: "ease", // default
                animationDuration: 1000,         // default
                closeOnBrowserNavigation: true   // default
            });
        }
    });
});