Add-Type -AssemblyName System.Drawing

$sourceDir = Join-Path $PSScriptRoot "..\assets\images"
$outputDir = Join-Path $sourceDir "optimized"

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$targets = @(
  @{ Source = "mama-joe-hero.jpeg"; Output = "mama-joe-hero.jpeg"; Width = 800; Height = 1000 },
  @{ Source = "mama-joe-letter-main.jpeg"; Output = "mama-joe-letter-main.jpeg"; Width = 800; Height = 1000 },
  @{ Source = "mama-joe-letter-accent.jpeg"; Output = "mama-joe-letter-accent.jpeg"; Width = 1200; Height = 750 },
  @{ Source = "mama-joe-gallery-01.jpeg"; Output = "mama-joe-gallery-01.jpeg"; Width = 720; Height = 900 },
  @{ Source = "mama-joe-gallery-02.jpeg"; Output = "mama-joe-gallery-02.jpeg"; Width = 720; Height = 900 },
  @{ Source = "mama-joe-gallery-03.jpeg"; Output = "mama-joe-gallery-03.jpeg"; Width = 1280; Height = 800 },
  @{ Source = "mama-joe-gallery-04.jpeg"; Output = "mama-joe-gallery-04.jpeg"; Width = 720; Height = 900 },
  @{ Source = "mama-joe-gallery-05.jpeg"; Output = "mama-joe-gallery-05.jpeg"; Width = 720; Height = 900 },
  @{ Source = "mama-joe-gallery-06.jpeg"; Output = "mama-joe-gallery-06.jpeg"; Width = 720; Height = 900 },
  @{ Source = "mama-joe-gallery-07.jpeg"; Output = "mama-joe-gallery-07.jpeg"; Width = 720; Height = 900 }
)

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object { $_.MimeType -eq "image/jpeg" }

$encoder = [System.Drawing.Imaging.Encoder]::Quality
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters 1
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($encoder, [long]82)

foreach ($target in $targets) {
  $sourcePath = Join-Path $sourceDir $target.Source
  $outputPath = Join-Path $outputDir $target.Output

  $sourceImage = [System.Drawing.Image]::FromFile($sourcePath)
  try {
    $sourceRatio = $sourceImage.Width / $sourceImage.Height
    $targetRatio = $target.Width / $target.Height

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

    $destination = New-Object System.Drawing.Bitmap $target.Width, $target.Height
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($destination)
      try {
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.DrawImage(
          $sourceImage,
          [System.Drawing.Rectangle]::new(0, 0, $target.Width, $target.Height),
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

Get-ChildItem $outputDir | Select-Object Name, Length
