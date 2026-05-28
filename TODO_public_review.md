# TODO Public Review

Review this file before publishing the repository. This is the human gate after local checks pass.

## Presentation Checks

- Confirm that `README.md` explains the repo as a TypeScript LLM Ops / AI workflow foundation within the first screen.
- Confirm that the Quick Start and command table are easy to follow.
- Confirm that SRE, Platform Engineering, AIOps, and LLM Ops connections are accurate and not overclaimed.
- Confirm that `docs/images/architecture-overview.svg` renders correctly in the README.
- Confirm that `docs/images/execution-flow.svg` renders correctly in the README.
- Confirm that `docs/walkthrough.md` supports 3-minute, 5-minute, 10-minute, and interview-prep review paths.

## Generated Evidence Checks

- Run `npm run cli -- run-all`.
- Confirm that `reports/latest.md` contains only generated evidence from synthetic samples.
- Confirm that `artifacts/latest/eval_result.json` is present and reviewable.
- Confirm that `artifacts/latest/regression_result.json` is present and reviewable.
- Confirm that `artifacts/latest/quality_gate_result.json` is present and reviewable.
- Confirm that `artifacts/latest/summary.md` is present and reviewable.
- Confirm that quality gate `needs_review` reasons are expected before publication.
- Confirm that `baselines/eval_baseline.json` represents an accepted evaluation baseline.

## Public Safety Checks

- Confirm that all examples are synthetic and public-safe.
- Confirm that no real organization, customer, project, or person is identifiable.
- Confirm that no email address, token, secret, password, credential, client_secret, private key, or local-only path is present.
- Run the dangerous-term scan and inspect every hit:

```bash
rg -n "token|secret|password|api_key|credential|client_secret|private|customer|顧客|社内|実名|email|mail" .
```

- Confirm that remaining risky hits are scanner definitions, risk policy definitions, checklist terms, or public-safety policy text only.
- Confirm that sample receipts do not imply production execution.
- Confirm that templates are reusable placeholders only and contain no real data.

## License And Release Checks

- Review `LICENSE_CANDIDATE.md`.
- Decide whether to convert `LICENSE_CANDIDATE.md` into a formal `LICENSE` file before public release.
- Do not treat the license candidate as the final license.
- Confirm that `.github/workflows/ci.yml` should be enabled as-is after publication.
- Confirm that CI runs `npm ci`, typecheck, build, validate, scan, summary, eval, regression, gate, report, test, and smoke.
- Confirm that no GitHub repository is created until the manual public review is complete.

## Known Weak Points

- CI is provided as a candidate workflow but has not been exercised in a remote repository.
- License is represented by `LICENSE_CANDIDATE.md`; a formal license file is not selected yet.
- The simplified validator is intentionally not a complete JSON Schema implementation.
- Shell entrypoints are compatibility launchers only; TypeScript npm scripts are the maintained interface.
- Risk scoring is heuristic and should not be treated as a complete safety classifier.
- Regression baseline counts are manually accepted and should be updated only after review.

## Public Decision Notes

- Keep SRE, Platform Engineering, AIOps, and LLM Ops as the framing.
- Keep social posting and article-generation use cases out of the main narrative.
- Prefer small, verifiable workflow examples over broad automation claims.
- Stop feature additions until README, diagrams, license choice, CI behavior, and public-safety review are complete.
