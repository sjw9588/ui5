sap.ui.define(
    ["sap/ui/core/mvc/Controller", "sap/ui/core/routing/History"],
    (Controller, History) => {
        "use strict";

        return Controller.extend("sync.c10.odata.northwind.controller.Main", {
            onInit() {
                // Orders가 시작되면, _onPatternMatched 가 자동 실행
                var oRouter = this.getOwnerComponent().getRouter();
                var oRoute = oRouter.getRoute("RouteOrders");
                oRoute.attachPatternMatched(this._onPatternMatched, this);
            },

            _onPatternMatched(oEvent) {
                debugger;

                // 넘겨줬던 CusID(Customer의 경로)
                var sCusID = window.decodeURIComponent(
                    oEvent.getParameter("arguments").CusID
                );
                var oView = this.getView();
                var sPath = sCusID; // 현재 경로가 -> sCusID
                console.log(`Orders에서 ${sPath}`);

                oView.bindElement(sPath); // 뷰에 바인딩
            },

            // 이전으로 가기 구현
            onNavpress() {
                var oHistory = History.getInstance();
                var oPrevious = oHistory.getPreviousHash();

                if (oPrevious) {
                    window.history.go(-1);
                } else {
                    this.getOwnerComponent()
                        .getRouter()
                        .navTo("RouteMain", null, true);
                }
            },
        });
    }
);
