sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/Device",
  "sync/cc/mm/pr/suggestion/model/models"
], function (UIComponent, Device, models) {
  "use strict";

  return UIComponent.extend("sync.cc.mm.pr.suggestion.Component", {
    metadata: {
      manifest: "json"
    },

    init: function () {
      // 부모의 init 호출
      UIComponent.prototype.init.apply(this, arguments);

      // 모델 초기화
      this.setModel(models.createDeviceModel(), "device");

      // 라우터 초기화
      this.getRouter().initialize();
    }
  });
});