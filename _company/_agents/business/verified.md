# 💼 현빈 — 검증된 지식

_Self-RAG가 출력에서 `[근거: ...]` 태그가 붙은 주장만 자동 승격해서 누적._
_여기 들어온 내용만 다음 사이클의 retrieval 우선순위에 들어갑니다._
_사용자가 직접 줄을 지우면 그 주장은 다시 미검증 상태로 돌아갑니다._


- [2026-08-28] 2. Add `` or `[추측]` to each fact claim. _(근거: <출처 한 마디>)_
- [2026-09-02] Before generating an answer, please review the context (personal goals, company goals, memory, and brain knowledge) and select the relevant items. Next, add `` or `[추측]` to each fact claim. If there is no supporting evidence in the context, use `[추측]`. Finally, add a line at the end of the answer stating `자가검증: 사실 N개 / 추측 M개`. _(근거: <출처 한 마디>)_