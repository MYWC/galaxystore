$map = @{
  'Xiaomi 14.jpg' = 'xiaomi-14.jpg'
  'Xiaomi 14 Ultra.jpg' = 'xiaomi-14-ultra.jpg'
  'Xiaomi 14T.jpg' = 'xiaomi-14t.jpg'
  'Xiaomi 14T Pro.jpg' = 'xiaomi-14t-pro.jpg'
  'Xiaomi 15.jpg' = 'xiaomi-15.jpg'
  'Xiaomi 15 Ultra.jpg' = 'xiaomi-15-ultra.jpg'
  'Xiaomi 15T.jpg' = 'xiaomi-15t.jpg'
  'Xiaomi 15T Pro.jpg' = 'xiaomi-15t-pro.jpg'
  'Xiaomi 15S Pro.jpg' = 'xiaomi-15s-pro.jpg'
  'Xiaomi 17.jpg' = 'xiaomi-17.jpg'
  'Xiaomi 17 Pro.jpg' = 'xiaomi-17-pro.jpg'
  'Xiaomi 17 Pro Max.jpg' = 'xiaomi-17-pro-max.jpg'
  'Xiaomi 17 Ultra.jpg' = 'xiaomi-17-ultra.jpg'
  'Xiaomi MIX Flip.jpg' = 'xiaomi-mix-flip.jpg'
  'Xiaomi MIX Flip 2.jpg' = 'xiaomi-mix-flip-2.jpg'
  'Redmi Note 14 Pro.jpg' = 'redmi-note-14-pro.jpg'
  'Redmi Note 14 Pro+.jpg' = 'redmi-note-14-pro-plus.jpg'
  'Redmi Note 15 Pro.jpg' = 'redmi-note-15-pro.jpg'
  'Redmi Note 15 Pro+.jpg' = 'redmi-note-15-pro-plus.jpg'
  'Redmi Note 13 Pro.jpg' = 'redmi-note-13-pro.jpg'
  'Redmi 14C.jpg' = 'redmi-14c.jpg'
  'POCO F6.jpg' = 'poco-f6.jpg'
  'POCO F6 Pro.jpg' = 'poco-f6-pro.jpg'
  'POCO F7.jpg' = 'poco-f7.jpg'
  'POCO X6 Pro.jpg' = 'poco-x6-pro.jpg'
  'POCO X7 Pro.jpg' = 'poco-x7-pro.jpg'
  'POCO X8 Pro.jpg' = 'poco-x8-pro.jpg'
}

foreach ($old in $map.Keys) {
  if (Test-Path $old) {
    Rename-Item -Path $old -NewName $map[$old]
    Write-Host "✓ $old → $($map[$old])" -ForegroundColor Green
  } else {
    Write-Host "✗ $old پیدا نشد" -ForegroundColor Red
  }
}

Write-Host "`nتمام شد!" -ForegroundColor Cyan