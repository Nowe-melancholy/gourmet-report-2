import { ulid } from 'ulid';

export class Report {
  private readonly id: string;

  constructor(
    private readonly itemName: string,
    private readonly shopName: string,
    private readonly rating: number,
  ) {
    this.id = ulid();
    this.validateRating(rating);
  }

  private validateRating(rating: number): void {
    if (rating < 1 || rating > 5 || !this.isValidRatingStep(rating)) {
      throw new Error('Rating must be between 1 and 5 with 0.5 steps');
    }
  }

  private isValidRatingStep(rating: number): boolean {
    return rating * 2 % 1 === 0;
  }

  public getId(): string {
    return this.id;
  }

  public getItemName(): string {
    return this.itemName;
  }

  public getShopName(): string {
    return this.shopName;
  }

  public getRating(): number {
    return this.rating;
  }
} 