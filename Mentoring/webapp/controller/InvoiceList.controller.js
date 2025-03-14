sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], (Controller, JSONModel, Filter, FilterOperator) => {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.InvoiceList", {
        onInit() {
            const oViewModel = new JSONModel({
                currency: "EUR"
            });
            this.getView().setModel(oViewModel,"view");
        },

        onFilterInvoices(oEvent){
            // oEvent = 이벤트에 대한 정보가 전달되는 parameter
            const aFilter = []; // filter에 관련된 내용들을 담을 배열 구성
            // SearchField에 입력된 값은 반드시 query
            const sQuery = oEvent.getParameter("query"); //query라는 이름의 파라미터 값을 가지고 옴 
            if(sQuery){
                // push = 배열에 추가(append)
                //new Filter(비교할 필드의 이름) / 비교할 방법 / 비교할 값)
                aFilter.push(new Filter("ProductName", FilterOperator.Contains, sQuery));
            }
            //필터링 결과를 다시 바인딩(연결, 넣어주기) 해줘야함.
            const oList = this.byId("invoiceList"); // 넣어 줄 부분 (List의 id)
            const oBinding = oList.getBinding("items"); // 그 리스트 안에서 items를 찾는다.
            oBinding.filter(aFilter); // items에 필터링 적용
        },
        
        // item을 눌렀을 때 일어나는 event
        // detail view로 이동하게 구현한다.
        onPress(oEvent){
            const oItem = oEvent.getSource(); // Source -> 출처(이벤트가 발생한 근원지)
            const oContext = oItem.getBindingContext("invoice"); // invoice 모델로 연결된 내용 가져오기
            const sPath = oContext.getPath(); // 현재 클릭한 부분의 경로 가져오기
            const sPathEx = sPath.substring(1); // 첫번째 글자를 뺀 나머지 -> ~~/~~ 디코딩시 붙는 슬래시 제거 목적
            const oParam = {
                invoicePath : window.encodeURIComponent(sPathEx)
                // detail의 파라미터 invoicePath에 값 집어넣기
                // 이때, uri로 encoding 해서 전달해줘야함
            };

            // OwnerComponent는 manifest.json에서 설정한 다양한 정보를 가지고 옴.
            // 그 중 manifest.json에서 설정한 Routing에 관련된 객체를 가지고 오기.
            const oRouter = this.getOwnerComponent().getRouter();

            // manifest.json의 routes 부분에서 name의 값이 detail인 것으로 이동
            // 이때 이번에는 invoicePath의 파라미터까지 같이 전달한다.
            oRouter.navTo("detail", oParam);


            // = getRouter()
            // const oRouter = this.getOwnerComponent().getRouter();
            // manifest.json의 routes 부분에서 name의 값이 detail인 것으로 이동

            // oRouter.navTo("detail", {
            //     invoicePath: window.encodeURIComponent(oItem.getBindingContext("invoice").getPath().substring(1))
            // });

            // 그 다음에 해당 항목의 Target으로 현재 Page 를 교체
        }
    });
});