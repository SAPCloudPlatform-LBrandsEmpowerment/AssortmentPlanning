jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"com/lbrands/assortments/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"com/lbrands/assortments/test/integration/pages/App",
	"com/lbrands/assortments/test/integration/pages/Browser",
	"com/lbrands/assortments/test/integration/pages/Master",
	"com/lbrands/assortments/test/integration/pages/Detail",
	"com/lbrands/assortments/test/integration/pages/NotFound"
], function(Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "com.lbrands.assortments.view."
	});

	sap.ui.require([
		"com/lbrands/assortments/test/integration/NavigationJourneyPhone",
		"com/lbrands/assortments/test/integration/NotFoundJourneyPhone",
		"com/lbrands/assortments/test/integration/BusyJourneyPhone"
	], function() {
		QUnit.start();
	});
});