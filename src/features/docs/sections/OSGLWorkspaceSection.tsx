import React from 'react';
import {
  AppWindow,
  Cpu,
  Database,
  Layers,
  Monitor,
  Palette,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../../../components/primitives';
import { Card } from '../../../components/composites';
import { DocsCodeBox } from '../components/DocsCodeBox';
import {
  OSGL_FEATURE_PILLARS,
  OSGL_FULL_INTEGRATION_SNIPPET,
  OSGL_MAGNETIC_AND_WINDOW_OPS_SNIPPET,
  OSGL_WIDGET_PERSISTENCE_SNIPPET,
  getOsglAppModelRows,
  getOsglShellPropsRows,
  getOsglSpatialHelpersRows,
} from '../data/osglDocsData';
import type { DocPropRow } from '../types';

export interface OSGLWorkspaceSectionProps {
  isTR: boolean;
}

function PropsTable({
  rows,
  isTR,
}: {
  rows: DocPropRow[];
  isTR: boolean;
}) {
  return (
    <div className="uxu-props-table-scroll">
      <table className="uxu-props-table">
        <thead>
          <tr>
            <th>Prop / Field</th>
            <th>{isTR ? 'Tip' : 'Type'}</th>
            <th>{isTR ? 'Varsayılan' : 'Default'}</th>
            <th>{isTR ? 'Açıklama' : 'Description'}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td>
                <code className="uxu-prop-name">{row.name}</code>
                {row.required && (
                  <Badge tone="danger" size="xs" style={{ marginLeft: 6 }}>
                    {isTR ? 'Zorunlu' : 'Required'}
                  </Badge>
                )}
              </td>
              <td>
                <code className="uxu-prop-type">{row.type}</code>
              </td>
              <td>
                <code>{row.defaultValue}</code>
              </td>
              <td>{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const OSGLWorkspaceSection: React.FC<OSGLWorkspaceSectionProps> = ({
  isTR,
}) => {
  const shellPropsRows = getOsglShellPropsRows(isTR);
  const appModelRows = getOsglAppModelRows(isTR);
  const spatialHelperRows = getOsglSpatialHelpersRows(isTR);

  return (
    <div className="uxu-stack-md">
      {/* 1. OVERVIEW: OSWorkspaceShell vs OSGLTemplate */}
      <Card
        id="doc-sec-osgl-overview"
        variant="glass"
        padding="md"
        eyebrow={isTR ? 'OSGL MASAÜSTÜ MOTORU' : 'OSGL DESKTOP ENGINE'}
        title={
          isTR
            ? 'OSWorkspaceShell ile Kendi Masaüstü Uygulamanızı Kurun'
            : 'Build Custom Desktop Apps with OSWorkspaceShell'
        }
        subtitle={
          isTR
            ? 'Demo kabuğu (OSGLTemplate) yerine parametrik OSWorkspaceShell bileşenini kullanarak tüm OSGL özelliklerini yeni uygulamanıza taşıyın.'
            : 'Use the parametric OSWorkspaceShell engine instead of the demo wrapper (OSGLTemplate) to carry every OSGL capability into your own app.'
        }
        headerIcon={<Monitor size={19} />}
      >
        <div className="uxu-stack-md">
          <div className="uxu-stage-grid-2">
            <div
              style={{
                padding: 14,
                borderRadius: 12,
                background: 'var(--uxu-surface-tonal)',
                border: '1px solid var(--uxu-border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <code style={{ fontWeight: 800, color: 'var(--uxu-primary)' }}>
                  OSWorkspaceShell
                </code>
                <Badge tone="success" size="xs">
                  {isTR ? 'Önerilen Motor' : 'Recommended Engine'}
                </Badge>
              </div>
              <p
                style={{
                  margin: '8px 0 0',
                  fontSize: '0.82rem',
                  color: 'var(--uxu-text-secondary)',
                  lineHeight: 1.55,
                }}
              >
                {isTR
                  ? 'Yeni uygulamalarda kullanılan parametrik çekirdek: kendi apps, dockAppIds, widgets, storageScopeKey, klasörler, WASM pencere yöneticisi, Tema Stüdyosu ve mobil başlatıcıyı eksiksiz sunar.'
                  : 'Parametric engine for production apps: brings your own apps, dockAppIds, widgets, storageScopeKey, folders, WASM window manager, OS Theme Studio, and mobile launcher.'}
              </p>
            </div>

            <div
              style={{
                padding: 14,
                borderRadius: 12,
                background: 'var(--uxu-surface-tonal)',
                border: '1px solid var(--uxu-border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <code style={{ fontWeight: 800, color: 'var(--uxu-text-primary)' }}>
                  OSGLTemplate / OSGLDemo
                </code>
                <Badge tone="neutral" size="xs">
                  {isTR ? 'Hazır Vitrin' : 'Showcase Demo'}
                </Badge>
              </div>
              <p
                style={{
                  margin: '8px 0 0',
                  fontSize: '0.82rem',
                  color: 'var(--uxu-text-secondary)',
                  lineHeight: 1.55,
                }}
              >
                {isTR
                  ? 'uxiGL vitrini için ön tanımlı kurumsal modüllerle (ERP, CRM, FileManGL, SheetGL) gelen hazır demo kabuğudur. Özel uygulama entegrasyonu için OSWorkspaceShell kullanın.'
                  : 'Pre-configured showcase wrapper with uxiGL demo apps. For custom applications, import OSWorkspaceShell directly.'}
              </p>
            </div>
          </div>

          <DocsCodeBox
            title={
              isTR
                ? 'Tam Kapsamlı OSWorkspaceShell Entegrasyonu (TypeScript)'
                : 'Complete OSWorkspaceShell Integration (TypeScript)'
            }
            code={OSGL_FULL_INTEGRATION_SNIPPET}
            isTR={isTR}
          />
        </div>
      </Card>

      {/* 2. PROPS & DATA MODELS */}
      <Card
        id="doc-sec-osgl-props"
        variant="glass"
        padding="md"
        eyebrow={isTR ? 'API SÖZLEŞMELERİ' : 'API CONTRACTS'}
        title={
          isTR
            ? 'OSWorkspaceShellProps & OSWorkspaceApp Referansı'
            : 'OSWorkspaceShellProps & OSWorkspaceApp Reference'
        }
        subtitle={
          isTR
            ? 'Yeni bir uygulamaya OSGL’nin tüm yeteneklerini geçirmek için desteklenen tüm prop ve uygulama alanları'
            : 'Every prop and app-descriptor field supported by OSWorkspaceShell'
        }
        headerIcon={<AppWindow size={19} />}
      >
        <div className="uxu-stack-md">
          <div>
            <div className="uxu-field__label" style={{ marginBottom: 8 }}>
              OSWorkspaceShellProps
            </div>
            <PropsTable rows={shellPropsRows} isTR={isTR} />
          </div>

          <div>
            <div className="uxu-field__label" style={{ marginBottom: 8 }}>
              OSWorkspaceApp
            </div>
            <PropsTable rows={appModelRows} isTR={isTR} />
          </div>
        </div>
      </Card>

      {/* 3. ALL 6 FEATURE PILLARS */}
      <Card
        id="doc-sec-osgl-features-matrix"
        variant="glass"
        padding="md"
        eyebrow={isTR ? 'TÜM OSGL ÖZELLİKLERİ' : 'ALL OSGL CAPABILITIES'}
        title={
          isTR
            ? 'Bir OSGL Çalışma Alanında Neler Var? (6 Ana Modül)'
            : 'What Is Included in an OSGL Workspace? (6 Core Pillars)'
        }
        subtitle={
          isTR
            ? 'Pencere yönetiminden masaüstü klasörlerine, Dock büyütmeden WebGL duvar kağıtlarına kadar tüm yerleşik özellikler'
            : 'From WASM window tiling and desktop folders to Dock magnification, widgets, and WebGL wallpapers'
        }
        headerIcon={<Layers size={19} />}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 14,
          }}
        >
          {OSGL_FEATURE_PILLARS.map((pillar) => (
            <div
              key={pillar.id}
              id={`doc-sec-osgl-${pillar.id}`}
              style={{
                padding: 14,
                borderRadius: 14,
                background: 'var(--uxu-surface-tonal)',
                border: '1px solid var(--uxu-border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <strong style={{ fontSize: '0.9rem' }}>
                  {isTR ? pillar.titleTr : pillar.titleEn}
                </strong>
                <Badge tone="primary" size="xs">
                  {pillar.badge}
                </Badge>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.78rem',
                  color: 'var(--uxu-text-secondary)',
                  lineHeight: 1.5,
                }}
              >
                {isTR ? pillar.summaryTr : pillar.summaryEn}
              </p>
              <ul
                style={{
                  margin: '4px 0 0',
                  paddingLeft: 18,
                  fontSize: '0.77rem',
                  color: 'var(--uxu-text-primary)',
                  lineHeight: 1.55,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                {(isTR ? pillar.bulletsTr : pillar.bulletsEn).map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      {/* 3.5 MAGNETIC MARGIN & WINDOW OPERATIONS API */}
      <Card
        id="doc-sec-osgl-magnetic-windows"
        variant="glass"
        padding="md"
        eyebrow={isTR ? 'MANYETİK BOŞLUK & PENCERE MOTORU' : 'MAGNETIC MARGIN & WINDOW ENGINE'}
        title={
          isTR
            ? 'Manyetik Boşluk (16px / 12px) & Gelişmiş Pencere İşlemleri API'
            : 'Magnetic Margin (16px / 12px) & Advanced Window Operations API'
        }
        subtitle={
          isTR
            ? 'Widget ve pencerelerin birbirine bitişik (flush) yapışmasını engelleyen manyetik hizalama ve 8 yönlü / 7 bölgeli pencere çözücüleri'
            : 'Spatial solvers preventing flush collisions with 16px widget & 12px window magnetic margins, live alignment guides, 8-way resize, and 7 snap zones'
        }
        headerIcon={<Cpu size={19} />}
      >
        <div className="uxu-stack-md">
          <PropsTable rows={spatialHelperRows} isTR={isTR} />
          <DocsCodeBox
            title={
              isTR
                ? 'Manyetik Boşluk & Pencere Snap Yardımcıları (TypeScript)'
                : 'Magnetic Margin & Window Snap Helpers (TypeScript)'
            }
            code={OSGL_MAGNETIC_AND_WINDOW_OPS_SNIPPET}
            isTR={isTR}
          />
        </div>
      </Card>

      {/* 4. WALLPAPERS, ICON STYLES & THEME STUDIO */}
      <Card
        id="doc-sec-osgl-theming"
        variant="tonal"
        padding="md"
        eyebrow={isTR ? 'GÖRÜNÜM & WEBGPU' : 'APPEARANCE & WEBGL'}
        title={
          isTR
            ? 'Duvar Kağıtları, Simge Stilleri & OS Tema Stüdyosu'
            : 'Wallpapers, Icon Styles & Built-in OS Theme Studio'
        }
        subtitle={
          isTR
            ? 'OSWorkspaceShell her uygulamaya otomatik olarak "os-theme-studio" sistem penceresini ekler'
            : 'OSWorkspaceShell automatically injects the "os-theme-studio" system app into every workspace'
        }
        headerIcon={<Palette size={19} />}
      >
        <div className="uxu-props-table-scroll">
          <table className="uxu-props-table">
            <thead>
              <tr>
                <th>{isTR ? 'Özellik Grubu' : 'Feature Group'}</th>
                <th>{isTR ? 'Desteklenen Değerler' : 'Supported Values'}</th>
                <th>{isTR ? 'Açıklama' : 'Notes'}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code className="uxu-prop-name">OSWallpaperId</code></td>
                <td>
                  <code>dijios-oxford</code>, <code>sequoia</code>, <code>sonoma</code>,{' '}
                  <code>ventura</code>, <code>monterey</code>, <code>bigsur</code>,{' '}
                  <code>midnight</code>
                </td>
                <td>
                  {isTR
                    ? '7 adet WebGL GLSL Aurora sahnesi (performans modunda CSS fallback).'
                    : '7 WebGL GLSL Aurora shaders with CSS gradient fallback in performance mode.'}
                </td>
              </tr>
              <tr>
                <td><code className="uxu-prop-name">BgMode</code></td>
                <td>
                  <code>aurora</code> | <code>gradient</code> | <code>solid</code> | <code>image</code>
                </td>
                <td>
                  {isTR
                    ? 'Shader, çift renkli özel gradyan, düz renk veya URL/dosya yükleme görseli.'
                    : 'Shader, dual-color custom gradient, solid color, or URL/uploaded image.'}
                </td>
              </tr>
              <tr>
                <td><code className="uxu-prop-name">IconBgStyle</code></td>
                <td>
                  <code>vivid</code> | <code>gradient</code> | <code>soft</code> |{' '}
                  <code>glass</code> | <code>sun</code> | <code>mono</code>
                </td>
                <td>
                  {isTR
                    ? '6 simge arka plan stili + 44–84px boyut kaydırıcısı + özel ikon/dolgu rengi.'
                    : '6 icon surface styles + 44–84px size slider + custom icon/background colors.'}
                </td>
              </tr>
              <tr>
                <td><code className="uxu-prop-name">QualityMode</code></td>
                <td>
                  <code>quality</code> | <code>performance</code>
                </td>
                <td>
                  {isTR
                    ? 'quality: WebGL + blur(26px); performance: düşük GPU yükü için statik arka plan.'
                    : 'quality: WebGL + blur(26px); performance: disables heavy shader/blur for low-power devices.'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* 5. SCOPED PERSISTENCE & WIDGET HELPERS */}
      <Card
        id="doc-sec-osgl-storage"
        variant="glass"
        padding="md"
        eyebrow={isTR ? 'KALICILIK & YARDIMCI API' : 'PERSISTENCE & HELPERS'}
        title={
          isTR
            ? 'Kapsamlı Durum Kalıcılığı & Widget Veri Yardımcıları'
            : 'Scoped State Persistence & Widget Data Helpers'
        }
        subtitle={
          isTR
            ? 'Her uygulama kendi storageScopeKey alanı altında pencereleri, klasörleri, Dock sıralamasını ve widget ayarlarını saklar'
            : 'Each workspace persists windows, folders, Dock order, and widget prefs under its own storageScopeKey'
        }
        headerIcon={<Database size={19} />}
      >
        <div className="uxu-stack-md">
          <div className="uxu-stage-row" style={{ flexWrap: 'wrap', gap: 8 }}>
            <Badge tone="info" size="sm">
              <Cpu size={13} style={{ marginRight: 5 }} />
              osWasmEngine
            </Badge>
            <Badge tone="primary" size="sm">
              <Sparkles size={13} style={{ marginRight: 5 }} />
              FocusTimerWidget
            </Badge>
            <Badge tone="success" size="sm">
              uxu.osgl.state.v4.&lt;scope&gt;
            </Badge>
            <Badge tone="warning" size="sm">
              uxu.osgl.widget.v2.&lt;scope&gt;.&lt;widget&gt;
            </Badge>
          </div>

          <DocsCodeBox
            title={
              isTR
                ? 'Durum ve Widget Verisi Okuma / Yazma'
                : 'Reading & Writing Scoped OSGL & Widget Data'
            }
            code={OSGL_WIDGET_PERSISTENCE_SNIPPET}
            isTR={isTR}
          />
        </div>
      </Card>
    </div>
  );
};

