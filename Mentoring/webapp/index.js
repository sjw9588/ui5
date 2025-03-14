sap.ui.define([
    "sap/ui/core/ComponentContainer"
], (ComponentContainer) => {
  "use strict";

  new ComponentContainer({
    name: "ui5.walkthrough", // ui5.walkthrough : webapp 폴더
    // Component.js 는 정해진 이름과 확장자여서 이름을 적지 않는다.
    settings: {
      id: "walkthrough",
    },
    async: true,
  }).placeAt("content"); // 이 내용을 content 로
});
// ComponentContainer 를 불러오는 거로 변경해준다.
// 폴더만 지정해준다면 알아서 Container.js 를 찾아서 호출한다.
