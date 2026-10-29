import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Sliders,
  X,
} from 'lucide-react';
import type { SidebarProps } from '../../../core/contracts/NavigationContract';
import { RouteService } from '../../../core/services/RouteService';
import { UXILogo } from '../../brand/UXILogo';
import { Avatar, Badge } from '../../primitives';

/**
 * ============================================================================
 * uxiGL COMPOSITE — HIERARCHICAL ENTERPRISE SIDEBAR WITH SUB-MENUS
 * ============================================================================
 * Classic UX multi-level navigation tree with expandable sub-menus, tree
 * connector lines, badge counters, and collapsible rail mode — crafted with
 * Apple HIG glass vibrancy & Google Material You tonal active states.
 *
 * SOLID Principles Applied:
 * - [SRP] Manages only navigation tree expansion and selection presentation.
 * - [OCP] Driven entirely by `SidebarNavGroup[]` data contract.
 */

export const Sidebar: React.FC<SidebarProps> = ({
  id,
  className = '',
  style,
  groups,
  activeItemId,
  activeSubItemId,
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
  onSelect,
  onOpenCommandPalette,
  onOpenThemeStudio,
  brandTitle,
  brandSubtitle,
  brandBadge,
  brandLogo,
  onBrandClick,
}) => {
  // Keep track of expanded parent menu IDs (default: expand key sections so sub-menus are accessible)
  const [expandedIds, setExpandedIds] = useState<string[]>([
    activeItemId,
    'elements',
    'docs-guide',
    'dashboard',
    'components-inputs',
    'components-surfaces',
    'components-feedback',
  ]);

  useEffect(() => {
    setExpandedIds((prev) =>
      prev.includes(activeItemId) ? prev : [...prev, activeItemId]
    );
  }, [activeItemId]);

  const toggleSubMenu = (itemId: string, hasSubItems: boolean, firstSubId?: string) => {
    if (!hasSubItems) {
      onSelect(itemId);
      onCloseMobile();
      return;
    }

    if (collapsed) {
      onToggleCollapse();
      onSelect(itemId, firstSubId);
      return;
    }

    setExpandedIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((idItem) => idItem !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="uxu-sidebar-backdrop"
          onClick={onCloseMobile}
          role="presentation"
        />
      )}

      <aside
        id={id}
        style={style}
        className={[
          'uxu-sidebar',
          collapsed ? 'uxu-sidebar--collapsed' : '',
          mobileOpen ? 'uxu-sidebar--mobile-open' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label="Ana Kenar Çubuğu Navigasyonu"
      >
        {/* Top Brand & Collapse Header */}
        <div className="uxu-sidebar__header">
          <a
            href="/"
            className="uxu-sidebar__brand"
            title={typeof brandTitle === 'string' ? brandTitle : 'Qmi'}
            onClick={(e) => {
              if (onBrandClick) {
                e.preventDefault();
                onBrandClick();
                return;
              }
              if (RouteService.isModifiedClick(e)) return;
              e.preventDefault();
              onSelect('landing', 'home');
            }}
          >
            {brandLogo !== undefined ? brandLogo : <UXILogo size={30} glow />}
            {!collapsed && (
              <div className="uxu-sidebar__brand-text">
                <div className="uxu-sidebar__brand-row">
                  {brandTitle !== undefined ? (
                    typeof brandTitle === 'string' ? (
                      <span className="uxu-brand__name">{brandTitle}</span>
                    ) : (
                      brandTitle
                    )
                  ) : (
                    <span className="uxu-brand__name">
                      uxi
                      <span
                        style={{
                          background:
                            'linear-gradient(110deg, #2FF58E 0%, #00C8FF 45%, #818CF8 75%, #C084FC 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        GL
                      </span>
                    </span>
                  )}
                  {brandBadge !== undefined ? (
                    typeof brandBadge === 'string' ? (
                      <Badge tone="primary" variant="tonal" size="xs">
                        {brandBadge}
                      </Badge>
                    ) : (
                      brandBadge
                    )
                  ) : (
                    <Badge tone="primary" variant="tonal" size="xs">
                      PRO
                    </Badge>
                  )}
                </div>
                {brandSubtitle !== undefined ? (
                  typeof brandSubtitle === 'string' ? (
                    <span className="uxu-sidebar__brand-sub">
                      {brandSubtitle}
                    </span>
                  ) : (
                    brandSubtitle
                  )
                ) : (
                  <span className="uxu-sidebar__brand-sub">
                    UX × UI × WebGL
                  </span>
                )}
              </div>
            )}
          </a>

          <button
            type="button"
            className="uxu-sidebar__collapse-btn uxu-hide-mobile"
            onClick={onToggleCollapse}
            title={collapsed ? 'Menüyü Genişlet' : 'Menüyü Daralt'}
            aria-label={collapsed ? 'Menüyü Genişlet' : 'Menüyü Daralt'}
          >
            {collapsed ? (
              <PanelLeftOpen size={17} />
            ) : (
              <PanelLeftClose size={17} />
            )}
          </button>

          <button
            type="button"
            className="uxu-sidebar__collapse-btn uxu-only-mobile"
            onClick={onCloseMobile}
            aria-label="Menüyü Kapat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Search / Spotlight Button inside Sidebar */}
        <div className="uxu-sidebar__search-box">
          <button
            type="button"
            className="uxu-sidebar__search-btn"
            onClick={onOpenCommandPalette}
            title="Spotlight Komut Paleti (⌘K)"
          >
            <Search size={14} className="uxu-sidebar__search-icon" />
            {!collapsed && (
              <>
                <span className="uxu-sidebar__search-text">
                  Hızlı ara...
                </span>
                <kbd className="uxu-sidebar__search-kbd">⌘K</kbd>
              </>
            )}
          </button>
        </div>

        {/* Scrollable Hierarchical Menu Groups & Sub-Menus */}
        <nav className="uxu-sidebar__nav">
          {groups.map((group) => (
            <div key={group.id} className="uxu-sidebar__group">
              {!collapsed && (
                <div className="uxu-sidebar__group-title">{group.title}</div>
              )}

              <ul className="uxu-sidebar__list">
                {group.items.map((item) => {
                  const hasSub = Boolean(item.subItems && item.subItems.length > 0);
                  const hasMatchingSub =
                    hasSub &&
                    Boolean(
                      item.subItems?.some((s) => s.id === activeSubItemId)
                    );
                  const isParentActive =
                    activeItemId === item.id ||
                    hasMatchingSub ||
                    (!hasSub &&
                      activeItemId === 'dashboard' &&
                      activeSubItemId === item.id);
                  const isExpanded =
                    expandedIds.includes(item.id) || hasMatchingSub;
                  const parentHref =
                    item.href ??
                    RouteService.buildPath(item.id, item.subItems?.[0]?.id);

                  return (
                    <li key={item.id} className="uxu-sidebar__li">
                      <a
                        href={parentHref}
                        target={parentHref.startsWith('http') ? '_blank' : undefined}
                        rel={parentHref.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className={[
                          'uxu-sidebar__item',
                          isParentActive ? 'uxu-sidebar__item--active' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        title={
                          collapsed
                            ? `${item.label} (${parentHref})`
                            : parentHref
                        }
                        onClick={(e) => {
                          if (RouteService.isModifiedClick(e)) return;
                          if (parentHref.startsWith('http')) return;
                          e.preventDefault();
                          if (hasSub) {
                            toggleSubMenu(
                              item.id,
                              true,
                              item.subItems?.[0]?.id
                            );
                            if (!isParentActive && item.subItems?.[0]) {
                              onSelect(item.id, item.subItems[0].id);
                            }
                          } else {
                            onSelect(item.id);
                            onCloseMobile();
                          }
                        }}
                      >
                        <span className="uxu-sidebar__item-icon">
                          {item.icon}
                        </span>

                        {!collapsed && (
                          <>
                            <span className="uxu-sidebar__item-label">
                              {item.label}
                            </span>

                            {item.badge !== undefined && (
                              <span
                                className={`uxu-sidebar__badge uxu-sidebar__badge--${item.badgeTone ?? 'primary'
                                  }`}
                              >
                                {item.badge}
                              </span>
                            )}

                            {hasSub && (
                              <span className="uxu-sidebar__chevron">
                                {isExpanded ? (
                                  <ChevronDown size={15} />
                                ) : (
                                  <ChevronRight size={15} />
                                )}
                              </span>
                            )}
                          </>
                        )}
                      </a>

                      {/* Classic Hierarchical Sub-Menu Tree */}
                      {!collapsed && hasSub && isExpanded && (
                        <ul className="uxu-sidebar__submenu">
                          {item.subItems!.map((sub) => {
                            const isSubActive =
                              isParentActive && activeSubItemId === sub.id;
                            const subHref =
                              sub.href ??
                              RouteService.buildPath(item.id, sub.id);

                            return (
                              <li
                                key={sub.id}
                                className="uxu-sidebar__submenu-li"
                              >
                                <a
                                  href={subHref}
                                  title={subHref}
                                  className={[
                                    'uxu-sidebar__subitem',
                                    isSubActive
                                      ? 'uxu-sidebar__subitem--active'
                                      : '',
                                  ]
                                    .filter(Boolean)
                                    .join(' ')}
                                  onClick={(e) => {
                                    if (RouteService.isModifiedClick(e)) return;
                                    e.preventDefault();
                                    onSelect(item.id, sub.id);
                                    onCloseMobile();
                                  }}
                                >
                                  {sub.icon ? (
                                    <span className="uxu-sidebar__subitem-icon mr-2 shrink-0 inline-flex items-center justify-center w-4 h-4">
                                      {sub.icon}
                                    </span>
                                  ) : (
                                    <span
                                      className="uxu-sidebar__subitem-dot"
                                      style={
                                        sub.dotColor
                                          ? { background: sub.dotColor }
                                          : undefined
                                      }
                                    />
                                  )}
                                  <span className="uxu-sidebar__subitem-label">
                                    {sub.label}
                                  </span>
                                  {sub.badge !== undefined && (
                                    <span
                                      className={`uxu-sidebar__subbadge uxu-sidebar__badge--${sub.badgeTone ?? 'neutral'
                                        }`}
                                    >
                                      {sub.badge}
                                    </span>
                                  )}
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom User Profile Bar */}
        <div className="uxu-sidebar__footer">
          <div className="uxu-sidebar__user-row">
            <Avatar
              name="Ümit Uz"
              status="online"
              size="sm"
              tone="primary"
              shape="squircle"
            />
            {!collapsed && (
              <div className="uxu-sidebar__user-meta">
                <span className="uxu-sidebar__user-name">Ümit Uz</span>
                <span className="uxu-sidebar__user-role">
                  Sistem Mimarı
                </span>
              </div>
            )}
            {!collapsed && (
              <button
                type="button"
                className="uxu-sidebar__settings-btn"
                onClick={onOpenThemeStudio}
                title="Tema & Görünüm Ayarları"
                aria-label="Tema ve Görünüm Ayarları"
              >
                <Sliders size={15} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
