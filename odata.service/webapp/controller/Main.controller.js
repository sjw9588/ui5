sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("sync.c10.odata.service.controller.Main", {
        onInit() {
        },
        // 항공편 테이블의 데이터를 클릭하면 실행되는 메소드
        // oEvent는 실행될 때 발생한 정보를 받아올 수 있다.
        onPressConnection(oEvent){
            // Event가 발생한 UI를 가져온다.
            var oSelectedItem = oEvent.getSource();

            // 해당 UI에 연결된 Model 정보를 가져온다.
            var oContext = oSelectedItem.getBindingContext();

            // Model의 경로를 가져온다.
            var sPath = oContext.getPath();

            // 이 경로를 현재 view의 경로로 취급한다.
            var oView = this.getView();
            oView.bindElement(sPath);   //setCurrentPathOfModel
            // this.getView().bindElement(sPath);

        }
    });
});