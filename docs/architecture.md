# Architecture

このrepoは、AI-assisted workを制御されたoperations loopとしてモデル化します。全体は意図的に小さく、読み切れる規模にしていますが、SRE、Platform Engineering、AIOps、LLM Opsで重要になる関心事は残しています。

## System View

```text
operator intent
  -> task prompt
  -> executor
  -> artifacts
  -> run receipt
  -> validation
  -> review gate
  -> safety gate
  -> improvement backlog
```

executorは人間、coding assistant、local scriptのいずれでも構いません。このarchitectureは特定のmodel vendorに依存しません。

## Components

- `prompts/codex_task.md`: standard task request format。
- `prompts/review_gate.md`: output quality と evidence のためのhuman review checklist。
- `prompts/handoff.md`: 作業を安全に引き継ぐためのcontinuation template。
- `schemas/run_receipt.schema.json`: execution evidence の構造。
- `schemas/golden_case.schema.json`: evaluation case の構造。
- `schemas/review_result.schema.json`: review decision の構造。
- `schemas/eval_result.schema.json`: evaluation output の構造。
- `schemas/regression_result.schema.json`: baseline comparison output の構造。
- `schemas/quality_gate_result.schema.json`: publication gate output の構造。
- `schemas/risk_policy.schema.json`: local risk policy の構造。
- `schemas/workflow_config.schema.json`: project workflow configuration の構造。
- `config/risk_policy.json`: risky workflow signal のlocal scoring policy。
- `workflow.config.json`: enabled checks と path configuration。
- `baselines/eval_baseline.json`: regression checkで使う期待eval count。
- `examples/run_receipts/`: sample execution record。
- `examples/golden_cases/`: representative workflow cases。
- `examples/review_results/`: sample review record。
- `examples/eval_results/`: sample evaluation record。
- `examples/regression_results/`: sample regression record。
- `examples/quality_gate_results/`: sample quality gate record。
- `templates/`: prompt、case、receipt、review result の再利用可能なplaceholder。
- `src/validate_json.ts`: simplified local schema validation。
- `src/public_safety_scan.ts`: allowlist付きpublic-safety term scan。
- `src/workflow_summary.ts`: examples と receipts からworkflow summaryを生成。
- `src/eval_runner.ts`: positive / negative case のlocal evaluation runner。
- `src/regression_check.ts`: current eval output と baseline count の比較。
- `src/quality_gate.ts`: validation、scan、eval、regression、risk、review status の統合。
- `src/artifacts.ts`: `artifacts/latest/` へのlatest generated evidence書き込み。
- `src/risk_score.ts`: local risk scoring engine。
- `src/report_generator.ts`: Markdown report generator。
- `src/smoke_test.ts`: 高速なrepo health check。
- `src/cli.ts`: npm script commands の単一local CLI entrypoint。
- `tests/*.test.ts`: core check の node:test coverage。
- `scripts/*.sh`: `npm run` を呼ぶ薄いlauncher。

## Gate Relationship

review gate と safety gate は別の問いに答えます。

- Review gate: 作業はtaskを満たしたか。証跡は十分か。
- Safety gate: outputは公開またはhandoffして安全か。
- Validation: structured dataは期待shapeに合っているか。
- Evaluation: caseに十分なcheck、risk control、review pointがあるか。
- Regression: pass、needs-review、fail、blocked、high-risk count がbaselineより悪化していないか。
- Risk score: reviewまたはblockingが必要なsignalをcaseが含むか。
- Quality gate: 現在のrepo stateはpublic reviewへ進めるだけの状態か。
- Smoke test: fresh checkoutからlocal checkが動くか。

これらはすべて必要です。valid JSONでも運用品質が弱いことがあり、運用上は有用でも公開には安全でないことがあるためです。

## Data Model

MVPは8種類のJSON recordを使います。

- Golden case: representative task、input、expected output、checks、risks、review pointsを記述する。
- Run receipt: execution、changed artifacts、verification output、risks、follow-upを記録する。
- Review result: review status、evidence、issues、safety findings、missing verification、required changes、next actionを記録する。
- Eval result: case-level evaluation status、risk level、score、findingsを記録する。
- Regression result: baseline、current、delta、findingsを記録する。
- Quality gate result: combined check status、reasons、next actionを記録する。
- Risk policy: local risk categories、scoring weights、thresholdsを記録する。
- Workflow config: enabled checks と local paths を記録する。

schemaは意図的に小さなJSON Schema subsetにしています。TypeScriptだけでローカル検証できるようにするためです。

## Non-Goals

- production scheduler は含めない。
- model routing layer は含めない。
- external LLM API integration は含めない。
- real log ingestion は含めない。
- persistent database は含めない。
- automatic publishing は含めない。

## Platform Interpretation

このrepoでは、prompt、schema、example、TypeScript check、receiptをplatform primitiveとして扱います。同じpatternを使えば、AI-assisted engineering taskを毎回個人のやり方に任せず、team workflowとして標準化できます。

## Implementation Language

実装ロジックはTypeScriptに統一しています。shellは薄いlauncher entrypointに限定し、validation、public-safety scanning、workflow summary generation、smoke testingのsupported interfaceはnpm scriptsです。これは、tool bodyをshellに寄せないためのimplementation-language policyに従っています。
