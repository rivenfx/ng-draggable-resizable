# 执行公用脚本
. ".\common.ps1"

# 获取当前tag
# $tags = (git tag)
# [Array]::Reverse($tags)
# $tag = $tags[0] -replace 'v',''

# 切换到根目录 并 还原npm依赖
Set-Location $rootFolder
& npm i

foreach($project in $projects) {

  # 切换到根目录
  Set-Location $rootFolder

  # 输出目录
  $outputFullPath =Join-Path $packOutputFolder $project

  # 打印信息
  Write-Host ('Project Name：'+ $project)
  Write-Host ('Project Outputpath：'+ $outputFullPath)

  # 编译
  & npm run $project

  # 复制less
  CopyLess -srcPath $rootFolder -packageName $project

  if ((Test-Path  $outputFullPath -ErrorAction SilentlyContinue)) {
    # 切换到输出目录
    Set-Location $outputFullPath

    # 发布
    & npm publish
  } else {
    Write-Host ('Project Outputpath NotFound!：'+ $outputFullPath)
  }
}


# 返回脚本启动目录
Set-Location $packFolder
