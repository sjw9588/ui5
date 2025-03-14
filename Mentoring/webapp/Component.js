sap.ui.define(
  [
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/resource/ResourceModel",
  ],
  (UIComponent, JSONModel, ResourceModel) => {
    "use strict";

    return UIComponent.extend("ui5.walkthrough.Component", {
      metadata: {
        interfaces: ["sap.ui.core.IAsyncContentCreation"],
        manifest: "json", // manifest.json 을 연결해준다.
      },

      // Controller 에 있던 모델 setting 부분 여기로 옮기기 !
      init() {
        // init 함수를 부르는 부분
        UIComponent.prototype.init.apply(this, arguments);
        // data model 을 view에 만들기 (set)
        const oData = {
          // 나중에 사용할 때의 경로 : {/recipent/name}
          recipient: {
            name: "World",
          },
        };
        const oModel = new JSONModel(oData);
        // JSONModel로 위의 데이터를 생성
        this.setModel(oModel);  //이 앱에 model을 선언(뷰에 선언이 아니고)


// i18n 에 대한 부분 없애기 -> manifest.json 으로 이동

        // i18n Model을 현재 뷰에 만들기(set)
        // Resource Model로 생성해준다.
        // bundleName 이라는 property 에 어디에 있는 i18n 파일인지 적어주기
        // const i18nModel = new ResourceModel({
        //   bundleName: "ui5.walkthrough.i18n.i18n",
          // i18n.properties 파일의 경로를 적어주기
        // });
        // 생성한 모델을 view에 저장해줄 건데, i18n 이라는 이름으로 모델을 setting
        // this.setModel(i18nModel, "i18n");

        //라우터 초기화, manifest.json에 정의된 라우터를 가져와서
        // 현재 URL을 확인하고 해당하는 뷰를 자동 로드
        this.getRouter().initialize();
      }
    });
});
// Component.js 는 이 앱의 설정 담당