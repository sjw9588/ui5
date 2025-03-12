sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("sync.c10.salesreport.controller.Main", {
        onInit() {
        },
        onPressItemClick(oEvent){
            // 클릭한 행 정보
            var oItem = oEvent.getSource();

            // sales 모델 가져오기
            var oContext = oItem.getBindingContext("sales");

            // Main.view.xml 가져오기
            var oView = this.getView();

            // SalesDetail.view.xml 가져오기
            var oDetailView = oView.byId("idDetailView");

            // 경로 가져오기
            var sPath = oContext.getPath();

            // Detail에다가 현재의 상품 경로를 sales 모델과 연결해준다.
            oDetailView.bindElement({
                path : sPath,
                model : "sales",
            });

            // // fragment load (비동기)
            // this.oDialog ??= await this.loadFragment({
            //     name: "sync.c10.salesreport.view.Detail"
            // });
            // this.oDialog.open(); // fragment open
        }
    });
});