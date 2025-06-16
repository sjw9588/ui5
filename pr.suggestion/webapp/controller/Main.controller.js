sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
  ],
  function (
    Controller,
    JSONModel,
    Filter,
    FilterOperator,
    MessageToast,
    Fragment
  ) {
    "use strict";

    return Controller.extend("sync.cc.mm.pr.suggestion.controller.Main", {
      onInit: function () {
        // 배너 이미지 경로를 담은 JSONModel 생성 및 "banner" 모델로 뷰에 설정
        const oBannerModel = new JSONModel({
          bannerImagePath:
            sap.ui.require.toUrl("sync/cc/mm/pr/suggestion") +
            "/image/innocoating_banner.png",
        });
        this.getView().setModel(oBannerModel, "banner");

        // 조회 조건을 위한 모델(view) 생성 및 초기화
        var oViewModel = new JSONModel({
          where: {
            matnrs: [], // 변경됨: 다중 자재코드
            werks: "", // 플랜트
            lgort: "", // 저장위치
          },
        });
        this.getView().setModel(oViewModel, "view");

        // 재주문 제안 목록 결과를 담을 모델(result) 생성
        var oResultModel = new JSONModel({ list: [] });
        this.getView().setModel(oResultModel, "result");

        // 초기 로딩 시 조건 기반으로 재주문 제안 목록 조회 실행
        this.onSearch();

        // PR 탭에서 상태별 필터링된 목록을 담을 모델(filteredPR) 생성
        const oFilteredPRModel = new JSONModel({ list: [] });
        this.getView().setModel(oFilteredPRModel, "filteredPR");

        // 구매요청 데이터 정렬된 상태로 조회하여 gw 모델로 설정
        const oGWModel = this.getOwnerComponent().getModel("ZCC_GW_0419_SRV");

        oGWModel.read("/ZCC_GW_0419Set", {
          success: function (oData) {
            // Banfn 내림차순 정렬
            const aSorted = oData.results.sort(function (a, b) {
              return b.Banfn.localeCompare(a.Banfn); // 문자열 비교 기준
            });

            // JSONModel에 담아 gw로 설정
            const oSortedModel = new JSONModel({ ZCC_GW_0419Set: aSorted });
            this.getView().setModel(oSortedModel, "gw");

            // 상태별 건수 계산 및 모델에 세팅
            const oCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            aSorted.forEach((item) => {
              if (oCounts[item.Prstat] !== undefined) {
                oCounts[item.Prstat]++;
              }
            });
            this.getView().getModel("view").setProperty("/counts", oCounts);

            // 이 시점이면 뷰가 렌더링됐다고 보아도 무방
            const oTabBar = this.byId("prTabBar");
            if (oTabBar) {
              oTabBar.setSelectedKey("1");
              this.onPRTabSelect({ getParameter: () => "1" });
            }
          }.bind(this),
          error: function () {
            MessageToast.show("구매요청 목록을 불러오지 못했습니다.");
          },
        });
      },

      onSearch: function () {
        // 사용자 입력값(조회 조건) 모델에서 where 경로의 데이터를 가져옴
        const oWhere = this.getView().getModel("view").getProperty("/where");
        const aFilters = []; // OData 필터 배열 초기화

        // 자재번호(matnr)가 여러 개 선택된 경우, OR 조건으로 필터 구성
        if (oWhere.matnrs && oWhere.matnrs.length > 0) {
          const aMatnrFilters = oWhere.matnrs.map(function (oToken) {
            return new Filter("matnr", FilterOperator.EQ, oToken.key); // key = 자재번호
          });
          aFilters.push(new Filter(aMatnrFilters, false)); // false = OR 조건으로 묶음
        }

        // 플랜트(werks)가 입력된 경우, 해당 값으로 필터 추가 (EQ: 같음)
        if (oWhere.werks) {
          aFilters.push(new Filter("werks", FilterOperator.EQ, oWhere.werks));
        }
        // 저장위치(lgort)가 입력된 경우, 해당 값으로 필터 추가
        if (oWhere.lgort) {
          aFilters.push(new Filter("lgort", FilterOperator.EQ, oWhere.lgort));
        }
        // 위에서 구성한 필터들을 기반으로 CDS 데이터를 조회
        this._loadData(aFilters);
      },

      _loadData: function (aFilters = []) {
        // OData 모델 인스턴스 가져오기 (기본 서비스 모델)
        const oModel = this.getOwnerComponent().getModel();

        // 결과 바인딩용 JSONModel 가져오기
        const oResultModel = this.getView().getModel("result");

        // CDS 뷰에서 재고 및 구매 관련 데이터 읽기
        oModel.read("/ZCC_CDS_V_041", {
          filters: aFilters, // 조회 조건 적용
          success: function (oData) {
            // 결과 데이터를 가공하여 가용성 및 제안 수량 계산
            const aProcessed = oData.results.map(function (row) {
              // 개별 필드 parsing 및 기본값 처리
              const avstk = parseFloat(row.avstk) || 0; // 가용 재고량
              const pr = parseFloat(row.pr_open_qty) || 0; // PR 미결 수량
              const po = parseFloat(row.po_open_qty) || 0; // PO 미결 수량
              const eisbe = parseFloat(row.eisbe) || 0; // 안전재고

              // 목표 수량 계산 (EISBE(안전재고) 기준 2배)
              const targetQty = parseFloat((eisbe * 2).toFixed(3));
              // 현재까지 가용 가능한 총 수량 (재고 + PR + PO)
              const totalAvail = parseFloat((avstk + pr + po).toFixed(3));
              // 제안 수량 = 목표 - 현재 총가용 (0보다 작으면 0 처리)
              const proposalQty = Math.max(targetQty - totalAvail, 0);
              // 가용 비율 및 재고 비율 계산 (소수점 제거, 백분율)
              const availRatio =
                targetQty > 0 ? Math.round((totalAvail / targetQty) * 100) : 0;
              const stockRatio =
                targetQty > 0 ? Math.round((avstk / targetQty) * 100) : 0;

              // 원본 row + 가공된 데이터 반환
              return {
                ...row,
                target_qty: targetQty,
                total_avail: totalAvail,
                proposal_qty: proposalQty.toFixed(3), // 소수점 3자리 고정 문자열
                availRatio: availRatio,
                stockRatio: stockRatio,
              };
            });
            // 가공된 데이터를 result 모델에 세팅
            oResultModel.setProperty("/list", aProcessed);
          },
          error: function () {
            // 조회 실패 시 메시지 출력
            MessageToast.show("데이터 조회 중 오류가 발생했습니다.");
          },
        });
      },

      _getUniqueList: function (aData, aFilters, sKeyField, sDescField) {
        const oMap = new Map();

        aData.forEach((row) => {
          const isMatch = aFilters.every(
            (f) => !f.value || row[f.path] === f.value
          );
          if (!isMatch) return;

          const key =
            row[sKeyField] + "|" + (sDescField ? row[sDescField] : "");
          if (!oMap.has(key)) oMap.set(key, row);
        });

        return Array.from(oMap.values());
      },

      onValueHelpWerks: function () {
        const oModel = this.getOwnerComponent().getModel();
        const oViewModel = this.getView().getModel("view");

        oModel.read("/ZCC_CDS_V_041", {
          success: function (oData) {
            const aFiltered = this._getUniqueList(
              oData.results,
              [],
              "werks",
              "werks_text"
            );

            const oDialog = new sap.m.SelectDialog({
              title: "플랜트 선택",
              items: {
                path: "/list",
                template: new sap.m.StandardListItem({
                  title: "{werks}",
                  description: "{werks_text}",
                }),
              },
              search: function (oEvent) {
                const sQuery = oEvent.getParameter("value");
                const oFilter = new Filter(
                  "werks",
                  FilterOperator.Contains,
                  sQuery
                );
                oEvent.getSource().getBinding("items").filter([oFilter]);
              },
              confirm: function (oEvent) {
                const sWerks = oEvent.getParameter("selectedItem").getTitle();
                oViewModel.setProperty("/where/werks", sWerks);
              },
            });

            oDialog.setModel(new JSONModel({ list: aFiltered }));
            oDialog.open();
          }.bind(this),
        });
      },

      onValueHelpLgort: function () {
        const oModel = this.getOwnerComponent().getModel();
        const oViewModel = this.getView().getModel("view");
        const sWerks = oViewModel.getProperty("/where/werks");

        oModel.read("/ZCC_CDS_V_041", {
          success: function (oData) {
            const aFiltered = this._getUniqueList(
              oData.results,
              [{ path: "werks", value: sWerks }],
              "lgort",
              "lgobe"
            );

            const oDialog = new sap.m.SelectDialog({
              title: "저장위치 선택",
              items: {
                path: "/list",
                template: new sap.m.StandardListItem({
                  title: "{lgort}",
                  description: "{lgobe}",
                }),
              },
              search: function (oEvent) {
                const sQuery = oEvent.getParameter("value");
                const oFilter = new Filter(
                  "lgort",
                  FilterOperator.Contains,
                  sQuery
                );
                oEvent.getSource().getBinding("items").filter([oFilter]);
              },
              confirm: function (oEvent) {
                const sLgort = oEvent.getParameter("selectedItem").getTitle();
                oViewModel.setProperty("/where/lgort", sLgort);
              },
            });

            oDialog.setModel(new JSONModel({ list: aFiltered }));
            oDialog.open();
          }.bind(this),
        });
      },

      onValueHelpMatnr: function () {
        // OData 모델과 조회조건 모델(viewModel) 가져오기
        const oModel = this.getOwnerComponent().getModel();
        const oViewModel = this.getView().getModel("view");

        // 현재 조회조건에서 플랜트와 저장위치를 읽어옴 (자재 필터링에 사용)
        const sWerks = oViewModel.getProperty("/where/werks");
        const sLgort = oViewModel.getProperty("/where/lgort");

        // CDS View에서 자재 데이터 읽기
        oModel.read("/ZCC_CDS_V_041", {
          success: function (oData) {
            // 자재코드(matnr) + 자재명(maktx) 중복 제거 후 목록 반환
            const aFiltered = this._getUniqueList(
              oData.results,
              [
                { path: "werks", value: sWerks },
                { path: "lgort", value: sLgort },
              ],
              "matnr",
              "maktx"
            );

            // SelectDialog 팝업 생성 (자재 다중 선택 가능)
            const oDialog = new sap.m.SelectDialog({
              title: "자재 선택",
              multiSelect: true,
              rememberSelections: true,
              items: {
                path: "/list",
                template: new sap.m.StandardListItem({
                  title: "{matnr}",
                  description: "{maktx}",
                }),
              },

              // 검색 처리: 자재코드 또는 자재명에 검색어가 포함된 항목 필터링
              search: function (oEvent) {
                const sQuery = oEvent.getParameter("value");
                const oFilter = new Filter({
                  filters: [
                    new Filter("matnr", FilterOperator.Contains, sQuery),
                    new Filter("maktx", FilterOperator.Contains, sQuery),
                  ],
                  and: false,
                });
                oEvent.getSource().getBinding("items").filter([oFilter]);
              },
              // 선택 확정 시: 선택된 자재들을 Token 형태로 모델(view)과 MultiInput에 반영
              confirm: function (oEvent) {
                const aSelectedItems =
                  oEvent.getParameter("selectedItems") || [];

                // 자재코드, 자재명을 조합하여 Token 배열 구성
                const aTokens = aSelectedItems.map(function (oItem) {
                  return {
                    key: oItem.getTitle(),
                    text: oItem.getTitle() + " - " + oItem.getDescription(),
                  };
                });
                // 조회조건 모델(view)의 matnrs 경로에 세팅
                oViewModel.setProperty("/where/matnrs", aTokens);
                // 화면의 MultiInput 컨트롤에 Token 바인딩
                const oMultiInput = this.byId("multiInputMatnr");
                oMultiInput.removeAllTokens(); // 기존 Token 제거
                aTokens.forEach(function (oToken) {
                  oMultiInput.addToken(
                    new sap.m.Token({
                      key: oToken.key,
                      text: oToken.text,
                    })
                  );
                });
              }.bind(this), // 내부에서 this 접근 가능하도록 바인딩
            });

            // Dialog에 모델 바인딩 후 열기
            oDialog.setModel(new JSONModel({ list: aFiltered }));
            oDialog.open();
          }.bind(this),
        });
      },

      onMatnrSubmit: function (oEvent) {
        // 사용자 입력값(자재코드) 가져오기
        const sValue = oEvent.getParameter("value").trim();
        if (!sValue) return; // 공백 입력 시 무시

        // 입력한 MultiInput 객체 및 ViewModel 참조
        const oMultiInput = oEvent.getSource();
        const oViewModel = this.getView().getModel("view");

        // 현재 선택된 플랜트/저장위치 값 추출
        const sWerks = oViewModel.getProperty("/where/werks");
        const sLgort = oViewModel.getProperty("/where/lgort");

        // OData 모델 인스턴스 가져오기
        const oModel = this.getOwnerComponent().getModel();

        // CDS에서 자재 목록 전체 읽기
        oModel.read("/ZCC_CDS_V_041", {
          success: function (oData) {
            // 플랜트 및 저장위치 조건에 맞는 자재만 필터링
            const aMaterialList = oData.results.filter(
              (row) =>
                (!sWerks || row.werks === sWerks) &&
                (!sLgort || row.lgort === sLgort)
            );

            // 입력값과 일치하는 자재 찾기
            const oMatch = aMaterialList.find((row) => row.matnr === sValue);
            if (!oMatch) {
              // 존재하지 않으면 메시지 표시 후 입력 초기화
              sap.m.MessageToast.show(
                "목록에 존재하지 않는 자재코드입니다: " + sValue
              );
              oMultiInput.setValue(""); // 입력 초기화
              return;
            }

            // 중복 자재코드 여부 확인
            let aTokens = oViewModel.getProperty("/where/matnrs") || [];
            const bExists = aTokens.some((t) => t.key === sValue);
            if (bExists) {
              sap.m.MessageToast.show("이미 추가된 자재코드입니다: " + sValue);
              oMultiInput.setValue("");
              return;
            }

            // 신규 Token 생성 및 MultiInput에 추가
            const oToken = new sap.m.Token({
              key: sValue,
              text: sValue + " - " + oMatch.maktx, // 자재명 함께 표시
            });

            oMultiInput.addToken(oToken);
            // Token 정보를 view 모델에도 추가
            aTokens.push({
              key: sValue,
              text: oToken.getText(),
            });

            oViewModel.setProperty("/where/matnrs", aTokens);
            // 입력 필드 초기화
            oMultiInput.setValue("");
          },
          error: function () {
            sap.m.MessageToast.show("자재 데이터를 확인할 수 없습니다.");
          },
        });
      },

      onMatnrTokenUpdate: function (oEvent) {
        // 토큰 업데이트는 DOM(TML 또는 XML 문서를 브라우저가 메모리에 구조화한 객체 모델)
        // 변경 후 발생하므로 비동기적으로 처리
        setTimeout(() => {
          // 조회 조건 모델(viewModel) 가져오기
          const oViewModel = this.getView().getModel("view");

          // MultiInput 컨트롤에 현재 존재하는 모든 Token 객체 가져오기
          const aTokens = this.byId("multiInputMatnr").getTokens();

          // Token 객체 배열을 모델에 저장할 수 있는 형식으로 변환
          const aMatnrs = aTokens.map(function (oToken) {
            return {
              // key 또는 fallback으로 text 사용
              key: oToken.getKey() || oToken.getText(),
              text: oToken.getText(), // Token 표시 텍스트
            };
          });

          // 변환된 Token 배열을 모델의 /where/matnrs 경로에 세팅
          oViewModel.setProperty("/where/matnrs", aMatnrs);
        }, 0); // setTimeout(0): UI 렌더링 이후 실행 보장
      },

      onItemPress: function (oEvent) {
        // 리스트에서 클릭된 항목의 result 모델 데이터 객체 가져오기
        const oData = oEvent
          .getParameter("listItem")
          .getBindingContext("result")
          .getObject();
        // 오늘 날짜 기준 생성
        const oToday = new Date();
        oToday.setHours(0, 0, 0, 0); // 시분초 초기화

        // 기본 날짜: 오늘 + 20일
        const oDefaultDate = new Date(oToday);
        oDefaultDate.setDate(oDefaultDate.getDate() + 20);

        // 최소 날짜: 오늘 + 14일
        const oMinDate = new Date(oToday);
        oMinDate.setDate(oMinDate.getDate() + 14);

        // 날짜를 YYYY-MM-DD 형식 문자열로 변환하는 함수
        function formatDateToYyyyMmDd(oDate) {
          return oDate.toISOString().split("T")[0];
        }
        // 구매요청 Dialog에 전달할 모델 구성
        const oDialogModel = new JSONModel({
          ...oData, // 선택한 행의 기본 데이터
          badat: formatDateToYyyyMmDd(oDefaultDate), // 기본 납기일 (문자열)
          minDate: oMinDate, // 최소 납기일 (Date 객체)
        });

        // 구매요청 생성용 Dialog가 아직 생성되지 않은 경우
        if (!this._oPRDialog) {
          Fragment.load({
            name: "sync.cc.mm.pr.suggestion.view.fragment.CreatePRDialog", // 프래그먼트 경로
            id: this.getView().getId(),
            controller: this,
          }).then(
            function (oDialog) {
              this._oPRDialog = oDialog; // Dialog 객체 저장
              this.getView().addDependent(oDialog); // View에 종속 추가
              oDialog.setModel(oDialogModel, "dialogModel"); // 모델 바인딩
              oDialog.open(); // Dialog 열기
            }.bind(this)
          );
        } else {
          // 이미 Dialog가 존재하면 기존 모델을 제거 후 새 모델 바인딩
          this._oPRDialog.setModel(null, "dialogModel");
          this._oPRDialog.setModel(oDialogModel, "dialogModel");
          this._oPRDialog.open();
        }
      },
      onSavePR: function () {
        // 구매요청 Dialog 객체 및 Dialog 모델의 데이터 획득
        const oDialog = this._oPRDialog;
        const oData = oDialog.getModel("dialogModel").getData();
        // Gateway OData 모델 (구매요청 생성용)
        const oGWModel = this.getOwnerComponent().getModel("ZCC_GW_0419_SRV"); //  수정됨

        // 제안 수량을 숫자로 변환하여 유효성 검사
        const fQty = parseFloat(oData.proposal_qty);
        if (isNaN(fQty) || fQty <= 0) {
          MessageToast.show("유효한 수량을 입력하세요 (0보다 큰 숫자)");
          return;
        }

        // 납기일 유효성 체크 (오늘 기준 14일 이후)
        const oBadat = new Date(oData.badat); // 입력된 납기일
        const oMinDate = new Date(); // 기준 날짜
        oMinDate.setHours(0, 0, 0, 0);
        oMinDate.setDate(oMinDate.getDate() + 14);

        if (oBadat < oMinDate) {
          MessageToast.show(
            "납기요청일은 오늘로부터 최소 14일 이후여야 합니다."
          );
          return;
        }
        // OData에 전달할 구매요청 Payload 구성
        const oEntry = {
          Matnr: oData.matnr, // 자재코드
          Werks: oData.werks, // 플랜트
          Lgort: oData.lgort, // 저장위치
          Menge: String(parseFloat(oData.proposal_qty).toFixed(3)), // 수량 (문자열 변환)
          Meins: oData.meins, // 단위
          Badat: oData.badat, // 납기요청일
        };

        // Gateway 서비스에 구매요청 생성 요청
        oGWModel.create("/ZCC_GW_0419Set", oEntry, {
          success: function () {
            // 성공 시 사용자 알림 및 Dialog 닫기
            MessageToast.show("구매요청이 생성되었습니다.");
            oDialog.close();
            // GW 모델 갱신 (리스트 최신화 목적)
            oGWModel.refresh(true);
          },
          error: function () {
            MessageToast.show("구매요청 생성 실패");
          },
        });
      },

      onClosePRDialog: function () {
        if (this._oPRDialog) {
          this._oPRDialog.close();
        }
      },

      onPRTabSelect: function (oEvent) {
        // 선택된 탭의 key 값(예: 1, 2, ..)을 가져와서 PR 상태코드로 사용
        const sKey = oEvent.getParameter("key");
        // 전체 PR 목록(gw 모델에 저장된 구매요청 데이터) 가져오기
        const aAllItems =
          this.getView().getModel("gw").getProperty("/ZCC_GW_0419Set") || [];

        // 상태코드(Prstat)가 탭의 key와 일치하는 PR만 필터링
        const aFiltered = aAllItems.filter((item) => item.Prstat === sKey);

        // 요청번호를 기준으로 내림차순 정렬
        aFiltered.sort((a, b) => b.Banfn.localeCompare(a.Banfn));
        // 필터링된 PR 목록을 filteredPR 모델에 저장 → View에서 바인딩됨
        this.getView().getModel("filteredPR").setProperty("/list", aFiltered);
      },

      onDeleteSelectedPR: async function () {
        const oTable = this.byId("prTable");
        const aSelectedItems = oTable.getSelectedItems();
        const oGWModel = this.getOwnerComponent().getModel("ZCC_GW_0419_SRV");

        if (aSelectedItems.length === 0) {
          sap.m.MessageToast.show("삭제할 항목을 선택하세요.");
          return;
        }

        // 사용자 확인
        const bConfirm = await new Promise((resolve) => {
          sap.m.MessageBox.confirm(
            `${aSelectedItems.length}건의 구매요청을 삭제하시겠습니까?`,
            {
              title: "확인",
              actions: [
                sap.m.MessageBox.Action.YES,
                sap.m.MessageBox.Action.NO,
              ],
              onClose: function (sAction) {
                resolve(sAction === sap.m.MessageBox.Action.YES);
              },
            }
          );
        });

        if (!bConfirm) return;

        let iSuccess = 0;
        let iFail = 0;

        for (const oItem of aSelectedItems) {
          const oContext = oItem.getBindingContext("filteredPR");
          const oData = oContext.getObject();
          const sPath = `/ZCC_GW_0419Set(Banfn='${oData.Banfn}',Bnfpo='${oData.Bnfpo}')`;

          try {
            await new Promise((resolve, reject) => {
              oGWModel.remove(sPath, {
                success: resolve,
                error: reject,
              });
            });
            iSuccess++;
          } catch (e) {
            iFail++;
          }
        }

        // 삭제 결과 메시지
        sap.m.MessageToast.show(`삭제 완료: ${iSuccess}건 / 실패: ${iFail}건`);

        // 모델 갱신
        oGWModel.refresh(true);
      },

      onPRRowPress: function (oEvent) {
        const oSelectedData = oEvent
          .getParameter("listItem")
          .getBindingContext("filteredPR")
          .getObject();

        const oDialogModel = new sap.ui.model.json.JSONModel(oSelectedData);

        if (!this._oPRDetailDialog) {
          Fragment.load({
            name: "sync.cc.mm.pr.suggestion.view.fragment.PRDetailDialog", // 경로 맞게 수정
            id: this.getView().getId(),
            controller: this,
          }).then(
            function (oDialog) {
              this._oPRDetailDialog = oDialog;
              this.getView().addDependent(oDialog);
              oDialog.setModel(oDialogModel, "prDetailModel");
              oDialog.open();
            }.bind(this)
          );
        } else {
          this._oPRDetailDialog.setModel(oDialogModel, "prDetailModel");
          this._oPRDetailDialog.open();
        }
      },

      onClosePRDetail: function () {
        if (this._oPRDetailDialog) {
          this._oPRDetailDialog.close();
        }
      },
    });
  }
);
