sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../asset/vocabulary/dataJSON",
	"../model/models",
	"sap/m/Popover",
	"sap/m/Dialog",
	"sap/m/List",
	"sap/m/CustomListItem",
	"sap/m/Button",
	"sap/ui/core/HTML",
	"sap/m/MessageToast",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	"sap/ui/core/util/ExportColumn",
	"sap/ui/core/util/ExportCell",
], function (Controller, data, models, Popover, Dialog, List, CustomListItem, Button, HTML, MessageToast, Export, ExportTypeCSV, ExportColumn, ExportCell) {
	"use strict";

	return Controller.extend("eng.English.controller.MainPage", {

		onInit: function () {
			this.oViewModel = models.createViewModel();
			this.getView().setModel(this.oViewModel, "oViewModel");
		},

		onBeforeRendering: function () {
			window.th = this;
			this.oViewModel.setProperty("/ListItems", this._updateData());
		},
		
		_updateData: function(){
			if (window.localStorage.getItem("aToRevise")) {
				var aToRevise = JSON.parse(window.localStorage.getItem("aToRevise"));
			} else {
				return data;
			}
			var now = new Date().getTime();
			var aDataToDisplay = [...data];

			if (Array.isArray(aToRevise)) {
			
				aToRevise.forEach((value, index) => {
				
					if (value && now < value.nextReviseDate) {
					
						aDataToDisplay.splice(index, 1);
					}
				});
			}
			return aDataToDisplay;
		},

		onPlay: function (oEvent) {
			var sPath = oEvent.getSource().getParent().getBindingContextPath();
			var sAudio = this.oViewModel.getProperty(sPath).sAudioPath;
			if (sAudio) {
				var oAudio;
				if (document.getElementById("audioTag")) {
					oAudio = document.getElementById("audioTag");
					oAudio.setAttribute("src", sAudio);
					oAudio.play();
				} else {
					oAudio = document.createElement("audio");
					oAudio.setAttribute("id", "audioTag");
					oAudio.setAttribute("src", sAudio);
					document.body.appendChild(oAudio);
					oAudio.play();
				}
			}
		},

		_setBoldSearchableWord: function () {
			var oListItem;

			// 			= document.getElementsByClassName("SLI")[0].children[0].children[0].children[0].innerHTML
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

		//========================================================================================
		// LIST in the dialog
		//========================================================================================
		// this function usd to return string for sap.ui.core.HTML, other words tag in string rep-
		// resentation
		_getCustomListItemContent: function (selected, str) {
			var sText, strStrong, substr;
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
		// Dialog
		//========================================================================================

		_getDialog: function (oContent, selected) {
			var iContentLength = oContent.getItems().length;
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

		onShowSamples: function (oEvent) {
			var sPath = oEvent.getSource().getParent().getBindingContextPath();
			var oModel = this.oViewModel.getProperty(sPath);
			var oDialog, oList;
			oList = this._getListWithData(oModel.sExample, oModel.sEn);
			oDialog = this._getDialog(oList, oModel.sEn);
			oDialog.open();
		},

		onDBClose: function () {
			// destroy content method is needed for avoid recreate items, such as list
			// in my case there was an issue with duplicate id 'dialogList' in List
			this.oDialog.destroyContent();
			this.oDialog.close();
		},

		onSelectModePress: function (oEvent, sBTText) {
			this._onLearnChange();
			this.oViewModel.setProperty("/learnMode", sBTText);

		},

		_onLearnChange: function () {
			var sMode = this.oViewModel.getProperty("/learnMode");
		},

		onInputLiveChange: function (oEvent, sValue) {
			// var oInput = oEvent.getSource();
			// var iIndex = [...oInput.getParent().getBindingContextPath()].pop();
			// var sEn = data[iIndex].sEn.toLowerCase();
			// var sInputValue = sValue;
			// if (sInputValue) {
			// 	sInputValue = sInputValue.toLowerCase();
			// } else {
			// 	sInputValue = "";
			// }
			// if (sEn === sInputValue) {
			// 	oInput.setValueState("Success");
			// 	oInput.setEditable(false);
			// 	// some Callback Function should be here
			// 	this._setNextRevise(oInput);
			// }
		},

		_setNextRevise: function (oInput, bReNew, iIndex) {
			var aToRevise = [];
			var iNumberOfWord = +[...oInput.getParent().getBindingContextPath()].pop();

			if (!window.localStorage.getItem("aToRevise")) {
				window.localStorage.setItem("aToRevise", JSON.stringify(aToRevise));
			}
			aToRevise = JSON.parse(window.localStorage.getItem("aToRevise"));
			// check if it alredy has property to revise
			if (aToRevise[iNumberOfWord] && !bReNew) {
				aToRevise[iNumberOfWord] = this._setNewDateOfRevise(aToRevise[iNumberOfWord]);
			} else {
				aToRevise[iNumberOfWord] = {
					nextReviseDate: new Date().getTime() + 3600 * 1000 * 24,
					numberOfRevise: 1,
				};
			};
		
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

		onSubmitAnswer: function (oEvent) {
			var oButton = oEvent.getSource();
			var iIndex = [...oButton.getParent().getBindingContextPath()].pop();
			var sEn = data[iIndex].sEn.toLowerCase();
			var sInputValue = oButton.getParent().getCells()[5].getValue();
			if (sInputValue) {
				sInputValue = sInputValue.toLowerCase();
			} else {
				sInputValue = "";
			}
			if (sEn === sInputValue) {
				// some Callback Function should be here
				this._setNextRevise(oButton);
			} else {
				this._setNextRevise(oButton, true);
			}		
			this.oViewModel.setProperty("/ListItems", this._updateData());
		},

		_getColumns: function (sPath) {
			var aResult = [];
			var aData = this.oViewModel.getProperty(sPath);
			if (Array.isArray(aData) && aData.length) {
				// for (var key in aData[0]) {
				aResult.push(
					new ExportColumn({
						name: "Some",
						template: new ExportCell({
							content: "{" + "sRu" + "}"
						})
					}),
				);
				// };
			}
			return aResult;
		},

		onDownload: function () {
			var sPath = "/ListItems";
			new Export({
					models: this.oViewModel,
					exportType: new ExportTypeCSV({
						fileExtension: "csv",
						separatorChar: ";"
					}),
					rows: {
						path: sPath
					},
					columns: this._getColumns(sPath)
				})
				.saveFile("SuperData")
				.always(function () {
					this.destroy();
				});
		},

		onUpload: function () {
			var oInput;
			if (!document.getElementById("oInput")) {
				oInput = document.createElement("input");
				oInput.setAttribute("type", "file");
				oInput.setAttribute("id", "oInput");
				oInput.setAttribute("accept", ".csv");
			}
			oInput.click();
			oInput.addEventListener("change", this._onInputChange.bind(this))
		},

		_onInputChange: function (oEvent) {
			this.start = new Date();
			var sResult, aFiles, oFileReader;
			aFiles = oEvent.target.files;
			if (aFiles.length) {
				oFileReader = new FileReader();
				oFileReader.onload = function (evt) {
					new MessageToast.show("Data was recieved");
					sResult = evt.target.result;
					this._handleData(sResult);
				}.bind(this);
				oFileReader.onerror = function (evt) {
					new MessageToast.show("Data WASN'T recieved")
				}
				oFileReader.readAsText(aFiles[0]);
			}
		},

		_handleData: function (sResult) {
			this.end = new Date();
			console.log(this.end - this.start + " ms");
		}
	});
});