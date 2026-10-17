$ErrorActionPreference = 'Stop'
$taskBuild = $PSScriptRoot
$taskDeck = Join-Path $taskBuild 'candidate.pptx'
$taskPresentation = $null
try {
    $taskPowerPoint = New-Object -ComObject PowerPoint.Application
    $taskPresentation = $taskPowerPoint.Presentations.Open($taskDeck, -1, 0, 0)
    foreach ($taskNumber in @(7,14,16,17,22,24,28,32)) {
        $taskImage = Join-Path $taskBuild ('powerpoint-' + $taskNumber + '.png')
        $taskPresentation.Slides.Item($taskNumber).Export($taskImage, 'PNG', 1280, 720)
    }
    Write-Output 'PowerPoint rendered eight changed pages.'
} finally {
    if ($null -ne $taskPresentation) { $taskPresentation.Close() }
}
