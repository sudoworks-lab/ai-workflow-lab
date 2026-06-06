# AGENTS

- 回答、docs、運用メモは原則日本語で書く。
- 実データ、実ホスト名、実IP、実ドメイン、実AWSアカウントID、認証情報、ローカル絶対パスを入れない。
- 外部LLM APIを使わない。
- 生成物を不用意にgit管理しない。既存の追跡例外は維持しつつ、新しい追跡対象を増やす場合は理由を確認する。
- `public-check`、`scan`、`tests` の検出範囲や失敗条件を弱めない。
- `README.md` に SVG を直書きしない。SVG は `docs/images/` に置く。
- `commit`、`push`、repository の public 化はユーザー確認なしに行わない。
- 迷った場合は変更せず、候補と理由を報告する。
