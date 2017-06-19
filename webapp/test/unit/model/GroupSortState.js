sap.ui.define([
	"com/lbrands/assortments/model/GroupSortState",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/sinon",
	"sap/ui/thirdparty/sinon-qunit"
], function(GroupSortState, JSONModel) {
	"use strict";

	QUnit.module("GroupSortState - grouping and sorting", {
		beforeEach: function() {
			this.oModel = new JSONModel({});
			// System under test
			this.oGroupSortState = new GroupSortState(this.oModel, function() {});
		}
	});

	QUnit.test("Should always return a sorter when sorting", function(assert) {
		// Act + Assert
		assert.strictEqual(this.oGroupSortState.sort("EmployeeID").length, 1, "The sorting by EmployeeID returned a sorter");
		assert.strictEqual(this.oGroupSortState.sort("EmployeeID").length, 1, "The sorting by EmployeeID returned a sorter");
	});

	QUnit.test("Should return a grouper when grouping", function(assert) {
		// Act + Assert
		assert.strictEqual(this.oGroupSortState.group("EmployeeID").length, 1, "The group by EmployeeID returned a sorter");
		assert.strictEqual(this.oGroupSortState.group("None").length, 0, "The sorting by None returned no sorter");
	});

	QUnit.test("Should set the sorting to EmployeeID if the user groupes by EmployeeID", function(assert) {
		// Act + Assert
		this.oGroupSortState.group("EmployeeID");
		assert.strictEqual(this.oModel.getProperty("/sortBy"), "EmployeeID", "The sorting is the same as the grouping");
	});

	QUnit.test("Should set the grouping to None if the user sorts by EmployeeID and there was a grouping before", function(assert) {
		// Arrange
		this.oModel.setProperty("/groupBy", "EmployeeID");

		this.oGroupSortState.sort("EmployeeID");

		// Assert
		assert.strictEqual(this.oModel.getProperty("/groupBy"), "None", "The grouping got reset");
	});
});