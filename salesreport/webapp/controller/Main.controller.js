sap.ui.define([
    "sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], (Controller,
	JSONModel) => {
    "use strict";

    return Controller.extend("sync.c10.salesreport.controller.Main", {
        onInit() {
            var oModel = new JSONModel({
                Unit: "EA",
            });
            // view에  "view"라는 이름으로 모델 정의
            // view>/Unit
            this.getView().setModel(oModel, "view");
        },
        // item 클릭 되었을 때
        // 1. detail view에 정보 binding
        // 2. 정보 fragment 띄우기
        async onPressItemClick(oEvent){
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

            // fragment load (비동기)
            this.oDialog ??= await this.loadFragment({
                name: "sync.c10.salesreport.view.Detail"
            });

            // load 해온 fragment에 bindElement
            this.oDialog.bindElement({
                path:sPath,
                model: "sales"
            })
            this.oDialog.open(); // fragment open
        },

        // dialog 닫기 구현
        onCloseDialog(){
            var oDialog = this.byId("idDialog");
            if( oDialog ) {
                oDialog.close();
            }
        }
    });
});