sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], (Controller, JSONModel) => {
    "use strict";

    return Controller.extend("sync.c10.property.binding.controller.Main", {
        onInit() {
            var oModel = new JSONModel();
            oModel.setData({
                firstName: "홍길동",
                enabled: true
            });
            this.getView().setModel(oModel);
        }
    });
});