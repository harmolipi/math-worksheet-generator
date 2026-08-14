// Shared shape facts for the geometry types. Shape ids reference the icon
// library; the two custom asymmetric shapes ('scalene', 'lshape') are drawn
// inline by the symmetry type.

export const SHAPE_NAMES: Record<string, string> = {
  circle: 'circle',
  square: 'square',
  triangle: 'triangle',
  rectangle: 'rectangle',
  diamond: 'diamond',
  oval: 'oval',
  pentagon: 'pentagon',
  hexagon: 'hexagon',
  trapezoid: 'trapezoid',
  star: 'star',
  heart: 'heart',
  crescent: 'crescent',
};

/** Sides of straight-edged shapes (corners match for these convex shapes). */
export const SHAPE_SIDES: Record<string, number> = {
  triangle: 3,
  square: 4,
  rectangle: 4,
  diamond: 4,
  trapezoid: 4,
  pentagon: 5,
  hexagon: 6,
};

export const BASIC_SHAPES = ['circle', 'square', 'triangle', 'rectangle', 'oval', 'diamond'];
export const POLYGON_SHAPES = ['triangle', 'square', 'rectangle', 'diamond', 'pentagon', 'hexagon', 'trapezoid'];
export const CURVED_SHAPES = ['circle', 'oval', 'crescent', 'heart'];

/** Icon shapes that mirror exactly about a vertical line through center. */
export const VERTICALLY_SYMMETRIC = ['circle', 'square', 'rectangle', 'heart', 'star', 'oval', 'diamond'];
