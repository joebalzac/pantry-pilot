import { AppHeader } from '../../components/AppHeader';
import { ChipLink } from '../../components/ui';
import { CATEGORY_LIST } from '../../lib/categories';
import {
  ELEVATION_TOKENS,
  PRIMITIVE_COLOR_RAMPS,
  RADIUS_TOKENS,
  SEMANTIC_COLOR_GROUPS,
  SPACE_TOKENS,
  TYPE_ROLES,
} from '../../lib/token-inventory';
import { ComponentShowcase } from './_components/ComponentShowcase';
import { DocSection } from './_components/DocSection';
import { Swatch } from './_components/Swatch';

const LAYERS = [
  {
    title: 'Primitives',
    copy: 'What it is: green-700, space-4, radius-sm. Never used in recipes.',
  },
  {
    title: 'Semantic',
    copy: 'What it means: color-text-primary, space-gap-md, color-action-danger.',
  },
  {
    title: 'Component + CV',
    copy: 'What it styles: button-primary-bg, badge-warning-fg, chip-selected-border.',
  },
] as const;

const SECTIONS = [
  {id: 'primitives', label: 'Primitives'},
  {id: 'semantic', label: 'Semantic'},
  {id: 'typography', label: 'Typography'},
  {id: 'space', label: 'Space'},
  {id: 'components', label: 'Components'},
] as const;

export default function DesignSystemPage() {
  return (
    <>
      <AppHeader eyebrow="Foundations" current="system" />
      <main className="ds-page">
        <section className="ds-intro">
          <p className="eyebrow">Token architecture</p>
          <h1 className="heading-xl">
            Primitive, semantic,
            <br />
            <em className="heading-display ds-intro__emphasis">component.</em>
          </h1>
          <p className="body-lg">
            Three layers. Primitives are raw values. Semantic tokens name intent. Component
            tokens and variants (CVs) are what UI recipes actually consume.
          </p>
        </section>

        <ol className="ds-layers">
          {LAYERS.map((layer, index) => (
            <li key={layer.title} className="ds-layer">
              <p className="eyebrow">Layer {index + 1}</p>
              <h2 className="ds-layer__title">{layer.title}</h2>
              <p>{layer.copy}</p>
            </li>
          ))}
        </ol>

        <nav className="ds-toc" aria-label="Design system sections">
          {SECTIONS.map((section) => (
            <ChipLink key={section.id} href={`#${section.id}`}>
              {section.label}
            </ChipLink>
          ))}
        </nav>

        <DocSection
          id="primitives"
          eyebrow="Layer 1"
          title="Primitive color"
          description="Ramps named by hue. Whole Foods green + department palette."
        >
          {Object.entries(PRIMITIVE_COLOR_RAMPS).map(([name, steps]) => (
            <div key={name} className="ds-ramp">
              <h3 className="ds-ramp-label">{name}</h3>
              {steps.map((step) => (
                <Swatch key={step} token={`--${name}-${step}`} />
              ))}
            </div>
          ))}
        </DocSection>

        <DocSection
          id="semantic"
          eyebrow="Layer 2"
          title="Semantic color"
          description="Named by intent so themes can remap without touching recipes."
        >
          {Object.entries(SEMANTIC_COLOR_GROUPS).map(([group, tokens]) => (
            <div key={group} className="ds-ramp">
              <h3 className="ds-ramp-label">{group}</h3>
              <div className="ds-intent-grid ds-ramp__full">
                {tokens.map((token) => (
                  <Swatch key={token} token={token} />
                ))}
              </div>
            </div>
          ))}

          <h3 className="ds-ramp-label">Departments</h3>
          <div className="ds-intent-grid">
            {CATEGORY_LIST.map((category) => (
              <div key={category.id} data-category={category.id}>
                <Swatch token="--category-accent" />
                <p className="caption">{category.id}</p>
              </div>
            ))}
          </div>
        </DocSection>

        <DocSection
          id="typography"
          eyebrow="Type roles"
          title="Typography"
          description="Nunito for UI. Fraunces for emphasis. Roles, not sizes, in recipes."
        >
          {TYPE_ROLES.map((role) => (
            <div key={role.token} className="ds-type-row">
              <code>{role.token}</code>
              <p className={role.className || undefined}>{role.sample}</p>
            </div>
          ))}
        </DocSection>

        <DocSection id="space" eyebrow="Scale" title="Space, radius, elevation">
          {/* Inline values below are the tokens being documented, not styling choices. */}
          {SPACE_TOKENS.map((token) => (
            <div key={token} className="ds-space-row">
              <code className="caption ds-space-row__label">{token.replace('--', '')}</code>
              <div className="ds-space-bar" style={{width: `var(${token})`}} />
            </div>
          ))}
          <div className="ds-radius-row">
            {RADIUS_TOKENS.map((token) => (
              <div key={token} className="ds-radius-demo" style={{borderRadius: `var(${token})`}}>
                {token.replace('--radius-', '')}
              </div>
            ))}
          </div>
          <div className="ds-elevation-row">
            {ELEVATION_TOKENS.map((token) => (
              <div key={token} className="ds-elevation-demo" style={{boxShadow: `var(${token})`}}>
                {token.replace('--elevation-', '')}
              </div>
            ))}
          </div>
        </DocSection>

        <DocSection
          id="components"
          eyebrow="Layer 3"
          title="Components & variants"
          description="Each recipe remaps local aliases onto component tokens."
        >
          <ComponentShowcase />
        </DocSection>
      </main>
      <footer className="site-footer">
        PantryPilot design system · Primitive → semantic → component
      </footer>
    </>
  );
}
