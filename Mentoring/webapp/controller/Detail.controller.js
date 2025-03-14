sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
], (Controller, History) => {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.Detail", {
        onInit(){ // 라우터에 관한 설정 해줌.
            // 현재의 라우터 인스턴스를 가져옴
            const oRouter = this.getOwnerComponent().getRouter();
            // 그 중에서 "detail" 라우터 경로를 가져오고
            // detail 경로가 활성화될때마다, onObjectMatched 메소드를 실행
            // this(controller)를 넘겨서 컨트롤러의 this를 유지하게 한다. 
            oRouter.getRoute("detail").attachPatternMatched(this.onObjectMatched, this);
        }, 
        
        // url이 일치할때마다 실행하는 이벤트
        onObjectMatched(oEvent){
            // "arguments" -> parameter {} 들을 가져옴
            // 그 중에서 invoicePath 라는 argument 값을 가져온다.
            // 이때 가져오면서 인코딩 해제 -> decode
            // 이 값을 현재 뷰(Detail.view)의 invoice 모델에 binding
            this.getView().bindElement({
                path: "/" + window.decodeURIComponent(oEvent.getParameter("arguments").invoicePath),
                model: "invoice",
            });
        },

        onNavBack(){
            // History 객체 = 이동했었던 페이지 기록이 담김
            const oHistory = History.getInstance();
            // 페이지 이동 기록이 있는지 점검
            const sPreviousHash = oHistory.getPreviousHash();

            
            if (sPreviousHash !== undefined){
                //페이지 이동기록이 있을 때
                        window.history.go(-1); // 뒤로가기를 수행
            }  else {// 페이지 이동 기록이 없을 때 = 무조건 overview로 이동시킴
                
                const oRouter = this.getOwnerComponent().getRouter();
                // navTo(route 이름, 전달한 parameter값, 이동 기록 초기화 -> true)
                oRouter.navTo("overview", {}, true);
                //true까지 써야 초기화가 됨
            }
        },        
    });
});