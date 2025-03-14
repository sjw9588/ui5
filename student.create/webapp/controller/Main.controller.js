sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
], (Controller,
	JSONModel,
	MessageBox) => {
    "use strict";

    return Controller.extend("sync.c10.student.create.controller.Main", {
        onInit() {
            var oData = {
                student: {
                    Stdid: "학번",
                    Name: "이름"
                }
            }

            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "new");

        },
        onSave(){
            // alert('저장버튼');
            // JSON Model
            var oNewModel = this.getView().getModel("new");
            var oData =  oNewModel.getData();
            var oNewData = {
                Stdid: oData.student.Stdid,
                Name: oData.student.Name
            }
            // OData Model
            var oModel = this.getView().getModel();

            // 경로, 데이터, 결과처리
            oModel.create(
                "/StudentSet", // EntitySet 이름을 경로로 지정
                oNewData,           //신규생성될 학생정보
                {
                    success: function(oData, oResponse){
                        MessageBox.success("입력하신 학생정보가 생성되었습니다.");
                    },
                    error: function(oError){
                        MessageBox.error("입력하신 학생정보 생성에 실패했습니다.");
                    }
                }
            )

        },
        onClear(){
            // alert('초기화버튼');
            var oModel = this.getView().getModel("new");
            oModel.setData({ student: {
                Stdid: "",
                Name: ""
            } });
        }
    });
});