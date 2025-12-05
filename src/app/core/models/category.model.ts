// Category Read DTO - returned from API
export interface CategoryReadDto {
  id: string;
  categoryName: string;
}

// Category Create DTO - for creating new category
export interface CategoryCreateDto {
  categoryName: string;
}

// Category Update DTO - for updating existing category
export interface CategoryUpdateDto {
  categoryName: string;
}
