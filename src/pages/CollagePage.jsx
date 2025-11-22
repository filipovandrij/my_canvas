import { useTranslation } from 'react-i18next'
import SidebarTabs from '../components/SidebarTabs.jsx'

function CollagePage() {
  const { t } = useTranslation()
  return (
    <div className="page">
      <div className="editor">
        <aside className="sidebar">
          <SidebarTabs />
          <div className="control" style={{ opacity: 0.8 }}>
            {t('collageHint')}
          </div>
        </aside>
        <div className="canvas-wrap" style={{ display: 'grid', placeItems: 'center' }}>
          <div className="empty-hint">
            {t('collagePlaceholder')}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CollagePage


