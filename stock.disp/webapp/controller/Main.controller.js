sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter", // OData 필터 객체 생성 클래스
    "sap/ui/model/FilterOperator", // 필터 연산자 정의용 상수 집합
    "sap/viz/ui5/format/ChartFormatter", // VizFrame 숫자 포맷터
    "sap/viz/ui5/api/env/Format", // VizFrame 환경 포맷 설정 객체
  ],
  function (Controller, Filter, FilterOperator, ChartFormatter, Format) {
    "use strict";

    return Controller.extend("sync.cc.mm.stock.disp.controller.Main", {
      // 초기화: ViewModel 및 차트 기본 설정 수행
      onInit: function () {


        // 배너 이미지 모델 등록
const oBannerModel = new sap.ui.model.json.JSONModel({
  bannerImagePath: sap.ui.require.toUrl("sync/cc/mm/stock/disp") + "/image/innocoating_banner.png"
});
this.getView().setModel(oBannerModel, "banner");
        
        // ViewModel 생성: 화면에서 사용할 조회조건 저장용 JSON 모델 생성
        const oViewModel = new sap.ui.model.json.JSONModel({
          where: {
            // 조회 조건용 ViewModel 초기화 (/where 이하 바인딩용)
            mtart: "",
            matnr: "",
            werks: "",
            lgort: "",
          },
        });
        // ViewModel을 "view"라는 이름으로 View에 연결 (XML에서 {view>/where/...}으로 바인딩)
        this.getView().setModel(oViewModel, "view");

        //VizFrame 차트 인스턴스 가져오기
        this._oVizFrame = this.byId("idVizFrame");
        //차트에 사용할 숫자 포맷터 초기화 (예: 1.25 → 1.25, 1,000 → 1K 등)
        Format.numericFormatter(ChartFormatter.getInstance());
        //기본 포맷 패턴 불러오기 (숫자 표현 스타일 설정용)
        const formatPattern = ChartFormatter.DefaultPattern;

        // 차트 시각화 속성 설정
        this._oVizFrame.setVizProperties({
          plotArea: {
            dataLabel: {
              visible: true, // 데이터 라벨 표시 여부
              showTotal: true, // 누적합 표시 (스택형 차트일 경우)
              formatString: formatPattern.SHORTFLOAT_MFD2, // 소수점 2자리까지 표시
            },
          },
          valueAxis: {
            label: { formatString: formatPattern.SHORTFLOAT }, // 값 축 레이블 포맷
            title: { visible: true }, // 값 축 타이틀 표시
          },
          categoryAxis: {
            title: { visible: true }, // 범주 축 타이틀 표시
          },
          title: {
            visible: true,
            text: "저장위치별 자재 재고 현황", // 차트 상단 제목 텍스트
          },
        });

        //  차트의 PopOver(툴팁) 활성화 연결
        this.byId("idPopOver").connect(this._oVizFrame.getVizUid());
      },

      // 조회 버튼 클릭 시 필터링 처리 메소드
      onSearch: function () {
        // 입력값 가져오기 (공백 제거)
        const sMatnr = this.byId("matnrInput").getValue().trim();
        const sWerks = this.byId("werksInput").getValue().trim();
        const sLgort = this.byId("lgortInput").getValue().trim();
        //제품유형 선택값 가져오기 (SelectBox에서 key 값)
        const sMtart = this.byId("mtartSelect").getSelectedKey();

        //OData 필터 조건을 담을 배열 선언
        const aFilters = [];

        // 조건에 따라 필터 객체를 생성해서 배열에 추가
        if (sMtart)
          aFilters.push(new Filter("mtart", FilterOperator.EQ, sMtart));
        if (sMatnr)
          aFilters.push(new Filter("matnr", FilterOperator.EQ, sMatnr));
        if (sWerks)
          aFilters.push(new Filter("werks", FilterOperator.EQ, sWerks));
        if (sLgort)
          aFilters.push(new Filter("lgort", FilterOperator.EQ, sLgort));

        // VizFrame 차트에 필터 적용
        const oDataset = this._oVizFrame.getDataset(); // 차트 데이터셋 객체
        const oBinding = oDataset.getBinding("data"); // 바인딩된 ODataSet (엔터티셋)
        oBinding.filter(aFilters); // 설정된 필터를 바인딩에 적용 → 차트 갱신

        // 테이블에도 동일한 필터 적용
        const oTable = this.byId("table"); // 테이블 객체 가져오기
        const oTableBinding = oTable.getBinding("rows"); // 테이블의 rows 바인딩 정보
        if (oTableBinding) {
          oTableBinding.filter(aFilters); // 바인딩이 이미 되어 있으면 즉시 필터 적용
        } else {
          // 바인딩이 아직 준비되지 않았을 경우, 데이터 로딩 완료 시점에 필터 재적용
          oTable.attachEventOnce("updateFinished", () => {
            const oRetryBinding = oTable.getBinding("rows");
            if (oRetryBinding) oRetryBinding.filter(aFilters); // 재시도 시점에 필터 적용
          });
        }
      },

      // 공통 유틸 함수: 중복 제거 + 필터 조건으로 필터링된 리스트 반환
      getFilteredUniqueList: function (aData, aFilters, sKeyField, sDescField) {
        const oMap = new Map(); // 중복 제거용 Map (key: 고유 문자열, value: row)
        aData.forEach((row) => {
          //전달받은 필터 조건을 모두 만족하는지 확인
          const isMatch = aFilters.every((f) => {   //every()는 모든 조건을 만족하는지 확인
            const val = row[f.path]?.trim(); // row 안에서 조건 대상 필드 값을 가져옴
            return !f.value || val === f.value; // 조건이 있으면 매치되는지 확인
          });
          // row["mtart"] === "FERT" 이고, row["werks"] === "P1000" 이면 isMatch는 true

          if (!isMatch) return; // 조건 만족하지 않으면 skip

          // 중복 제거 키 생성: keyField + descField 조합 문자열
          const key =
            row[sKeyField] + "|" + (sDescField ? row[sDescField] : "");
          // 동일 키가 없으면 Map에 추가
          //예: sKeyField = "matnr", sDescField = "maktx" 라면,
          //"FERT001|실내용 페인트" 같은 고유 문자열 생성
          if (!oMap.has(key)) oMap.set(key, row); 
        });

        return Array.from(oMap.values()); // Map에 저장된 고유 row만 배열로 반환
        //Map은 { key1 → row1, key2 → row2, ... } 형태
      },

      // 제품유형 변경 시 실행: 하위 조건 초기화 처리
      //Main.view.xml의 <Select> 태그에서 change="onMtartChange"로 연결되어 있어야 실행
      onMtartChange: function () {
        const oViewModel = this.getView().getModel("view"); // ViewModel 가져오기

        // matnr, werks, lgort 조건 초기화 (모델 기준)
        oViewModel.setProperty("/where/matnr", "");
        oViewModel.setProperty("/where/werks", "");
        oViewModel.setProperty("/where/lgort", "");

        // 화면 Input 필드 값 초기화 (UI 기준)
        this.byId("matnrInput").setValue("");
        this.byId("werksInput").setValue("");
        this.byId("lgortInput").setValue("");
      },

      // 자재 SearchHelp 오픈 및 필터링
      onValueHelpMatnr: function () {
        const oModel = this.getView().getModel(); // OData 모델 ("/ZCC_CDS_V_043") 가져오기
        const oDialog = this.byId("idMatnrSelectDialog"); // 자재 선택용 SelectDialog 참조
        const sMtart = this.getView()                     // 현재 제품유형(MTART) 값 읽기
          .getModel("view")
          ?.getProperty("/where/mtart")
          ?.trim();

        oModel.read("/ZCC_CDS_V_043", {
          success: function (oData) {
            const aFiltered = this.getFilteredUniqueList(
              oData.results,                              // 전체 조회 결과 배열
              [{ path: "mtart", value: sMtart }],         // 필터 조건: mtart 일치
              "matnr",  // 고유값 필드: 자재번호
              "maktx"   // 보조 텍스트: 자재명
            );
            // 결과를 JSONModel로 SelectDialog에 바인딩
            oDialog.setModel(
              new sap.ui.model.json.JSONModel({ list: aFiltered })
            );

            // 다이얼로그 항목 템플릿 바인딩: 자재번호(Title) + 자재명(Description)
            oDialog.bindAggregation("items", {
              path: "/list",
              template: new sap.m.StandardListItem({
                title: "{matnr}",
                description: "{maktx}",
              }),
            });
            // 다이얼로그 열기
            oDialog.open();
          }.bind(this), // success 내부에서도 this 사용 가능하게 바인딩
        });
      },

      // 자재 SearchHelp 내 검색 필터 처리
      onSearchMatnrDialog: function (oEvent) {
        const sQuery = oEvent.getParameter("value");    // 사용자가 입력한 검색어 가져오기

         // 자재코드(matnr) 또는 자재명(maktx)에 검색어가 포함된 경우 필터링
        const oFilter = new sap.ui.model.Filter({
          filters: [
            new sap.ui.model.Filter("matnr", FilterOperator.Contains, sQuery),
            new sap.ui.model.Filter("maktx", FilterOperator.Contains, sQuery),
          ],
          and: false,   // OR 조건 (둘 중 하나만 일치해도 포함됨)
        });
         // SelectDialog에 필터 적용
        oEvent.getSource().getBinding("items").filter([oFilter]);
      },
      // 자재 선택 시 필드에 값 반영
      onSelectMatnr: function (oEvent) {
        const oSelectedItem = oEvent.getParameter("selectedItem"); // 사용자가 선택한 항목
        if (oSelectedItem) {
          const sMatnr = oSelectedItem.getTitle();   // 선택된 자재코드 추출 (title에 바인딩됨)
          // 자재코드 Input 필드에 값 반영
          this.byId("matnrInput").setValue(sMatnr);
          // ViewModel의 where 영역에도 동일하게 값 저장
          this.getView().getModel("view")?.setProperty("/where/matnr", sMatnr);
        }
      },

      // 플랜트코드 SearchHelp
      onValueHelpWerks: function () {
        const oModel = this.getView().getModel();
        const oDialog = this.byId("idWerksSelectDialog");
        const oViewModel = this.getView().getModel("view");
        const sMtart = oViewModel?.getProperty("/where/mtart")?.trim();
        const sMatnr = oViewModel?.getProperty("/where/matnr")?.trim();

        oModel.read("/ZCC_CDS_V_043", {
          success: function (oData) {
            const aFiltered = this.getFilteredUniqueList(
              oData.results,
              [
                { path: "mtart", value: sMtart },
                { path: "matnr", value: sMatnr },
              ],
              "werks",
              "werks_text"
            );

            oDialog.setModel(
              new sap.ui.model.json.JSONModel({ list: aFiltered })
            );
            oDialog.bindAggregation("items", {
              path: "/list",
              template: new sap.m.StandardListItem({
                title: "{werks}",
                description: "{werks_text}",
              }),
            });
            oDialog.open();
          }.bind(this),
        });
      },

      onSearchWerksDialog: function (oEvent) {
        const sQuery = oEvent.getParameter("value");
        const oFilter = new sap.ui.model.Filter(
          "werks",
          FilterOperator.Contains,
          sQuery
        );
        oEvent.getSource().getBinding("items").filter([oFilter]);
      },

      onSelectWerks: function (oEvent) {
        const oSelectedItem = oEvent.getParameter("selectedItem");
        if (oSelectedItem) {
          const sWerks = oSelectedItem.getTitle();
          this.byId("werksInput").setValue(sWerks);
          this.getView().getModel("view")?.setProperty("/where/werks", sWerks);
        }
      },

      // 저장위치 SearchHelp
      onValueHelpLgort: function () {
        const oModel = this.getView().getModel();
        const oDialog = this.byId("idLgortSelectDialog");
        const oViewModel = this.getView().getModel("view");
        const sMtart = oViewModel?.getProperty("/where/mtart")?.trim();
        const sMatnr = oViewModel?.getProperty("/where/matnr")?.trim();
        const sWerks = oViewModel?.getProperty("/where/werks")?.trim();

        oModel.read("/ZCC_CDS_V_043", {
          success: function (oData) {
            const aFiltered = this.getFilteredUniqueList(
              oData.results,
              [
                { path: "mtart", value: sMtart },
                { path: "matnr", value: sMatnr },
                { path: "werks", value: sWerks },
              ],
              "lgort",
              "lgobe"
            );

            oDialog.setModel(
              new sap.ui.model.json.JSONModel({ list: aFiltered })
            );
            oDialog.bindAggregation("items", {
              path: "/list",
              template: new sap.m.StandardListItem({
                title: "{lgort}",
                description: "{lgobe}",
              }),
            });
            oDialog.open();
          }.bind(this),
        });
      },

      onSearchLgortDialog: function (oEvent) {
        const sQuery = oEvent.getParameter("value");
        const oFilter = new sap.ui.model.Filter({
          filters: [
            new sap.ui.model.Filter("lgort", FilterOperator.Contains, sQuery),
            new sap.ui.model.Filter("lgobe", FilterOperator.Contains, sQuery),
          ],
          and: false,
        });
        oEvent.getSource().getBinding("items").filter([oFilter]);
      },

      onSelectLgort: function (oEvent) {
        const oSelectedItem = oEvent.getParameter("selectedItem");
        if (oSelectedItem) {
          const sLgort = oSelectedItem.getTitle();
          this.byId("lgortInput").setValue(sLgort);
          this.getView().getModel("view")?.setProperty("/where/lgort", sLgort);
        }
      },
    });
  }
);
