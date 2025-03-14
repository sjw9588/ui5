sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
], (Controller,
	JSONModel,
	MessageBox) => {
    "use strict";

    return Controller.extend("sync.c10.gateway.crud.controller.Main", {
        onInit() {
            var oData = {
                carrier : {
                    Carrid : "",
                    Carrname: "",
                    Currcode: "",
                    Url: ""
                },
            };
            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "update"); // update라는 모델
        },
       
        //수정 버튼
        onUpdate(oEvent){
            // 선택한 Item 정보를 가져와서 그 ITEM에 연결된 모델 데이터 정보를 가져온다.
            var oSelectedItem = oEvent.getSource();
            var oContext = oSelectedItem.getBindingContext();

            // Dialog에서 데이터를 출력하기 위해 변수를 선언하고 
            // 필요한 경로의 데이터는 내가 선택한 item에서 가져와 기록
            var oData = {
                carrier: {
                    Carrid: oContext.getProperty("Carrid"),
                    Carrname: oContext.getProperty("Carrname"),
                    Currcode: oContext.getProperty("Currcode"),
                    Url: oContext.getProperty("Url"),
                },
                path: oContext.getPath(),
            };

            var oModel = this.getView().getModel("update");
            oModel.setData(oData);

            // Fragment 읽어서 Dialog 화면 출력
            this.openDialog();
        },

        async openDialog(){
            this.oDialog ??= await this.loadFragment({
                name: "sync.c10.gateway.crud.view.Edit"  
            });
            this.oDialog.open();
        },

        //수정에서 저장
        onSave(){
            var oView = this.getView();
            var oModel = oView.getModel(); //oData Model
            var oUpdateModel = oView.getModel("update");
            var oData = oUpdateModel.getData();
            var oUpdateData = {
                Carrid: oData.carrier.Carrid,
                Carrname: oData.carrier.Carrname,
                Currcode: oData.carrier.Currcode,
                Url: oData.carrier.Url
            };

            oModel.update(oData.path, oUpdateData, {
                success(){
                    alert("변경 성공");
                },
                error(){
                    alert("변경 실패");
                },
            });
            this.onClose(); // 할 거 다하고 닫음
        },

        //닫기 구현
        onClose(){
            var oDialog = this.getView().byId("idEditDialog");
            oDialog.close();
        },

        onDelete(oEvent){
            var oButton = oEvent.getSource();
            // 특정 경로 데이터에 접근할 수 있음.
            var oContext = oButton.getBindingContext();
            // 현재 어떤 경로인지
            var sPath = oContext.getPath();
            // 현재의 Carrid 가져옴
            var sCarrid = oContext.getProperty("Carrid");

            var oModel = this.getView().getModel(); //oData

            // 삭제 구현
            oModel.remove(
                sPath, // 내가 클릭한 버튼의 모델 경로
                {
                    success(){
                        MessageBox.success(
                            `Carrier ${sCarrid}가 삭제되었습니다.`  // 백쿼터(`)를 쓰면 
                        );
                    },
                    error(oError){
                        MessageBox.error(
                            `Carrier ${sCarrid} 삭제를 실패했습니다.`
                        );
                    },
                }
            );
        }
    });
});