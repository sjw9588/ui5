/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"syncc10/gateway.crud/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
