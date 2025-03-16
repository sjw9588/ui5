sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("sync.c10.odata.northwind.controller.Main", {
        onInit() {
        },
        
        onSelection(oEvent) {
            // 테이블의 한 줄에 대한 정보를 가지고 옴
            var oContext = oEvent.getParameter("rowContext");
            // 어떤 거인지 path를 저장
            var sPath = oContext.getPath();
            console.log(sPath); // 테스트용

            // Router 지정
            var oComponent = this.getOwnerComponent();
            var oRouter = oComponent.getRouter();
            // Orders 로 넘길때 현재 경로를 넘겨버림 (CusID 라는 값으로->manifest에 지정)
            oRouter.navTo("RouteOrders", {
                CusID: window.encodeURIComponent(sPath),
            });
        },
    });
});