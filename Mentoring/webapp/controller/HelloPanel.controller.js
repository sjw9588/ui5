sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], (Controller, MessageToast) => {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.HelloPanel", {

      // ABAP의 Initialization 과 같은 역할을 하는 메소드 onInit()
      //   onInit() {},

      // App.view.xml 에서 지정해놨던 버튼의 press 이벤트 매소드
      onShowHello() {
        // i18n 모델에서 가져다 쓰기
        // i18n 이름으로 지정된 모델의 모든 리소스(데이터)들을 가지고 온다.
        const oBundle = this.getView().getModel("i18n").getResourceBundle();

        // 위에서 oData로 선언했던 모델을 가져오기 (Model 명이 정해져있지 않다) -> 경로로 적어준다.
        const sRecipient = this.getView()
          .getModel()
          .getProperty("/recipient/name");

        // 두 개를 사용해서 Message를 만들기
        // oBundle (i18n 모델) 에서 helloMsg에 해당하는 것을 가지고 오는데
        // helloMsg=Hello {0} 이므로, {0} 에 들어갈 값으로 sRecipient를 넣어준다.
        const sMsg = oBundle.getText("helloMsg", [sRecipient]);

        MessageToast.show(sMsg); //// MessageToast 모듈을 불러와서 사용한다.
      },

       // 비동기로 버튼 클릭했을 때 Dialog를 화면에 띄우는 메소드 구현
      async onOpenDialog(){
        // oDialog 객체가 없다면 새롭게 생성
        // 객체가 있다면 아래 부분은 실행하지 않고 마지막의 open만 실행
        // await 때문에 loadFragment가 끝날때까지 대기를 한다.

        this.oDialog ??= await this.loadFragment({
            name: "ui5.walkthrough.view.HelloDialog" // Dialog view 경로
        });
        
        this.oDialog.open();    //Dialog open
      },

      onCloseDialog(){
        // this.byId("helloDialog").close();
        // id로 Dialog를 찾기
        // 찾는걸 성공하면 close.
        var oDialog = this.byId("helloDialog");
        if (oDialog){
            oDialog.close();
        }
      }
    });
});