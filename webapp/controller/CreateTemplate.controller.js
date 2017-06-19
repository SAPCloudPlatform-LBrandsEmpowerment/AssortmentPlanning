sap.ui.define([
	"com/lbrands/assortments/controller/BaseController",
	"com/lbrands/assortments/model/formatter",
	"sap/ui/model/json/JSONModel"
], function(BaseController, Formatter, JSONModel) {
	"use strict";

	return BaseController.extend("com.lbrands.assortments.controller.CreateTemplate", {
		formatter: Formatter,

		onInit: function() {
			var oViewModel = new JSONModel({
				templateFieldEdit: false
			});
			this.setModel(oViewModel, "createtemplate");

			this.getRouter().getTargets().getTarget("createTemplate").attachDisplay(null, this._onDisplay, this);
		},

		_onDisplay: function(oEvent) {
			var oModel = this.getModel(),
				data = oEvent.getParameter('data'),
				oContext;


			this.getModel('createtemplate').setProperty('/saveContext', data.mode);
			
			// this.getView().byId("idFieldsList").unbindItems();
			oModel.refresh(true);
			
			if (data.mode === 'edit') {
				oContext = new sap.ui.model.Context(oModel, data.contextPath);

			} else if (data.mode === 'create') {
				oContext = oModel.createEntry("Templates", {
					properties: {
						"TemplateID": 1, // Dummy Template Id, ids will be populated from HANA Sequence
						"CreateDate": new Date(),
						"IsActive": 'true'
					},
					success: null,
					error: null
				});
			}

			this.getView().setBindingContext(oContext);
		},

		onFieldSelect: function(oEvent) {

			var oModel = this.getModel(),
				oLocalModel = this.getModel("createtemplate"),
				templateId = this.getView().getBindingContext().getProperty('TemplateID'),
				oFieldsList = this.getView().byId('idFieldsList'),
				oTemplateFieldsList = this.getView().byId('idTemplateFieldsList'),
				activeItems = oFieldsList.getSelectedItems(),
				i;

			oLocalModel.setProperty('/templateFieldEdit', true);

			for (i = 0; i < activeItems.length; i++) {
				//oFieldsList.removeItem(activeItems[i]);
				activeItems[i].setSelected(false);
				var newItem = activeItems[i].clone();
				oTemplateFieldsList.addItem(newItem);
				newItem.setSelected(false);
				// activeItems[i].destroy(true);

				//Create entry in ODataModel if context mode is Edit
				if (oLocalModel.getProperty('/saveContext') === 'edit') {
					oModel.createEntry('TemplateFields', {
						properties: {
							"TemplateID": templateId,
							"FieldID": newItem.getCustomData()[0].getValue(),
							"Name": newItem.getTitle(),
							"DisplayName": newItem.getTitle()
						}
					});

				}
			}
			

		},

		onFieldDeselect: function(oEvent) {

			this.getModel("createtemplate").setProperty('/templateFieldEdit', true);

			var oModel = this.getModel(),
				oFieldsList = this.getView().byId('idFieldsList'),
				oTemplateFieldsList = this.getView().byId('idTemplateFieldsList');

			var activeItems = oTemplateFieldsList.getSelectedItems();
			var i;

			for (i = 0; i < activeItems.length; i++) {
				oTemplateFieldsList.removeItem(activeItems[i]);
				activeItems[i].setSelected(false);

				oFieldsList.addItem(activeItems[i]);

				//Remove entry in ODataModel
				var sPath = activeItems[i].getBindingContextPath();
				oModel.remove(sPath);
			}

		},

		onSave: function(oEvent) {

			var oModel = this.getModel(),
				oLocalModel = this.getModel('createtemplate'),
				that = this;

			//HANA does not support boolean types

			/*if(oTemplateObj.IsActive){
				oTemplateObj.IsActive = oTemplateObj.IsActive.toString();	
			}*/
			
			
			if (oLocalModel.getProperty('/saveContext') === 'create') {
				oModel.submitChanges({
					success: function(oData) {

						if (!oLocalModel.getProperty('/templateFieldEdit')) {
							that._navBack();
						} else {
							var data = oData.__batchResponses[0].__changeResponses[0].data;
							var templateId = data.TemplateID;

							//Update Template Fields
							that._updateTemplateFields(templateId);

						}
					},
					error: function() {}
				});
			} else if (oLocalModel.getProperty('/saveContext') === 'edit') {

				if (oModel.hasPendingChanges()) {
					oModel.submitChanges();
				}
				this._navBack();

				/*if (oLocalModel.getProperty('/templateFieldEdit')) {
					var templateId = this.getView().getBindingContext().getProperty('TemplateID');
					this._updateTemplateFields(templateId);
				}*/
			}

		},

		_updateTemplateFields: function(templateId) {
			var that = this,
				oModel = this.getModel(),
				oTemplateFields = this.getView().byId('idTemplateFieldsList').getItems();

			oTemplateFields.forEach(function(field) {
				oModel.createEntry('TemplateFields', {
					properties: {
						"TemplateID": templateId,
						"FieldID": field.getCustomData()[0].getValue(),
						"Name": field.getTitle(),
						"DisplayName": field.getTitle()
					}
				});
			});

			oModel.submitChanges({
				success: function() {
					that._navBack();
				}
			});

		},

		onCancel: function() {
			if(this.getModel().getPendingChanges()){
				this.getModel().resetChanges();	
			}
			
			// this.getView().setBindingContext(null);
			this._navBack();
		},

		_navBack: function() {
			this._clearOldContext();
			var oHistory = sap.ui.core.routing.History.getInstance(),
				sPreviousHash = oHistory.getPreviousHash();

			this.getView().unbindObject();
			if (sPreviousHash !== undefined) {
				// The history contains a previous entry
				history.go(-1);
			} else {
				this.getOwnerComponent().getRouter().getTargets().display("template");
			}
		},

		onExit: function() {
			var oTemplateFieldsList = this.getView().byId('idTemplateFieldsList');
			oTemplateFieldsList.destroy();
		},

		_clearOldContext: function() {

		}

	});

});