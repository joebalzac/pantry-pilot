import type { FoodIconName } from '../lib/foodIcons';
import type { CategoryId, ControlSize } from '../lib/tokens';
import { FoodIcon } from './icons/FoodIcon';
import { IconWell } from './ui/IconWell';

export type CategoryGlyphProps = {
  category: CategoryId;
  icon: FoodIconName;
  size?: ControlSize;
};

export function CategoryGlyph({category, icon, size = 'md'}: CategoryGlyphProps) {
  const iconSize = size === 'sm' ? 'md' : 'lg';
  return (
    <IconWell category={category} size={size}>
      <FoodIcon name={icon} size={iconSize} />
    </IconWell>
  );
}
