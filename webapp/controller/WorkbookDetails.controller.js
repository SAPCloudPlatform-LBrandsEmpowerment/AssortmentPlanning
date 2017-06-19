sap.ui.define([
	"com/lbrands/assortments/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/format/DateFormat",
	"com/lbrands/assortments/model/formatter"
], function(BaseController, JSONModel, MessageToast, Filter, FilterOperator, DateFormat, Formatter) {
	"use strict";

	return BaseController.extend("com.lbrands.assortments.controller.WorkbookDetails", {

		onInit: function() {

			var oWorkbookContextModel = new JSONModel({
				length: 0
			});

			this.getView().setModel(oWorkbookContextModel, 'workbookcontext');

			this.oTable = this.getView().byId('idSpreadsheetTable');
			this.oDataModel = this.getOwnerComponent().getModel();
			this.getRouter().getRoute("WorkbookDetails").attachMatched(null, this._onDisplay, this);

			this._Fields = this.getOwnerComponent().getModel('fields').getData();
			this._initTableControl();

		},

		_onDisplay: function(oData) {

			var workbookKey = oData.getParameter('arguments').workbookContext,
				sPath = '/' + this.oDataModel.createKey('Workbooks', {
					"ID": workbookKey
				}),
				oContext = new sap.ui.model.Context(this.oDataModel, sPath);

			this.getView().setBindingContext(oContext);

			// this.getModel('worbookcontext').setProperty('/workbookId',workbookKey);

			//Init Dynamic Table Columns
			this._initTableColumns();
		},

		_initTableControl: function() {
			var oColumnModel = new JSONModel(),
				oCellModel = new JSONModel();

			oColumnModel.setData([]);
			oCellModel.setData([]);
			this.getView().setModel(oColumnModel, "columns");
			this.getView().setModel(oCellModel, "cells");

			var oColumnHeaderTemplate = new sap.m.Column({
				width: "auto",
				header: new sap.m.Label({
					text: "{columns>Name}"
				})
			});

			this.oTable.bindAggregation('columns', {
				path: 'columns>/results',
				template: oColumnHeaderTemplate,
				templateShareable: true
			});
		},

		_initTableColumns: function() {
			var that = this,
				oColumnModel = this.getModel('columns'),
				templateID = that.getView().getBindingContext().getProperty('TemplateID'),
				sPath = this.getView().getBindingContext().sPath + '/Templates(' + templateID + ')/TemplateFields';

			this.oDataModel.read(sPath, {
				success: function(oData) {
					oColumnModel.setData(oData);
					that._initTableCells(oData.results);

					that.getModel('workbookcontext').setProperty('/columns', oData.results);

				},
				error: function(oError) {

				}
			});

		},

		_fetchCellMetadata: function(oColumnName) {
			//this._Fields = 
			var selectedColumn = this._Fields.filter(function(v) {
				return v.Name === oColumnName;
			});

			return {
				key: selectedColumn[0].FieldKey,
				controlType: selectedColumn[0].ControlType
			};

		},

		_initTableCells: function(aColumns) {
			var that = this;

			var oEditableTemplate = new sap.m.ColumnListItem({
				type: "Active"
			});

			aColumns.forEach(function(oColumn) {
				var sColumnMetadata = that._fetchCellMetadata(oColumn.Name);

				if (sColumnMetadata.controlType === 'OpenText') {

					var oCellTemplate = new sap.m.Input({
						value: "{cells>" + sColumnMetadata.key + "}"
					});

					/*if (sColumnMetadata.key === 'Generic') {
						oCellTemplate.setEditable(false);
					}*/

					/*if (sColumnMetadata.key === 'FlexId') {
						oCellTemplate.attachChange(function(oEvent) {
							var pwd = oEvent.getParameter('newValue');
							var Exp = /((^[0-9]+[a-z]+)|(^[a-z]+[0-9]+))+[0-9a-z]+$/i;

							if (!pwd.match(Exp))
								MessageToast.show('Validation Failure');
							else
								MessageToast.show('Validation Success');
								oEvent.getSource().getParent().getCells()[2].setEnabled(true);
							
						});
					}*/

					oEditableTemplate.addCell(oCellTemplate);

				} else if (sColumnMetadata.controlType === 'ValueHelpText') {

					if (sColumnMetadata.key === 'PricePoint') {
						oEditableTemplate.addCell(new sap.m.Select({
							items: [
								new sap.ui.core.Item({
									text: "Best"
								}),
								new sap.ui.core.Item({
									text: "Premium"
								})
							]
						}));
					} else if (sColumnMetadata.key === 'ProductLifecycle') {
						oEditableTemplate.addCell(new sap.m.Select({
							items: [
								new sap.ui.core.Item({
									text: "Basic"
								}),
								new sap.ui.core.Item({
									text: "Fashion"
								})
							]
						}));
					}

				} else if (sColumnMetadata.controlType === 'DerivedText') {

					if (sColumnMetadata.key === 'FlexChoice') {
						oEditableTemplate.addCell(new sap.m.Text({
							text: "{cells>FlexId}{cells>FlexColor}"
						}));
					}

				}

			});

			this._refreshCellsData();

			this.oTable.bindAggregation('items', 'cells>/', oEditableTemplate);
		},

		_refreshCellsData: function() {
			var that = this,
				oCellModel = this.getModel('cells'),
				sPath = this.getView().getBindingContext().sPath + '/MATRecords';
			this.oDataModel.read(sPath, {
				success: function(oData) {
					var transformedData = oData.results.map(function(v) {
						return JSON.parse(v.MAT_VALUE);
					});
					oCellModel.setData(transformedData);

					//Store Old context
					that.getModel('workbookcontext').setProperty('/length', oData.results.length);
				},
				error: function(oError) {

				}
			});
		},

		_createBlankRecord: function(oEvent) {
			var that = this,
				aColumns = this.getModel('workbookcontext').getProperty('/columns'),
				oCellModel = this.getModel('cells'),
				cellsData = oCellModel.getData(),
				newObject = {},
				fieldKey = '';

			jQuery.each(aColumns, function(i, v) {
				if (that._fetchCellMetadata(v.Name)) {
					fieldKey = that._fetchCellMetadata(v.Name).key;
					newObject[fieldKey] = '';
				}
			});

			cellsData.push(newObject);
			oCellModel.setData(cellsData);

			var oMATRecord = {
				"MAT_ID": cellsData.length,
				"WorkbookID": this.getView().getBindingContext().getProperty('ID'),
				"MAT_VALUE": JSON.stringify(newObject)
			};

			this.oDataModel.createEntry('MATRecords', {
				properties: oMATRecord
			});

		},

		_copyRecord: function(oEvent) {
			var selectedContext = this.byId("idSpreadsheetTable").getSelectedContexts();

			if (selectedContext && selectedContext.length) {
				var oLocalModel = this.getModel('cells'),
					cellsData = oLocalModel.getData(),
					newObject = jQuery.extend(true, {}, selectedContext[0].getObject());

				cellsData.push(newObject);

				oLocalModel.setData(cellsData);

				var oMATRecord = {
					"MAT_ID": cellsData.length,
					"WorkbookID": this.getView().getBindingContext().getProperty('ID'),
					"MAT_VALUE": JSON.stringify(newObject)
				};

				this.oDataModel.createEntry('MATRecords', {
					properties: oMATRecord
				});
			} else {
				MessageToast.show('Please select a record');
			}

		},

		_deleteRecord: function(oEvent) {
			var selectedContext = this.byId("idSpreadsheetTable").getSelectedContexts();

			if (selectedContext && selectedContext.length) {
				var matId = parseInt(selectedContext[0].getPath().split('/')[1]) + 1,
					workbookId = this.getView().getBindingContext().getProperty("ID");

				this.oDataModel.remove('/MATRecords(MAT_ID=' + matId + ',WorkbookID=' + workbookId + ')');
				this._refreshCellsData();

			} else {
				MessageToast.show('Please select a record');
			}

		},

		filterGlobally: function(oEvent) {
			var sQuery = oEvent.getParameter('query');
			this._oGlobalFilter = new sap.ui.model.Filter('FlexId', 'Contains', sQuery);

			this.getView().byId("idSpreadsheetTable").getBinding("items").filter(this._oGlobalFilter, "cells");
		},

		_filter: function() {
			var oFilter = null;

			if (this._oGlobalFilter && this._oPriceFilter) {
				oFilter = new sap.ui.model.Filter([this._oGlobalFilter, this._oPriceFilter], true);
			} else if (this._oGlobalFilter) {
				oFilter = this._oGlobalFilter;
			} else if (this._oPriceFilter) {
				oFilter = this._oPriceFilter;
			}

		},

		navBack: function() {

			this.oDataModel.resetChanges();

			this.getModel('cells').setData([]);
			this.getModel('columns').setData([]);
			this.getModel('workbookcontext').setData({});

			this.getRouter().navTo("object", {
				artifactId: 'Workbooks'
			}, true);
			
			//Workaround - Need a better solution
			this.getView().getParent().back();
		},

		onWorkbookChangesSave: function() {
			var that = this,
				oLocalModel = this.getModel('cells'),
				aMATRecords = oLocalModel.getData();

			if (this.oDataModel.hasPendingChanges()) {
				this.oDataModel.submitChanges({
					success: function() {
						that._mergeUIChanges(aMATRecords);
					}
				});
			} else {
				that._mergeUIChanges(aMATRecords);
			}

			//that.oDataModel.submitChanges();

		},

		_mergeUIChanges: function(aMATRecords) {
			var that = this,
				oldRecordsLength = this.getModel('workbookcontext').getProperty('/length'),
				workbookId = this.getView().getBindingContext().getProperty('ID');
			jQuery.each(aMATRecords, function(i, obj) {
				var matIndex = i + 1;

				var oMATRecord = {
					"MAT_VALUE": JSON.stringify(obj)
				};
				/*that.oDataModel.createEntry('MATRecords', {
					properties: oMATRecord
				});	*/

				if (i < 20) {
					var sUpdatePath = '/MATRecords(MAT_ID=' + matIndex + ',WorkbookID=' + workbookId + ')';
					that.oDataModel.update(sUpdatePath, oMATRecord, {
						success: function() {
							that.navBack();
						}
					});
				}

			});
		},

		_onAuthorize: function() {
			var oTable = this.getView().byId("idSpreadsheetTable");
			oTable.getItems()[0].getCells()[2].setEditable(true);
		}

	});

});