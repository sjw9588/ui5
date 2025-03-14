sap.ui.define([
	"sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
], function(
	Controller, JSONModel, MessageBox
) {
	"use strict";

	return Controller.extend("sync.c10.gateway.crud.controller.Create", {
        onInit(){
            var oData = {
                carrier: {
                    Carrid: "",
                    Carrname: "",
                    Currcode: "",
                    Url: "",
                },
            };
            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "new");
        },
        onSave(){
            //JSON Model
            var oNewModel = this.getView().getModel("new");
            var oData = oNewModel.getData();
            var oNewData = {
                Carrid: oData.carrier.Carrid,
                Carrname: oData.carrier.Currcode,
                Url:oData.carrier.Url,
            };

            // OData Model
            var oModel = this.getView().getModel();

            // 경로, 데이터, 결과처리
            oModel.create(
                "/CarrierSet", // EntitySet 이름을 경로로 지정
                oNewData, //신규생성 될 carrier
                {
                    success: function (oData, oResponse){
                        MessageBox.success(
                            "입력하신 항공사가 생성되었습니다."
                        );
                    },
                    error: function (oError){
                        MessageBox.error(
                            "입력하신 항공사 생성에 실패했습니다."
                        );
                    },
                }
            );
        },
        onClear(){
            var oModel = this.getView().getModel("new");
            oModel.setData({ carrier: {} }); // 비워둔 상태로 초기화
        },
	});
});