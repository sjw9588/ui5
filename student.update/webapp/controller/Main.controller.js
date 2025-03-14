sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], (Controller, JSONModel) => {
    "use strict";

    return Controller.extend("sync.c10.student.update.controller.Main", {
        onInit() {
            // 입력필드 등에서 올바른 값이 아닌 경우 Message를 출력하기 위한 조치
            // 타입이 불일치하거나, 유효성이 어긋나는 경우에 관련된 메세지가 출력
            // Input에 constraints를 사용한 경우 등이 대표적이다.
            var oMessageManager = sap.ui.getCore().getMessageManager();
            oMessageManager.registerObject(this.getView(), true);

            // Dialog에서 사용할 JSON Model을 update라는 이름으로 화면에 연결
            var oModel = new JSONModel();
            oModel.setData({
                student: {
                    Stdid: "",
                    Name: ""
                }
            });

            this.getView().setModel(oModel, "update");

        },
        onItemPress(oEvent){
            // 이 메소드는 List에서 item을 마우스 클릭할 때 실행된다.

            // alert('아이템선택!');
            // 선택한 item정보를 가져와서 그 item에 연결된 모델 데이터 정보를 가져온다.
            var oSelectedItem = oEvent.getSource();
            var oContext = oSelectedItem.getBindingContext(); //모델의 정보를 접근할 수 있음.
           
            // Dialog에서 데이터를 출력하기 위해 변수를 선언하고,
            // 필요한 경로의 데이터는 내가 선택한 item에서 가져와 기록한다.
            var oData = {
                student: {
                    Stdid: oContext.getProperty("Stdid"),
                    Name: oContext.getProperty("Name")
                },
                path: oContext.getPath()
            }   //path를 추가해서 맨아래에서 사용함.

            // Dialog에 띄우기 위해 준비한 데이터를 update모델에 기록한다.
            // Dialog는 update모델에 접근하여 데이터를 출력하고 있다.
            var oModel = this.getView().getModel("update");
            oModel.setData(oData);
            
            // Fragment를 읽어서 Dialog를 화면에 출력하기 위한 메소드.
            this._openDialog();

            // var oData = oContext.getProperty("");
            // alert("ID:" + oData.Stdid + "\n"
            //         +"Name:" + oData.Name);
        },

        async _openDialog(){
            //webapp폴더 밑에 view폴더 밑에 Edit이라는 fragment.xml파일을 불러온다.
            // 이미 불러온 적이 있으면 또 불러오지는 않는다.( ??=의 역할 )
            this.oDialog ??= await this.loadFragment({
                name: 'sync.c10.student.update.view.Edit'
            });
            //Dialog를 화면에 팝업으로 출력시킨다.
            this.oDialog.open();
        },

        onSave(){
            // alert('저장');
            var oView = this.getView();
            var oModel = oView.getModel(); // oData Model
            var oUpdateModel = oView.getModel("update"); // JSON Model
            var oData = oUpdateModel.getData();
            var oUpdateData = {
                Stdid: oData.student.Stdid, //JSON Model의 /student/Stdid
                Name: oData.student.Name //JSON Model의 /student/Name
            }
            
            // 경로, 변경할데이터, 결과처리
            // 경로는 EntitySet에서 특정 Entry를 취급하는 경로
            // 예) /StudentSet('1')
            oModel.update(
                oData.path,
                oUpdateData,
                {
                    success: function(){
                        alert('변경에 성공했습니다.');
                    },
                    error: function(){
                        alert('변경에 실패했습니다.');
                    }
                }
            );
        },

        onClose(){
            // this.oDialog.close();
            if( this.oDialog ){
                this.oDialog.close();
            }
        }
    });
});