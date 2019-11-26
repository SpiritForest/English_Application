sap.ui.define([], function (Dialog, Button) {
    "use strict";
    return {
        setNextRevise: function (iIndex, bReNew) {
            var aToRevise = [];
            var iNumberOfWord = iIndex;
            if (!window.localStorage.getItem("aToRevise")) {
                window.localStorage.setItem("aToRevise", JSON.stringify(aToRevise));
            }
            aToRevise = JSON.parse(window.localStorage.getItem("aToRevise"));
            if (bReNew) {
                aToRevise[iNumberOfWord] = {
                    nextReviseDate: new Date().getTime(),
                    numberOfRevise: 1,
                };
            } else if (aToRevise[iNumberOfWord]) {
                aToRevise[iNumberOfWord] = this._setNewDateOfRevise(aToRevise[iNumberOfWord].numberOfRevise);
            } else {
                aToRevise[iNumberOfWord] = {
                    nextReviseDate: new Date().getTime() + 1000 * 3600 * 24,
                    numberOfRevise: 1,
                };
            }

            window.localStorage.setItem("aToRevise", JSON.stringify(aToRevise))
        },

        _setNewDateOfRevise: function (iNumberOfRevise) {
            var oReviseObject = {};
            var iDay = 3600 * 1000 * 24;
            switch (iNumberOfRevise) {
                case 1:
                    oReviseObject = {
                        nextReviseDate: new Date().getTime() + iDay * 1
                    };
                    break;
                case 2:
                    oReviseObject = {
                        nextReviseDate: new Date().getTime() + iDay * 1
                    };
                    break;
                case 3:
                    oReviseObject = {
                        nextReviseDate: new Date().getTime() + iDay * 5
                    };
                    break;
                case 4:
                    oReviseObject = {
                        nextReviseDate: new Date().getTime() + iDay * 23
                    };
                    break;
            };
            oReviseObject.numberOfRevise = iNumberOfRevise + 1;
            return oReviseObject;
        },
    };
});