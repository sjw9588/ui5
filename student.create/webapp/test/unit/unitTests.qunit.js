/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"syncc10/student.create/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
