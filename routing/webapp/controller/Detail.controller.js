sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"
], function(
	Controller, History
) {
	"use strict";

	return Controller.extend("sync.c10.routing.controller.Detail", {

		onInit: function(){
			// URL의 패턴이 일치할 때마다, 항상 _onPatternMatched() 를 호출한다.
			var oRouter = this.getOwnerComponent().getRouter();
			var oRoute = oRouter.getRoute("RouteDetail");
			oRoute.attachPatternMatched(this._onPatternMatched, this);

			alert("onInit이 실행된 경우")
		},

		_onPatternMatched(oEvent){
			// alert("패턴이 일치할 때마다 자동으로 실행되는 함수");
			debugger;
			
			// 왜 window.decodeURIComponent()를 써야하는가?
			// 보내줄 때 window.decodeURIComponent()를 사용했기 때문에
			// encode(암호화)을 decode(복호화)해주는 과정이 필요하기 때문이다.
			// 복호화는 암호화 이전의 원래 문자로 되돌려주는 작업을 의미한다.
			var sBizUUID = window.decodeURIComponent(oEvent.getParameter("arguments").BizUUID)

			var oView = this.getView();
			var sPath = "/Supplier(guid'" + sBizUUID + "')";
			oView.bindElement(sPath);
		},
		onNavPress(){
			// 이전화면 기록이 있는지 PreviousHash를 통해 확인한다.
			// 이전화면 기록이 있으면, 뒤로 이동할 수 있다.
			// 없으면 뒤로 이동할 수 없다. 없을 때는 그냥 Main View로 이동하게 만든다.
			var oHistory = History.getInstance();
			var oPrevious = oHistory.getPreviousHash();

			if ( oPrevious ){
				alert('뒤로 이동');
				window.history.go(-1);
			} else{
				alert('무조건 Main View로 이동');
				this.getOwnerComponent().getRouter().navTo("RouteMain",{}, null, true);
			}
		}
	});
});