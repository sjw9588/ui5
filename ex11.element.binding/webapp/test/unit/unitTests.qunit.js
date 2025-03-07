/* global QUnit */
// https://api.qunitjs.com/config/autostart/
QUnit.config.autostart = false;

sap.ui.require([
	"syncc10/ex11.element.binding/test/unit/AllTests"
], function (Controller) {
	"use strict";
	QUnit.start();
});