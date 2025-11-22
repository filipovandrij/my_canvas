import { useMemo } from 'react'
import { Tabs, Tab } from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

function SidebarTabs() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()

  const value = useMemo(() => {
    if (location.pathname.startsWith('/collage')) return '/collage'
    return '/eraser'
  }, [location.pathname])

  return (
    <Tabs
      value={value}
      onChange={(_, v) => navigate(v)}
      variant="fullWidth"
      textColor="primary"
      indicatorColor="primary"
      sx={{ mb: 1 }}
    >
      <Tab value="/eraser" label={t('tab_pixelEraser')} />
      <Tab value="/collage" label={t('tab_photoCollage')} />
    </Tabs>
  )
}

export default SidebarTabs


