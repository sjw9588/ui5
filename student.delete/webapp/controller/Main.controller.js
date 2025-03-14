sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox"
], (Controller,
	MessageBox) => {
    "use strict";

    return Controller.extend("sync.c10.student.delete.controller.Main", {
        onInit() {
        },
        onDelete: function( oEvent ){
            // alert('삭제 버튼을 눌렀습니다.');

            var oButton = oEvent.getSource();
            // Context는 모델에서 특정 경로의 데이터에 접근할 수 있는 객체
            var oContext = oButton.getBindingContext();
            // 모델에서 특정 경로의 데이터를 접근할 수 있는 Context에게
            // 현재 어떤 경로의 데이터를 접근하는지 경로를 가져오는 것
            var sPath = oContext.getPath();

            // alert("내가 클릭한 버튼의 모델의 특정 데이터의 경로: " + sPath);

            // oData Model을 가져온다.
            // 왜? oData Model을 가져온다고 말할 수 있는가?
            // manifest.json에서 그 이유를 증명할 수 있다.
            // 이름이 공백("")으로 되어있는 모델이 있다.
            // 이 모델은 dataSource라는 속성에 mainService라는 값이 있다.
            // manifest.json에서 속성 중 sap.app 속성에는
            // dataSource들이 모여있는 dataSources가 있다.
            // 해당 속성을 찾아가면, mainService가 기록되어 있다.
            // 그 서비스의 타입을 살펴보면, oData라고 되어 있다.
            var oModel = this.getView().getModel();

            // 특정경로의 모델 정보에서 Name으로 된 Property의 값을 변수 sName을 선언하면서 기록한다.
            var sName = oContext.getProperty("Name");

            //경로 : /EntitySet
            //특정경로 : /EntitySet(키값)

            //oModel.create(경로, 생성할 데이터, 후속작업)
            //oModel.read(경로/특정경로, 후속작업)
            //oModel.update(특정경로, 변경할 데이터, 후속작업)
            oModel.remove(
                //특정경로, 후속작업
                // "/StudentSet('1')"
                sPath, // 내가 클릭한 버튼의 모델 경로
                {
                    success: function(){
                        MessageBox.success("학생 " +sName+ "가 삭제되었습니다.");
                    },
                    error: function( oError ){
                        MessageBox.error("학생 " +sName+ "를 삭제하지 못했습니다.");
                    }
                }
            )
        }
    });
});