sap.ui.define([
	"./BaseController",
	"../asset/vocabulary/dataJSON",
	"../model/models",
	"sap/m/MessageToast",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	"sap/ui/core/util/ExportColumn",
	"sap/ui/core/util/ExportCell",
	"../utils/ReviseLogic"
], function (BaseController, data, models, MessageToast, Export, ExportTypeCSV, ExportColumn, ExportCell, ReviseLogic) {
	"use strict";

	return BaseController.extend("eng.English.controller.MainPage", {
		ReviseLogic: ReviseLogic,

		onInit: function () {
			this.oViewModel = models.createViewModel();
			this.getView().setModel(this.oViewModel, "oViewModel");
		},

		onBeforeRendering: function () {
			window.th = this;
			this.oViewModel.setProperty("/ListItems", this._updateData());
		},

		_updateData: function () {
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
						aDataToDisplay[index] = null;
					}
				});
			}
			return aDataToDisplay.filter(function (value) {
				return !!value
			});
		},

		onPlay: function (oEvent, sAudioSRC) {
			if (!sAudioSRC) {
				var sPath = oEvent.getSource().getParent().getBindingContextPath();
				var sAudio = this.oViewModel.getProperty(sPath).sAudioPath;
			} else {
				sAudio = sAudioSRC;
			}
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

		onShowSamples: function (oEvent) {
			var sPath = oEvent.getSource().getParent().getBindingContextPath();
			var oModel = this.oViewModel.getProperty(sPath);
			var oDialog, oList;
			oList = this._getListWithData(oModel.sExample, oModel.sEn);
			oDialog = this._getDialog(oList, oModel.sEn);
			oDialog.open();
		},

		onSelectModePress: function (oEvent, sBTText) {
			this._onLearnChange();
			this.oViewModel.setProperty("/learnMode", sBTText);

		},

		_onLearnChange: function () {
			this.oViewModel.getProperty("/learnMode");
		},

		onSubmitAnswer: function (oEvent) {
			var row = oEvent.getSource().getParent();
			var sPath = row.getBindingContextPath();
			var obj = this.oViewModel.getProperty(sPath);
			var iIndex = data.indexOf(obj);
			var sInputValue = row.getCells()[5].getValue();
			var sEn = data[iIndex].sEn.toLowerCase();
			this._checkAnswer(sEn, sInputValue, iIndex);
		},

		_checkAnswer: function (sEnglish, sInputValue, iIndex) {
			var bSuccess = false;
			sEnglish = sEnglish.toLowerCase();
			if (sInputValue) {
				sInputValue = sInputValue.toLowerCase();
			} else {
				sInputValue = "";
			}
			if (sEnglish === sInputValue) {
				bSuccess = true;
				this.show("Right!")
				this.ReviseLogic.setNextRevise(iIndex);
			} else {
				this.show("Wrong");
				this.ReviseLogic.setNextRevise(iIndex, true);
			}
			this.oViewModel.setProperty("/ListItems", this._updateData());
			return bSuccess;
		},

		_getColumns: function (sPath) {
			var aResult = [];
			var aData = this.oViewModel.getProperty(sPath);
			if (Array.isArray(aData) && aData.length) {
				aResult.push(
					new ExportColumn({
						name: "Some",
						template: new ExportCell({
							content: "{" + "sRu" + "}"
						})
					}),
				);
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
		},

		onShowFragment: function () {
			this.oCardDialog = this._getWordDialog();
			this.oCardDialog.open();
			this.getRandomWord();
		},

		getRandomWord: function () {
			var aUnlearnedWords = this.oViewModel.getProperty("/ListItems");
			var randomizer = function (aLength) {
				return Math.round(Math.random() * aLength);
			}
			var iRand = randomizer(aUnlearnedWords.length);
			var oDialogModel = models.createDialogExamModel(aUnlearnedWords[iRand]);
			// oDialogModel.setProperty("/sLearningWord", aUnlearnedWords[iRand]);
			oDialogModel.setProperty("/answer", "");
			oDialogModel.setProperty("/bShowAnswer", false);
			oDialogModel.setProperty("/iIndex", iRand);
			oDialogModel.setProperty("/iCouterPress", 1);
			oDialogModel.setProperty("/iWordsLeft", aUnlearnedWords.length);
			this.oCardDialog.setModel(oDialogModel);
		},

		onSubmitExamAnswer: function (oEvent) {
			var oModelData = this.oCardDialog.getModel();
			var sEnglish = oModelData.getProperty("/sEn");
			var iIndex = oModelData.getProperty("/iIndex");
			var sInputValue = oEvent.getSource().getValue();
			var sAudioSRC = oModelData.getProperty("/sAudioPath");
			var bSuccess = this._checkAnswer(sEnglish, sInputValue, iIndex);
			var iCounterPress = oModelData.getProperty("/iCouterPress");
			// if the input same with the english word, invoke getRundomWord function	
			if (bSuccess || iCounterPress > 1) {
				this.getRandomWord();
			} else {
				this.onPlay(null, sAudioSRC);
				oModelData.setProperty("/iCouterPress", iCounterPress + 1);
				oModelData.setProperty("/bShowAnswer", true);
			}
		},
		onPlayInDialog: function(oEvent) {
			var sAudioSRC = oEvent.getSource().getModel().getData().sAudioPath;
			this.onPlay(null, sAudioSRC);
		}
	});
});