# デプロイスクリプト

はじめに以下のコマンドで実行権限を与える

```bash
chmod 755 ./utils.sh
```

## ファイル名変更

先に `yourname.env` を変更しておくこと

```bash
./utils.sh
```

## Lambda

### 全てのLambda関数 のデプロイ(新規または更新)

./lambda 以下の全ファイルがデプロイされる

```bash
./utils.sh lambda_deploy_all
```

### 特定のLambda関数 のデプロイ(新規または更新)

./lambda 以下の指定したファイルのみがデプロイされる

```bash
./utils.sh lambda_deploy <FILENAME>
// FILENAMEの部分は"suzuki-i-echo-get-internship.js"のような実際のファイル名に置き換えてください
```

## S3

### S3 バケットの作成

```bash
./utils.sh s3_deploy
```

### S3 へのデプロイ

```bash
./utils.sh s3_update
```

