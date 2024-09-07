#!/bin/bash

# タブ補完を有効にする
complete -C aws_completer aws
echo '# aws completer' >> ~/.bash_profile
echo complete -C \'$(which aws_completer)\' aws >> ~/.bash_profile
source ~/.bash_profile

# cliをシェルスクリプトから連続で叩いたときにlessでプロセスが停止しないようにする。
aws configure set cli_pager ''