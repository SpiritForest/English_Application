sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		createViewModel: function () {
			return new JSONModel({
				"ListItems": [],
				"learnMode": "Study"
			});
		},
		
		createDialogExamModel: function(obj){
			return new JSONModel(obj);
		}

	};
});