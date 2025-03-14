sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], (Controller, MessageToast) => {
    "use strict";

    return Controller.extend("sync.c10.hw4.controller.Main", {
        onInit() {
        },
        // 출력된 데이터의 한 행을 클릭할 때 작동
        onPress(oEvent){
            // alert("test");
             //클릭한 행 정보를 가져온다.
            var oSelectedItem = oEvent.getSource();
            // getBindingContext(모델이름)은 연결된 데이터 정보를 가져온다.
            // oItem은 클릭한 행 정보이므로, 가져오는 모델 정보는 결국 내가 클릭한 행의 데이터 정보이다.
            var oContext = oSelectedItem.getBindingContext("conn");
            // 가져온 데이터 정보의 모든 속성 정보를 가져온다.
            var oData = oContext.getProperty();

            // MessageToast 컨트롤을 통해 클릭한 행의 항공사, 항공편 정보를 짧은 시간동안 출력한다.
            MessageToast.show("선택하신 라인은 항공사:" + (oData.CARRID) + ", 항공편:" + (oData.CONNID) + "의 정보입니다.");
        },

        // 출력된 데이터의 한 행을 클릭할 때 작동
        async onPressOpenDialog(oEvent){
            // alert("test");
            //클릭한 행 정보를 가져온다.
            var oSelectedItem = oEvent.getSource();
            // getBindingContext(모델이름)은 연결된 데이터 정보를 가져온다.
            // oItem은 클릭한 행 정보이므로, 가져오는 모델 정보는 결국 내가 클릭한 행의 데이터 정보이다.
            var oContext = oSelectedItem.getBindingContext("conn");
            // 전달한 경로가 현재 경로가 된다.
            var sPath = oContext.getPath();

            //Fragment 불러오기, 객체가 없다면 새로 생성해주되 loadFragment가 끝날때까지 대기한다.
            //객체가 이미 있다면 그냥 넘어간다.
            this.oDialog ??= await this.loadFragment({
                name: "sync.c10.hw4.view.Info"
            });

            this.oDialog.bindElement({ path: sPath, model: "conn"}); // 현재 경로를 통해 데이터 바인딩
            this.oDialog.open(); //팝업창 출력
        },

        //Info.Fragment.xml에서 생성한 ‘닫기’ 버튼 클릭 시 작동
        onClose(){
            //this.byId()는 idDialog라는 이름의 컨트롤을 찾아서,  oDialog에게 반환한다.
            var oDialog = this.byId("idDialog");
            //현재 view에 idDialog라는 ID를 가진 컨트롤이 있는지 확인 후, 
            //존재할 경우 해당 Dialog를 닫는다.
            if (oDialog) {
                oDialog.close();
            }
        }
    });
});