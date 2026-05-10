Add-Type -AssemblyName System.Drawing

$sourceDir = Join-Path $PSScriptRoot "..\assets\images"
$outputDir = Join-Path $sourceDir "optimized"
$timelineSourceDir = Join-Path $sourceDir "timeline"
$timelineOutputDir = Join-Path $outputDir "timeline"

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
New-Item -ItemType Directory -Force -Path $timelineOutputDir | Out-Null

$targets = @(
  @{ Source = "mama-joe-hero.jpeg"; Output = "mama-joe-hero.jpeg"; Width = 800; Height = 1000 },
  @{ Source = "mama-joe-letter-main.jpeg"; Output = "mama-joe-letter-main.jpeg"; Width = 800; Height = 1000 },
  @{ Source = "mama-joe-letter-accent.jpeg"; Output = "mama-joe-letter-accent.jpeg"; Width = 960; Height = 600 },
  @{ Source = "mama-joe-gallery-01.jpeg"; Output = "mama-joe-gallery-01.jpeg"; Width = 720; Height = 900 },
  @{ Source = "mama-joe-gallery-02.jpeg"; Output = "mama-joe-gallery-02.jpeg"; Width = 720; Height = 900 },
  @{ Source = "mama-joe-gallery-03.jpeg"; Output = "mama-joe-gallery-03.jpeg"; Width = 960; Height = 600 },
  @{ Source = "mama-joe-gallery-04.jpeg"; Output = "mama-joe-gallery-04.jpeg"; Width = 720; Height = 900 },
  @{ Source = "mama-joe-gallery-05.jpeg"; Output = "mama-joe-gallery-05.jpeg"; Width = 720; Height = 900 },
  @{ Source = "mama-joe-gallery-06.jpeg"; Output = "mama-joe-gallery-06.jpeg"; Width = 720; Height = 900 },
  @{ Source = "mama-joe-gallery-07.jpeg"; Output = "mama-joe-gallery-07.jpeg"; Width = 720; Height = 900 }
)

$timelineTargets = @(
  @{ Source = "francis-school-first-time.jpeg"; Output = "francis-school-first-time.jpeg"; Width = 720; Height = 405 },
  @{ Source = "family-visit-nzulezu.jpeg"; Output = "family-visit-nzulezu.jpeg"; Width = 720; Height = 540 },
  @{ Source = "school-visit-food-for-friends.jpeg"; Output = "school-visit-food-for-friends.jpeg"; Width = 720; Height = 540 },
  @{ Source = "orphanage-visit-essentials.jpeg"; Output = "orphanage-visit-essentials.jpeg"; Width = 720; Height = 540 }
)

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object { $_.MimeType -eq "image/jpeg" }

$encoder = [System.Drawing.Imaging.Encoder]::Quality
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters 1
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($encoder, [long]70)

function Save-OptimizedImage {
  param (
    [string]$InputDir,
    [string]$OutputDir,
    [hashtable]$Target
  )

  $sourcePath = Join-Path $InputDir $Target.Source
  $outputPath = Join-Path $OutputDir $Target.Output

  $sourceImage = [System.Drawing.Image]::FromFile($sourcePath)
  try {
    $sourceRatio = $sourceImage.Width / $sourceImage.Height
    $targetRatio = $Target.Width / $Target.Height

    if ($sourceRatio -gt $targetRatio) {
      $cropHeight = $sourceImage.Height
      $cropWidth = [int]($cropHeight * $targetRatio)
      $cropX = [int](($sourceImage.Width - $cropWidth) / 2)
      $cropY = 0
    } else {
      $cropWidth = $sourceImage.Width
      $cropHeight = [int]($cropWidth / $targetRatio)
      $cropX = 0
      $cropY = [int](($sourceImage.Height - $cropHeight) / 2)
    }

    $scale = [Math]::Min(1, [Math]::Min($cropWidth / $Target.Width, $cropHeight / $Target.Height))
    $destinationWidth = [Math]::Max(1, [int][Math]::Round($Target.Width * $scale))
    $destinationHeight = [Math]::Max(1, [int][Math]::Round($Target.Height * $scale))

    $destination = New-Object System.Drawing.Bitmap $destinationWidth, $destinationHeight
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($destination)
      try {
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.DrawImage(
          $sourceImage,
          [System.Drawing.Rectangle]::new(0, 0, $destinationWidth, $destinationHeight),
          [System.Drawing.Rectangle]::new($cropX, $cropY, $cropWidth, $cropHeight),
          [System.Drawing.GraphicsUnit]::Pixel
        )
      } finally {
        $graphics.Dispose()
      }

      $destination.Save($outputPath, $jpegCodec, $encoderParams)
    } finally {
      $destination.Dispose()
    }
  } finally {
    $sourceImage.Dispose()
  }
}

foreach ($target in $targets) {
  Save-OptimizedImage -InputDir $sourceDir -OutputDir $outputDir -Target $target
}

foreach ($target in $timelineTargets) {
  Save-OptimizedImage -InputDir $timelineSourceDir -OutputDir $timelineOutputDir -Target $target
}

Get-ChildItem $outputDir -Recurse | Select-Object FullName, Length
