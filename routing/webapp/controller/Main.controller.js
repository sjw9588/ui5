sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("sync.c10.routing.controller.Main", {
        onInit() {
        },
        onPress(oEvent){
            // alert('a');
            var oItem = oEvent.getSource();

            var oContext = oItem.getBindingContext();

            var sPath = oContext.getPath();
            alert(sPath);
            console.log(sPath);

            var oComponent = this.getOwnerComponent();
            var oRouter = oComponent.getRouter();
            oRouter.navTo("RouteDetail", {
                BizUUID: window.encodeURIComponent( oContext.getProperty("BusinessPartnerUUID") )
            });
        },

        onChange(oEvent){
            var oComboBox = oEvent.getSource();
            var sKey = oComboBox.getSelectedKey();

            var aFilter = [];
            var oFilter = null;

            if ( sKey !== "00"){
                oFilter = new sap.ui.model.Filter(
                    "BusinessPartnerRole",
                    sap.ui.model.FilterOperator.EQ,
                    sKey
                );
                aFilter.push(oFilter);
            }
            var oTable = this.byId("idSupplierTable");
            var oBinding = oTable.getBinding("items");
            oBinding.filter(aFilter);
        }
    });
});