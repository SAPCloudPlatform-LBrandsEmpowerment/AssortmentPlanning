jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

// We cannot provide stable mock data out of the template.
// If you introduce mock data, by adding .json files in your webapp/localService/mockdata folder you have to provide the following minimum data:
// * At least 3 Orders in the list
// * All 3 Orders have at least one Employee

sap.ui.require([
	"sap/ui/test/Opa5",
	"com/lbrands/assortments/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"com/lbrands/assortments/test/integration/pages/App",
	"com/lbrands/assortments/test/integration/pages/Browser",
	"com/lbrands/assortments/test/integration/pages/Master",
	"com/lbrands/assortments/test/integration/pages/Detail",
	"com/lbrands/assortments/test/integration/pages/Create",
	"com/lbrands/assortments/test/integration/pages/NotFound"
], function(Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "com.lbrands.assortments.view."
	});

	sap.ui.require([
		"com/lbrands/assortments/test/integration/MasterJourney",
		"com/lbrands/assortments/test/integration/NavigationJourney",
		"com/lbrands/assortments/test/integration/NotFoundJourney",
		"com/lbrands/assortments/test/integration/BusyJourney",
		"com/lbrands/assortments/test/integration/FLPIntegrationJourney"
	], function() {
		QUnit.start();
	});
});