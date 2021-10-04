# 路径
$packFolder = (Get-Item -Path "./" -Verbose).FullName   # 当前路径
$rootFolder = Join-Path $packFolder "../"               # 项目根目录
$packOutputFolder = Join-Path $rootFolder "dist"        # 输出 npm 包目录

# 所有的项目名称
$projects = (
    "ng-draggable-resizable"
)


# # 切换到源码根目录
# $rootPath = (Get-Location).Path

# # 获取 angular-cli 路径
# $ngPath = Join-Path (Get-Location).Path "node_modules/@angular/cli/bin"

# # 环境变量
# $pathSplit = ';'
# if([Environment]::OSVersion.Platform -eq [PlatformID]::Unix){
#   $pathSplit = ':'
# }
# $envPath = [Environment]::GetEnvironmentVariable("PATH")
# [Environment]::SetEnvironmentVariable( "PATH", $envPath + $pathSplit + $ngPath)

# # 返回脚本启动目录
# Set-Location $packFolder

# 判断文件或目录是否存在, 并打印消息, 存在返回true, 否则返回false
function TestExist($path, $notFoundMsg, $notFoundMsgFormat) {

    try {
        if ( (Test-Path  $path -ErrorAction SilentlyContinue ) ) {
            return $true
        }
    }
    catch {
        # 自定义异常信息
        if ( $notFoundMsg ) {
            if ( !$notFoundMsgFormat ) {
                Write-Host $notFoundMsg
            }
            else {
                Write-Host ($notFoundMsg -F $path)
            }

        }
        else {
            Write-Host ("未找到文件或目录 ！ 路径:   {0}" -F $path)
        }
    }
    return $false
}

function CopyLess {
    param (
        $srcPath,
        $packageName
    )
    $sourcePath = Join-Path $srcPath "projects" "$packageName" "src/styles"
    $targetPath = Join-Path $srcPath "dist" "$packageName" "styles"

    if ([System.IO.Directory]::Exists($sourcePath)) {
        Copy-Item -Path "$sourcePath" -Destination "$targetPath" -Recurse -Force -Filter '*.less'
    }
}
