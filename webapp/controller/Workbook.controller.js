/*global location */
sap.ui.define([
	"com/lbrands/assortments/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"com/lbrands/assortments/model/formatter",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function(BaseController, JSONModel, formatter, MessageBox, MessageToast) {
	"use strict";

	return BaseController.extend("com.lbrands.assortments.controller.Workbook", {

		formatter: formatter,
		onInit: function() {
			var that = this;
			var oViewModel = new JSONModel({
				busy: false,
				delay: 0,
				editEnabled: false
			});
			this.setModel(oViewModel, "workbook");

			this.oTable = this.getView().byId("idWorkbookTable");
			
			var oTemplateName = new sap.m.Text({
				text: "{Templates/TemplateID}"
			});
			
			var oReadTemplateSelect = new sap.m.Select({
				enabled: false,
				selectedKey: '{TemplateID}',
				items: {
					path: '/Templates',
					templateSharable: true,
					template: new sap.ui.core.Item({
						key: '{TemplateID}',
						text: '{TemplateName}'
					})
				}
				
			});
			
			var oEditTemplateSelect = new sap.m.Select({
				selectedKey: '{TemplateID}',
				items: {
					path: '/Templates',
					templateSharable: true,
					template: new sap.ui.core.Item({
						key: '{TemplateID}',
						text: '{TemplateName}'
					})
				}
				
			});
			
			var oReadCategorySelect = new sap.m.Select({
				enabled: false,
				selectedKey: '{CategoryID}',
				items: {
					path: '/Categories',
					templateSharable: true,
					template: new sap.ui.core.Item({
						key: '{CategoryID}',
						text: '{CategoryName}'
					})
				}
				
			});
			
			var oEditCategorySelect = new sap.m.Select({
				selectedKey: '{CategoryID}',
				items: {
					path: '/Categories',
					templateSharable: true,
					template: new sap.ui.core.Item({
						key: '{CategoryID}',
						text: '{CategoryName}'
					})
				}
				
			});
			
			var oReadEmotionalSpaceSelect = new sap.m.Select({
				enabled:false,
				selectedKey: '{EmotionalSpaceID}',
				items: {
					path: '/EmotionalSpaces',
					templateSharable: true,
					template: new sap.ui.core.Item({
						key: '{EmotionalSpaceID}',
						text: '{EmotionalSpaceName}'
					})
				}
				
			});
			
			var oEditEmotionalSpaceSelect = new sap.m.Select({
				selectedKey: '{EmotionalSpaceID}',
				items: {
					path: '/EmotionalSpaces',
					templateSharable: true,
					template: new sap.ui.core.Item({
						key: '{EmotionalSpaceID}',
						text: '{EmotionalSpaceName}'
					})
				}
				
			});
			
			this.oReadOnlyTemplate = new sap.m.ColumnListItem({
				type: "Navigation",
				press: that.openWorkbookPage.bind(this),
				cells: [
					new sap.m.Text({
						text: "{WorkbookName}"
					}), 
					oReadTemplateSelect,
					oReadCategorySelect,
					oReadEmotionalSpaceSelect
				]
			});
			this.rebindTable(this.oReadOnlyTemplate, "Navigation");
			
			
			
			this.oEditableTemplate = new sap.m.ColumnListItem({
				cells: [
					new sap.m.Input({
						value: "{WorkbookName}"
					}),
					oEditTemplateSelect,
					oEditCategorySelect,
					oEditEmotionalSpaceSelect,
					new sap.m.Button({
						design: "Transparent",
						icon: "sap-icon://delete",
						customData: [
							new sap.ui.core.CustomData({
								key: 'WorkbookName',
								value: '{WorkbookName}'
							})
						],
						press: that.onDelete.bind(that)
					})
					
				]
			});

			
			this.getRouter().getTargets().getTarget("workbook").attachDisplay(null, this._onDisplay, this);
			
			// this.getRouter().getRoute("object").attachMatched(null, this._onDisplay, this);
			this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
			this._oODataModel = this.getOwnerComponent().getModel();
			this._oResourceBundle = this.getResourceBundle();
		},
		
		_onDisplay: function(){
			// this.getView().byId('idTemplateName').bindElement('/Workbook(15)/Templates36');
		},
		
		onAfterRendering: function(){
			this._loadFields();	
		},
		
		_loadFields: function() {
			var that = this;
			this.getModel().read('/Fields', {
				success: function(oData) {
					that._Fields = oData.results;
					that.getModel('fields').setData(oData.results);
				},
				error: function(oError) {
					//
				}
			});
		},


		rebindTable: function(oTemplate, sKeyboardMode) {
			this.oTable.bindItems({
				path: '/Workbooks',
				template: oTemplate,
				templateShareable:true,
				parameters: {
					expand: 'Templates'
				},
				key: "ID"
			}).setKeyboardMode(sKeyboardMode);
		},

		onListUpdateFinished: function(oEvent) {
			var sTitle,
				iTotalItems = oEvent.getParameter("total"),
				oViewModel = this.getModel("workbook");

			// only update the counter if the length is final
			if (this.byId("lineItemsList").getBinding("items").isLengthFinal()) {
				if (iTotalItems) {
					sTitle = this.getResourceBundle().getText("detailLineItemTableHeadingCount", [iTotalItems]);
				} else {
					//Display 'Line Items' instead of 'Line items (0)'
					sTitle = this.getResourceBundle().getText("detailLineItemTableHeading");
				}
				oViewModel.setProperty("/lineItemListTitle", sTitle);
			}
		},

		onDelete: function(oEvent) {
			var that = this;
			var oViewModel = this.getModel("workbook"),
				sPath = oEvent.getSource().getBindingContext().sPath,
				sObject = oEvent.getSource().getCustomData()[0].getValue(),
				sQuestion = this._oResourceBundle.getText("deleteText", sObject),
				sSuccessMessage = this._oResourceBundle.getText("deleteSuccess", sObject);

			var fnMyAfterDeleted = function() {
				MessageToast.show(sSuccessMessage);
				oViewModel.setProperty("/busy", false);
				var oNextItemToSelect = that.getOwnerComponent().oListSelector.findNextItem(sPath);
				that.getModel("appView").setProperty("/itemToSelect", oNextItemToSelect.getBindingContext().getPath()); //save last deleted
			};
			this._confirmDeletionByUser({
				question: sQuestion
			}, [sPath], fnMyAfterDeleted);
		},

		_onObjectMatched: function(oEvent) {
			var oParameter = oEvent.getParameter("arguments");
			for (var value in oParameter) {
				oParameter[value] = decodeURIComponent(oParameter[value]);
			}

			this._bindView(oParameter.artifactId);

		},
	
		_bindView: function(sObjectPath) {
			// Set busy indicator during view binding
			var oViewModel = this.getModel("workbook");

			// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			oViewModel.setProperty("/busy", false);
		},

		_onBindingChange: function() {
			var oView = this.getView(),
				oElementBinding = oView.getElementBinding();
				// oViewModel = this.getModel("workbook"),
				// oAppViewModel = this.getModel("appView");

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("detailObjectNotFound");
				// if object could not be found, the selection in the master list
				// does not make sense anymore.
				this.getOwnerComponent().oListSelector.clearMasterListSelection();
				return;
			}
		},
		_onMetadataLoaded: function() {
			// Store original busy indicator delay for the detail view
			var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
				oViewModel = this.getModel("workbook");

			// Make sure busy indicator is displayed immediately when
			// detail view is displayed for the first time
			oViewModel.setProperty("/delay", 0);

			// Binding the view will set it to not busy - so the view is always busy if it is not bound
			oViewModel.setProperty("/busy", true);
			// Restore original busy indicator delay for the detail view
			oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
		},

		_confirmDeletionByUser: function(oConfirmation, aPaths, fnAfterDeleted, fnDeleteCanceled, fnDeleteConfirmed) {
			/* eslint-enable */
			// Callback function for when the user decides to perform the deletion
			var fnDelete = function() {
				// Calls the oData Delete service
				this._callDelete(aPaths, fnAfterDeleted);
			}.bind(this);

			// Opens the confirmation dialog
			MessageBox.show(oConfirmation.question, {
				icon: oConfirmation.icon || MessageBox.Icon.WARNING,
				title: oConfirmation.title || this._oResourceBundle.getText("delete"),
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				onClose: function(oAction) {
					if (oAction === MessageBox.Action.OK) {
						fnDelete();
					} else if (fnDeleteCanceled) {
						fnDeleteCanceled();
					}
				}
			});
		},

		_callDelete: function(aPaths, fnAfterDeleted) {
			var oViewModel = this.getModel("workbook");
			oViewModel.setProperty("/busy", true);
			var fnFailed = function() {
				this._oODataModel.setUseBatch(true);
			}.bind(this);
			var fnSuccess = function() {
				if (fnAfterDeleted) {
					fnAfterDeleted();
					this._oODataModel.setUseBatch(true);
				}
				oViewModel.setProperty("/busy", false);
			}.bind(this);
			return this._deleteOneEntity(aPaths[0], fnSuccess, fnFailed);
		},

		_deleteOneEntity: function(sPath, fnSuccess, fnFailed) {
			var oPromise = new Promise(function(fnResolve, fnReject) {
				this._oODataModel.setUseBatch(false);
				this._oODataModel.remove(sPath, {
					success: fnResolve,
					error: fnReject,
					async: true
				});
			}.bind(this));
			oPromise.then(fnSuccess, fnFailed);
			return oPromise;
		},

		onAddWorkbook: function(oEvent) {
			this.getRouter().getTargets().display("createWorkbook",{
				mode: 'create'
			});
		},

		onEditWorkbook: function() {
			this.getModel("workbook").setProperty('/editEnabled', true);
			this.rebindTable(this.oEditableTemplate, "Edit");
		},
		
		onSave: function(){
			this._oODataModel.submitChanges();
			
			this.rebindTable(this.oReadOnlyTemplate, "Navigation");
			this.getModel("workbook").setProperty('/editEnabled', false);
		},
		
		onCancel: function(){
			this.rebindTable(this.oReadOnlyTemplate, "Navigation");
			this.getModel("workbook").setProperty('/editEnabled', false);
		},
		
		openWorkbookPage: function(oEvent){
			
			/*this.getModel('appContext').setProperty('/masterdetail', false);
			this.getModel('appContext').setProperty('/fullscreen', true);         */
			
			this.getRouter().navTo("WorkbookDetails",{
				workbookContext: oEvent.getSource().getBindingContext().getPath().substring(11,13)
			}, true);
			
			/*var oNavContainer = this.getView().getParent().getParent().getParent();
			oNavContainer.to("workbookDetailsPage");*/
		}

	});
});