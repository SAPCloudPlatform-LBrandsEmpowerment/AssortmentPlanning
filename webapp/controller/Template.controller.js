sap.ui.define([
	"com/lbrands/assortments/controller/BaseController"
], function(BaseController) {
	"use strict";

	return BaseController.extend("com.lbrands.assortments.controller.Template", {
		
		onInit: function(){
			var oViewModel = new sap.ui.model.json.JSONModel({
				editEnabled: true
			});
			
			this.getView().setModel(oViewModel, 'template');
		},
		
		onEnableTemplateEdit: function(){
			this.getView().getModel('template').setProperty('/editEnabled', true);	
		},
		
		onTemplateEdit: function(oEvent){
			
			var sContextPath = oEvent.getSource().getParent().getBindingContextPath();
			
			this.getRouter().getTargets().display("createTemplate", {
				mode: "edit",
				contextPath: sContextPath
			});
		},
		
		onTemplateDelete: function(oEvent){
			var templateId = oEvent.getSource().getCustomData()[0].getValue(),
				oModel = this.getView().getModel(),
				sPath= '/Templates('+templateId+')';
			
			oModel.remove(sPath);
		},
		
		onTemplateAdd: function(oEvent) {
			this.getRouter().getTargets().display("createTemplate",{
				mode: 'create'
			});
		}

	});

});