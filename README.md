# action-json-file-to-env


## 如何使用
> [更多参数配置](./action.yml)

```yaml
jobs:
    build-deploy:
        runs-on: ubuntu-latest
        steps:
          - name: Load Env JSON
            id: prop
            uses: hocgin/action-json-file-to-env@main
            with:
              file: .github/workflows/env.json
            env:
              GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          - name: Use
            run: echo "$REMOTE_HOST"
            env:
              REMOTE_HOST: ${{ steps.prop.outputs.REMOTE_HOST }}
```
