sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("sync.c10.message.manager.controller.Main", {
        onInit() {
             var oView = this.getView();

             // Message Manager에 현재 화면을 연결하는 과정
             // 화면에서 Parse / Valid에 관한 오류가 발생 시 자동으로 메세지가 출력된다.
             sap.ui.getCore().getMessageManager().registerObject(oView, true);

             // Test 를 위한 JSON Model 생성
             var oModel = new sap.ui.model.json.JSONModel({ test4: '20250306'});
             oView.setModel(oModel);
        }
    });
});